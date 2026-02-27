from __future__ import annotations

import os
import json
import re
import shutil
import statistics
import sys
import tempfile
from collections import Counter, defaultdict
from datetime import date as DateType
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import pytesseract
from fastapi import Body, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

from model_utils import predict_transaction

app = FastAPI(title="Transaction OCR + Classifier API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AMOUNT_RE = re.compile(r"(?<!\d)(?:INR|Rs\.?)?\s*([+-]?\d[\d,]*\.?\d{0,2})(?!\d)", re.IGNORECASE)
DATE_RE = re.compile(r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b")
DATE_ONLY_RE = re.compile(r"^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$")
HAS_ALPHA_RE = re.compile(r"[A-Za-z]")
CURRENCY_AMOUNT_RE = re.compile(r"(?:INR|Rs\.?)\s*[+-]?\d[\d,]*\.?\d{0,2}", re.IGNORECASE)

NOISE_KEYWORDS = {
    "credited",
    "debited",
    "opening balance",
    "closing balance",
    "credited to",
    "debited from",
    "available balance",
    "account balance",
}

CREDIT_KEYWORDS = {"credit", "credited", "salary", "refund", "cr"}
DEBIT_KEYWORDS = {"debit", "debited", "purchase", "payment", "withdrawal", "dr"}

# In-memory ledger so /summary and /insights can run directly after /manual or /upload.
TRANSACTION_LEDGER: list["PredictedTransaction"] = []
BASE_DIR = Path(__file__).resolve().parent
LEDGER_PATH = BASE_DIR / "ledger_transactions.json"
WORKSPACE_DIR = BASE_DIR.parent
IMAGES_DIR = WORKSPACE_DIR / "images"
OUTPUTS_DIR = WORKSPACE_DIR / "output"
SUPPORTED_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tif", ".tiff"}


class ManualRequest(BaseModel):
    description: str = Field(..., min_length=1)
    amount: float
    date: Optional[DateType] = None


class PredictedTransaction(BaseModel):
    date: Optional[DateType] = None
    description: str
    amount: float
    type: str
    category: str
    confidence: Optional[float] = None
    uncertain: bool


class InsightTransaction(BaseModel):
    date: Optional[DateType] = None
    description: Optional[str] = None
    amount: float
    type: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    uncertain: Optional[bool] = None


class PeriodBreakdown(BaseModel):
    total_spent: float
    total_credit: float
    category_breakdown: dict[str, float]


class SummaryResponse(BaseModel):
    total_spent: float
    total_credit: float
    category_breakdown: dict[str, float]
    daily_breakdown: dict[str, PeriodBreakdown]
    monthly_breakdown: dict[str, PeriodBreakdown]


class IrregularSpendingItem(BaseModel):
    description: str
    amount: float
    category: str
    reason: str


class LargeTransactionItem(BaseModel):
    date: Optional[DateType] = None
    description: str
    amount: float
    category: str


class InsightsResponse(BaseModel):
    total_spent: float
    total_credit: float
    top_category: Optional[str]
    category_breakdown: dict[str, float]
    irregular_spending: list[IrregularSpendingItem]
    recurring_transactions: list[str]
    large_transactions: list[LargeTransactionItem]
    daily_breakdown: dict[str, PeriodBreakdown]
    monthly_breakdown: dict[str, PeriodBreakdown]


class LedgerStats(BaseModel):
    count: int
    latest_date: Optional[DateType]
    latest_description: Optional[str]


def configure_tesseract_binary() -> None:
    env_cmd = os.getenv("TESSERACT_CMD")
    candidates = [
        env_cmd,
        shutil.which("tesseract"),
        "/opt/anaconda3/bin/tesseract",
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    for candidate in candidates:
        if candidate and os.path.exists(candidate):
            pytesseract.pytesseract.tesseract_cmd = candidate
            return


configure_tesseract_binary()


def _normalize_spaces(line: str) -> str:
    return re.sub(r"\s+", " ", line.replace("\t", " ")).strip()


def _is_noise_line(line: str) -> bool:
    lowered = line.lower()
    return any(keyword in lowered for keyword in NOISE_KEYWORDS)


def _parse_date(raw_date: str) -> Optional[DateType]:
    formats = ["%d/%m/%Y", "%d/%m/%y", "%d-%m-%Y", "%d-%m-%y", "%m/%d/%Y", "%m-%d-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(raw_date, fmt).date()
        except ValueError:
            continue
    return None


def _extract_date(line: str) -> Optional[DateType]:
    match = DATE_RE.search(line)
    if not match:
        return None
    return _parse_date(match.group(1))


def _is_date_only_line(line: str) -> bool:
    return bool(DATE_ONLY_RE.fullmatch(line))


def _extract_amount(line: str) -> Optional[float]:
    try:
        currency_matches = list(CURRENCY_AMOUNT_RE.finditer(line))
    except re.error:
        return None

    if currency_matches:
        token = currency_matches[-1].group(0)
        numeric_match = re.search(r"[+-]?\d[\d,]*\.?\d{0,2}", token)
        if numeric_match:
            raw = numeric_match.group(0).replace(",", "").strip()
            try:
                return float(raw)
            except ValueError:
                return None

    try:
        matches = AMOUNT_RE.findall(line)
    except re.error:
        return None

    if not matches:
        return None

    raw = matches[-1].replace(",", "").strip()
    try:
        return float(raw)
    except ValueError:
        return None


def _infer_transaction_type(line: str, amount: float) -> str:
    lowered = line.lower()
    if any(word in lowered for word in CREDIT_KEYWORDS):
        return "credit"
    if any(word in lowered for word in DEBIT_KEYWORDS):
        return "debit"
    return "credit" if amount < 0 else "debit"


def _normalize_type(txn_type: Optional[str], amount: float) -> str:
    lowered = (txn_type or "").strip().lower()
    if lowered in {"credit", "debit"}:
        return lowered
    return "credit" if amount < 0 else "debit"


def _extract_description_for_classification(line: str) -> str:
    text = DATE_RE.sub(" ", line)

    # Prefer removing an explicit currency amount token so the rest of the line stays intact.
    amount_token = CURRENCY_AMOUNT_RE.search(text)
    if amount_token:
        text = f"{text[:amount_token.start()]} {text[amount_token.end():]}"
    else:
        # Fallback: remove only the last numeric amount candidate, not all numbers.
        amount_candidates = list(AMOUNT_RE.finditer(text))
        if amount_candidates:
            last_amount = amount_candidates[-1]
            text = f"{text[:last_amount.start()]} {text[last_amount.end():]}"

    text = re.sub(r"\b(INR|Rs\.?|CR|DR)\b", " ", text, flags=re.IGNORECASE)
    text = _normalize_spaces(text)
    return text.strip("-:,| ")


def _has_meaningful_description(description: str) -> bool:
    return bool(description and HAS_ALPHA_RE.search(description))


def _to_insight_transaction(txn: PredictedTransaction) -> InsightTransaction:
    return InsightTransaction(
        date=txn.date,
        description=txn.description,
        amount=txn.amount,
        type=txn.type,
        category=txn.category,
        confidence=txn.confidence,
        uncertain=txn.uncertain,
    )


def _resolve_transactions(transactions: Optional[list[InsightTransaction]]) -> list[InsightTransaction]:
    if transactions:
        return transactions
    return [_to_insight_transaction(txn) for txn in TRANSACTION_LEDGER]


def _store_transactions(transactions: list[PredictedTransaction]) -> None:
    TRANSACTION_LEDGER.extend(transactions)
    _save_ledger_to_disk()


def _txn_to_json(txn: PredictedTransaction) -> dict[str, Any]:
    payload = txn.model_dump()
    if txn.date:
        payload["date"] = txn.date.isoformat()
    return payload


def _txn_from_json(data: dict[str, Any]) -> Optional[PredictedTransaction]:
    date_raw = data.get("date")
    parsed_date: Optional[DateType] = None
    if isinstance(date_raw, str) and date_raw:
        try:
            parsed_date = DateType.fromisoformat(date_raw)
        except ValueError:
            parsed_date = None
    try:
        return PredictedTransaction(
            date=parsed_date,
            description=str(data.get("description", "Transaction")),
            amount=float(data.get("amount", 0)),
            type=str(data.get("type", "debit")),
            category=str(data.get("category", "Uncategorized")),
            confidence=data.get("confidence"),
            uncertain=bool(data.get("uncertain", False)),
        )
    except Exception:
        return None


def _save_ledger_to_disk() -> None:
    try:
        rows = [_txn_to_json(txn) for txn in TRANSACTION_LEDGER]
        LEDGER_PATH.write_text(json.dumps(rows, indent=2), encoding="utf-8")
    except Exception:
        # Persistence errors should not block primary API flows.
        pass


def _load_ledger_from_disk() -> None:
    if not LEDGER_PATH.exists():
        return
    try:
        raw = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
        if not isinstance(raw, list):
            return
        loaded: list[PredictedTransaction] = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            txn = _txn_from_json(item)
            if txn:
                loaded.append(txn)
        TRANSACTION_LEDGER.clear()
        TRANSACTION_LEDGER.extend(loaded)
    except Exception:
        return


_load_ledger_from_disk()


def parse_transactions_from_text(text: str) -> list[dict[str, Any]]:
    transactions: list[dict[str, Any]] = []

    for raw_line in text.splitlines():
        try:
            line = _normalize_spaces(raw_line)
            if not line or _is_noise_line(line) or _is_date_only_line(line):
                continue

            amount = _extract_amount(line)
            if amount is None or amount <= 0:
                continue

            txn_date = _extract_date(line)
            txn_type = _infer_transaction_type(line, amount)
            description = _extract_description_for_classification(line)
            if not _has_meaningful_description(description):
                continue

            transactions.append(
                {
                    "date": txn_date,
                    "description": description,
                    "amount": round(abs(amount), 2),
                    "type": txn_type,
                }
            )
        except Exception:
            continue

    return transactions


def _build_prediction_payload(
    *,
    description: str,
    amount: float,
    txn_type: str,
    txn_date: Optional[DateType],
) -> PredictedTransaction:
    prediction = predict_transaction(description)
    confidence = prediction.get("confidence")
    uncertain = bool(confidence is not None and confidence < 0.6)
    category = str(prediction.get("category", "Uncategorized"))
    if uncertain:
        category = "others"

    return PredictedTransaction(
        date=txn_date,
        description=description,
        amount=round(abs(float(amount)), 2),
        type=txn_type,
        category=category,
        confidence=confidence,
        uncertain=uncertain,
    )


def _empty_period() -> dict[str, Any]:
    return {"total_spent": 0.0, "total_credit": 0.0, "category_breakdown": defaultdict(float)}


def _to_period_response(raw: dict[str, dict[str, Any]]) -> dict[str, PeriodBreakdown]:
    result: dict[str, PeriodBreakdown] = {}
    for key in sorted(raw.keys()):
        bucket = raw[key]
        categories = {cat: round(val, 2) for cat, val in bucket["category_breakdown"].items()}
        result[key] = PeriodBreakdown(
            total_spent=round(bucket["total_spent"], 2),
            total_credit=round(bucket["total_credit"], 2),
            category_breakdown=categories,
        )
    return result


def _compute_base_summary(transactions: list[InsightTransaction]) -> SummaryResponse:
    total_spent = 0.0
    total_credit = 0.0
    category_breakdown: dict[str, float] = defaultdict(float)

    daily_raw: dict[str, dict[str, Any]] = defaultdict(_empty_period)
    monthly_raw: dict[str, dict[str, Any]] = defaultdict(_empty_period)

    for txn in transactions:
        amount = abs(float(txn.amount))
        txn_type = _normalize_type(txn.type, txn.amount)
        category = (txn.category or "Uncategorized").strip() or "Uncategorized"

        day_key = txn.date.isoformat() if txn.date else "Undated"
        month_key = txn.date.strftime("%Y-%m") if txn.date else "Undated"

        if txn_type == "credit":
            total_credit += amount
            daily_raw[day_key]["total_credit"] += amount
            monthly_raw[month_key]["total_credit"] += amount
            continue

        total_spent += amount
        category_breakdown[category] += amount

        daily_raw[day_key]["total_spent"] += amount
        monthly_raw[month_key]["total_spent"] += amount
        daily_raw[day_key]["category_breakdown"][category] += amount
        monthly_raw[month_key]["category_breakdown"][category] += amount

    return SummaryResponse(
        total_spent=round(total_spent, 2),
        total_credit=round(total_credit, 2),
        category_breakdown={k: round(v, 2) for k, v in category_breakdown.items()},
        daily_breakdown=_to_period_response(daily_raw),
        monthly_breakdown=_to_period_response(monthly_raw),
    )


def _compute_insights(transactions: list[InsightTransaction]) -> InsightsResponse:
    safe_txns = transactions
    summary = _compute_base_summary(safe_txns)
    category_breakdown = defaultdict(float, summary.category_breakdown)

    debit_by_category: dict[str, list[InsightTransaction]] = defaultdict(list)
    debit_amounts: list[float] = []
    description_counter: Counter[str] = Counter()

    for txn in safe_txns:
        amount = abs(float(txn.amount))
        txn_type = _normalize_type(txn.type, txn.amount)
        category = (txn.category or "Uncategorized").strip() or "Uncategorized"
        description = (txn.description or "").strip()

        if description:
            description_counter[description.lower()] += 1

        if txn_type == "debit":
            debit_by_category[category].append(txn)
            debit_amounts.append(amount)

    top_category: Optional[str] = None
    if category_breakdown:
        top_category = max(category_breakdown.items(), key=lambda item: item[1])[0]

    irregular_spending: list[IrregularSpendingItem] = []
    for category, txns in debit_by_category.items():
        amounts = [abs(float(txn.amount)) for txn in txns]
        if len(amounts) < 2:
            continue

        mean_amount = statistics.mean(amounts)
        std_dev = statistics.pstdev(amounts)
        if std_dev == 0:
            continue

        for txn in txns:
            amount = abs(float(txn.amount))
            z_score = (amount - mean_amount) / std_dev
            if z_score > 2:
                irregular_spending.append(
                    IrregularSpendingItem(
                        description=(txn.description or "Transaction").strip() or "Transaction",
                        amount=round(amount, 2),
                        category=category,
                        reason="Statistical anomaly",
                    )
                )

    recurring_transactions = sorted(
        {
            (txn.description or "").strip()
            for txn in safe_txns
            if (txn.description or "").strip() and description_counter[(txn.description or "").strip().lower()] >= 3
        }
    )

    large_transactions: list[LargeTransactionItem] = []
    if debit_amounts:
        avg_debit = statistics.mean(debit_amounts)
        threshold = 2 * avg_debit
        for txn in safe_txns:
            amount = abs(float(txn.amount))
            txn_type = _normalize_type(txn.type, txn.amount)
            if txn_type != "debit" or amount <= threshold:
                continue
            large_transactions.append(
                LargeTransactionItem(
                    date=txn.date,
                    description=(txn.description or "Transaction").strip() or "Transaction",
                    amount=round(amount, 2),
                    category=(txn.category or "Uncategorized").strip() or "Uncategorized",
                )
            )

    return InsightsResponse(
        total_spent=summary.total_spent,
        total_credit=summary.total_credit,
        top_category=top_category,
        category_breakdown=summary.category_breakdown,
        irregular_spending=irregular_spending,
        recurring_transactions=recurring_transactions,
        large_transactions=large_transactions,
        daily_breakdown=summary.daily_breakdown,
        monthly_breakdown=summary.monthly_breakdown,
    )


def ocr_from_upload(file: UploadFile) -> str:
    suffix = Path(file.filename or "").suffix or ".png"
    temp_path: Optional[str] = None

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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected OCR error: {exc}") from exc
    finally:
        file.file.close()
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


def ocr_from_image_path(image_path: Path) -> str:
    try:
        with Image.open(image_path) as image:
            text = pytesseract.image_to_string(image)
        return text.strip()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Image not found: {image_path.name}") from exc
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid or unsupported image file: {image_path.name}") from exc
    except pytesseract.TesseractNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Tesseract OCR binary not found on server") from exc
    except pytesseract.TesseractError as exc:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected OCR error: {exc}") from exc


def _recent_image_files(count: int) -> list[Path]:
    if count < 1:
        raise HTTPException(status_code=400, detail="count must be at least 1")
    if not IMAGES_DIR.exists() or not IMAGES_DIR.is_dir():
        raise HTTPException(status_code=404, detail=f"Images folder not found: {IMAGES_DIR}")

    image_files = [path for path in IMAGES_DIR.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_SUFFIXES]
    if not image_files:
        raise HTTPException(status_code=404, detail=f"No image files found in {IMAGES_DIR}")

    image_files.sort(key=lambda path: max(path.stat().st_ctime, path.stat().st_mtime), reverse=True)
    return image_files[:count]


def convert_latest_images_to_json(count: int = 1) -> dict[str, Any]:
    selected_images = _recent_image_files(count)
    grouped_results: list[dict[str, Any]] = []
    all_predictions: list[PredictedTransaction] = []

    for image_path in selected_images:
        ocr_text = ocr_from_image_path(image_path)
        parsed_transactions = parse_transactions_from_text(ocr_text)

        image_predictions: list[PredictedTransaction] = []
        for txn in parsed_transactions:
            image_predictions.append(
                _build_prediction_payload(
                    description=str(txn["description"]),
                    amount=float(txn["amount"]),
                    txn_type=str(txn["type"]),
                    txn_date=txn["date"] if isinstance(txn["date"], DateType) else None,
                )
            )

        all_predictions.extend(image_predictions)
        grouped_results.append(
            {
                "image": image_path.name,
                "transaction_count": len(image_predictions),
                "transactions": [_txn_to_json(txn) for txn in image_predictions],
            }
        )

    if all_predictions:
        _store_transactions(all_predictions)

    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = OUTPUTS_DIR / f"converted_{timestamp}.json"
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "images_folder": str(IMAGES_DIR),
        "images_processed": [image.name for image in selected_images],
        "results": grouped_results,
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    return {
        "output_file": str(output_path),
        "images_processed": [image.name for image in selected_images],
        "total_images": len(selected_images),
        "total_transactions": len(all_predictions),
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ledger", response_model=list[PredictedTransaction])
def get_ledger() -> list[PredictedTransaction]:
    return TRANSACTION_LEDGER


@app.get("/ledger/stats", response_model=LedgerStats)
def ledger_stats() -> LedgerStats:
    if not TRANSACTION_LEDGER:
        return LedgerStats(count=0, latest_date=None, latest_description=None)
    last = TRANSACTION_LEDGER[-1]
    return LedgerStats(count=len(TRANSACTION_LEDGER), latest_date=last.date, latest_description=last.description)


@app.delete("/ledger")
def clear_ledger() -> dict[str, str]:
    TRANSACTION_LEDGER.clear()
    _save_ledger_to_disk()
    return {"status": "cleared"}


@app.post("/manual", response_model=PredictedTransaction)
def manual_prediction(payload: ManualRequest) -> PredictedTransaction:
    txn = _build_prediction_payload(
        description=payload.description.strip(),
        amount=payload.amount,
        txn_type=_normalize_type(None, payload.amount),
        txn_date=payload.date,
    )
    _store_transactions([txn])
    return txn


@app.post("/upload", response_model=list[PredictedTransaction])
def upload_statement(file: UploadFile = File(...)) -> list[PredictedTransaction]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    ocr_text = ocr_from_upload(file)
    parsed_transactions = parse_transactions_from_text(ocr_text)

    output: list[PredictedTransaction] = []
    for txn in parsed_transactions:
        output.append(
            _build_prediction_payload(
                description=str(txn["description"]),
                amount=float(txn["amount"]),
                txn_type=str(txn["type"]),
                txn_date=txn["date"] if isinstance(txn["date"], DateType) else None,
            )
        )

    _store_transactions(output)
    return output


@app.post("/convert/latest-local")
def convert_latest_local_images(count: int = 1) -> dict[str, Any]:
    return convert_latest_images_to_json(count=count)


@app.get("/summary", response_model=SummaryResponse)
def summary_from_ledger() -> SummaryResponse:
    txns = _resolve_transactions(None)
    return _compute_base_summary(txns)


@app.post("/summary", response_model=SummaryResponse)
def summary_from_body(transactions: Optional[list[InsightTransaction]] = Body(default=None)) -> SummaryResponse:
    txns = _resolve_transactions(transactions)
    return _compute_base_summary(txns)


@app.get("/insights", response_model=InsightsResponse)
def insights_from_ledger() -> InsightsResponse:
    return _compute_insights(_resolve_transactions(None))


@app.post("/insights", response_model=InsightsResponse)
def insights(transactions: Optional[list[InsightTransaction]] = Body(default=None)) -> InsightsResponse:
    return _compute_insights(_resolve_transactions(transactions))


if __name__ == "__main__":
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser(description="Transaction OCR + classifier service")
    parser.add_argument(
        "--convert-latest",
        action="store_true",
        help="Convert the newest image file(s) from ../images into JSON under ../output.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=1,
        help="Number of most-recent images to process when --convert-latest is used.",
    )
    args = parser.parse_args()

    if args.convert_latest:
        try:
            result = convert_latest_images_to_json(count=args.count)
            print(json.dumps(result, indent=2))
        except HTTPException as exc:
            print(f"Error {exc.status_code}: {exc.detail}")
            sys.exit(1)
        sys.exit(0)

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
