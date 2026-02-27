from __future__ import annotations

import os
import re
import shutil
import sys
import tempfile
from datetime import date as DateType
from datetime import datetime
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

import pytesseract
from fastapi import FastAPI, File, HTTPException, UploadFile, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field, EmailStr

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from model_utils import predict_transaction
from db import connect_to_mongo, close_mongo_connection, get_users_collection, get_transactions_collection
from auth import verify_password, get_password_hash, create_access_token, get_current_user

# ---------- Tesseract Configuration ----------
def configure_tesseract_binary() -> None:
    env_cmd_raw = os.getenv("TESSERACT_CMD", "")
    env_cmd = env_cmd_raw.split("#", 1)[0].strip() if env_cmd_raw else None
    candidates = [
        env_cmd,
        shutil.which("tesseract"),
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        "/opt/anaconda3/bin/tesseract",
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    for candidate in candidates:
        if candidate and os.path.exists(candidate):
            pytesseract.pytesseract.tesseract_cmd = candidate
            return

configure_tesseract_binary()

# ---------- Regex Patterns ----------
AMOUNT_RE = re.compile(r"(?<!\d)(?:INR|Rs\.?|₹)?\s*([+-]?\d[\d,]*\.?\d{0,2})(?!\d)", re.IGNORECASE)
DATE_RE = re.compile(r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b")

# ---------- Pydantic Models ----------
class ManualRequest(BaseModel):
    description: str = Field(..., min_length=1)
    amount: float
    date: Optional[DateType] = None

class PredictedTransaction(BaseModel):
    description: str
    amount: Optional[float] = None
    date: Optional[DateType] = None
    category: str
    confidence: Optional[float] = None

class UploadResponse(BaseModel):
    ocr_text: str
    transactions: list[PredictedTransaction]

# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str

# ---------- OCR Helpers ----------
def _parse_date(raw_date: str) -> Optional[DateType]:
    formats = ["%d/%m/%Y", "%d/%m/%y", "%d-%m-%Y", "%d-%m-%y", "%m/%d/%Y", "%m-%d-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(raw_date, fmt).date()
        except ValueError:
            continue
    return None

def _extract_amount(line: str) -> Optional[float]:
    matches = AMOUNT_RE.findall(line)
    if not matches:
        return None
    raw = matches[-1].replace(",", "").strip()
    try:
        return float(raw)
    except ValueError:
        return None

def _extract_date(line: str) -> Optional[DateType]:
    match = DATE_RE.search(line)
    if not match:
        return None
    return _parse_date(match.group(1))

def _clean_description(line: str) -> str:
    text = DATE_RE.sub("", line)
    text = AMOUNT_RE.sub("", text)
    text = re.sub(r"\s+", " ", text).strip(" -:\t")
    return text

def parse_transactions_from_text(text: str) -> list[dict]:
    transactions = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        amount = _extract_amount(line)
        if amount is None:
            continue
        txn_date = _extract_date(line)
        description = _clean_description(line) or line
        transactions.append({
            "description": description,
            "amount": amount,
            "date": txn_date,
        })
    return transactions

def ocr_from_upload(file: UploadFile) -> str:
    suffix = Path(file.filename or "").suffix or ".png"
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(file.file.read())
        with Image.open(temp_path) as image:
            text = pytesseract.image_to_string(image)
        return text.strip()
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Invalid or unsupported image file") from exc
    except pytesseract.TesseractNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Tesseract OCR binary not found on server") from exc
    except pytesseract.TesseractError as exc:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {exc}") from exc
    finally:
        file.file.close()
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ---------- FastAPI App ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="Transaction OCR + Classifier API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# ---------- Health Check ----------
@app.get("/health")
async def health():
    return {"status": "ok"}

# ---------- Authentication Endpoints ----------
@app.post("/register")
async def register(user: UserCreate):
    users = get_users_collection()
    existing = await users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "hashed_password": hashed,
        "name": user.name,
        "created_at": datetime.utcnow()
    }
    result = await users.insert_one(new_user)
    return {"id": str(result.inserted_id), "email": user.email, "name": user.name}

@app.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    users = get_users_collection()
    db_user = await users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(db_user["_id"]), "email": db_user["email"]})
    return TokenResponse(access_token=token, user_id=str(db_user["_id"]))

# ---------- Protected Endpoints ----------
@app.post("/upload", response_model=UploadResponse)
async def upload_statement(
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme)
):
    # Authenticate user
    current_user = await get_current_user(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    # OCR and classification
    ocr_text = ocr_from_upload(file)
    transactions = parse_transactions_from_text(ocr_text)

    predicted_transactions: list[PredictedTransaction] = []
    for txn in transactions:
        result = predict_transaction(txn["description"])
        pt = PredictedTransaction(
            description=txn["description"],
            amount=txn["amount"],
            date=txn["date"],
            category=result["category"],
            confidence=result["confidence"],
        )
        predicted_transactions.append(pt)

    # Save to MongoDB
    if predicted_transactions:
        trans_collection = get_transactions_collection()
        docs = []
        for pt in predicted_transactions:
            doc = pt.dict()
            doc["user_id"] = current_user["id"]
            doc["created_at"] = datetime.utcnow()
            docs.append(doc)
        await trans_collection.insert_many(docs)

    return UploadResponse(ocr_text=ocr_text, transactions=predicted_transactions)

@app.get("/transactions")
async def get_user_transactions(
    token: str = Depends(oauth2_scheme),
    limit: int = 100,
    skip: int = 0
):
    current_user = await get_current_user(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid token")
    trans_collection = get_transactions_collection()
    cursor = trans_collection.find({"user_id": current_user["id"]}).sort("date", -1).skip(skip).limit(limit)
    transactions = await cursor.to_list(length=limit)
    # Convert ObjectId to string
    for t in transactions:
        t["_id"] = str(t["_id"])
    return transactions

@app.post("/manual")
async def manual_prediction(payload: ManualRequest) -> dict:
    result = predict_transaction(payload.description)
    response = {
        "description": payload.description,
        "amount": payload.amount,
        "date": payload.date,
        "category": result["category"],
        "confidence": result["confidence"],
    }
    return response

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
