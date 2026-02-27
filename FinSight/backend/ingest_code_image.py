from __future__ import annotations

import asyncio
from datetime import datetime
from pathlib import Path

import pytesseract
from PIL import Image

from auth import get_password_hash, verify_password
from db import (
    close_mongo_connection,
    connect_to_mongo,
    get_transactions_collection,
    get_users_collection,
)
from main import configure_tesseract_binary, parse_transactions_from_text
from model_utils import predict_transaction

EMAIL = "dipanshu@gmail.com"
PASSWORD = "123456"
IMAGE_PATH = Path(r"C:\Users\shikh\Desktop\backend\code.jpeg")


async def ensure_user(email: str, password: str) -> str:
    users = get_users_collection()
    existing = await users.find_one({"email": email})
    if existing:
        if not verify_password(password, existing["hashed_password"]):
            raise ValueError(f"User exists but password does not match for {email}")
        return str(existing["_id"])

    doc = {
        "email": email,
        "hashed_password": get_password_hash(password),
        "name": "Dipanshu",
        "created_at": datetime.utcnow(),
    }
    result = await users.insert_one(doc)
    return str(result.inserted_id)


async def main() -> None:
    if not IMAGE_PATH.exists():
        raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

    configure_tesseract_binary()
    await connect_to_mongo()
    try:
        user_id = await ensure_user(EMAIL, PASSWORD)

        with Image.open(IMAGE_PATH) as image:
            ocr_text = pytesseract.image_to_string(image).strip()

        if not ocr_text:
            print("OCR returned empty text. Nothing inserted.")
            return

        parsed = parse_transactions_from_text(ocr_text)
        if not parsed:
            print("No amount-bearing lines found in OCR text. Nothing inserted.")
            return

        docs = []
        for txn in parsed:
            prediction = predict_transaction(txn["description"])
            docs.append(
                {
                    "user_id": user_id,
                    "description": txn["description"],
                    "amount": txn["amount"],
                    "date": txn["date"],
                    "category": prediction["category"],
                    "confidence": prediction["confidence"],
                    "created_at": datetime.utcnow(),
                    "source_image": str(IMAGE_PATH),
                }
            )

        result = await get_transactions_collection().insert_many(docs)
        print(f"User: {EMAIL} ({user_id})")
        print(f"Parsed transactions: {len(parsed)}")
        print(f"Inserted transactions: {len(result.inserted_ids)}")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
