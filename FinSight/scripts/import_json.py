#!/usr/bin/env python3
"""
Import the latest JSON file from Transactions/output into MongoDB.

Supported input shapes:
1) Top-level list of transaction objects.
2) Converter payload with nested results[].transactions.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pymongo import MongoClient, errors

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

MONGO_URI = os.getenv("MONGO_URI", "").strip()
DB_NAME = os.getenv("DB_NAME", "Users").strip() or "Users"
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "transactions").strip() or "transactions"

OUTPUT_FOLDER = BASE_DIR.parent / "Transactions" / "output"


def get_latest_json_file(folder: Path) -> Path | None:
    """Return the newest .json file by modified time from folder."""
    if not folder.exists():
        print(f"ERROR: Output folder not found: {folder}")
        return None

    json_files = list(folder.glob("*.json"))
    if not json_files:
        print("INFO: No JSON files found in output folder.")
        return None

    return max(json_files, key=lambda f: f.stat().st_mtime)


def _extract_transactions(payload: Any) -> list[dict[str, Any]]:
    """Normalize known JSON payloads to a flat list of transaction dicts."""
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]

    if not isinstance(payload, dict):
        return []

    direct_transactions = payload.get("transactions")
    if isinstance(direct_transactions, list):
        return [row for row in direct_transactions if isinstance(row, dict)]

    results = payload.get("results")
    if not isinstance(results, list):
        return []

    flattened: list[dict[str, Any]] = []
    for item in results:
        if not isinstance(item, dict):
            continue

        image_name = item.get("image")
        txns = item.get("transactions")
        if not isinstance(txns, list):
            continue

        for tx in txns:
            if not isinstance(tx, dict):
                continue
            row = dict(tx)
            if image_name and "image" not in row:
                row["image"] = image_name
            flattened.append(row)

    return flattened


def import_json_to_mongo(file_path: Path, user_id: str | None = None) -> bool:
    """Read JSON file and insert all normalized transactions into MongoDB."""
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: JSON decode error in {file_path.name}: {exc}")
        return False
    except OSError as exc:
        print(f"ERROR: Failed to read {file_path.name}: {exc}")
        return False

    transactions = _extract_transactions(data)
    if not transactions:
        print("ERROR: No transactions found in JSON payload.")
        return False

    now = datetime.now(timezone.utc)
    prepared: list[dict[str, Any]] = []
    for tx in transactions:
        row = dict(tx)
        row["created_at"] = now
        row.setdefault("source", "json_import")
        row.setdefault("source_file", file_path.name)
        if user_id:
            row["user_id"] = user_id
        prepared.append(row)

    client: MongoClient | None = None
    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=10000,
            tlsAllowInvalidCertificates=True,
        )
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        result = collection.insert_many(prepared)
        print(f"OK: Inserted {len(result.inserted_ids)} transactions from {file_path.name}")
        return True

    except errors.BulkWriteError as exc:
        print(f"ERROR: Bulk write error: {exc.details}")
        return False
    except errors.PyMongoError as exc:
        print(f"ERROR: MongoDB error: {exc}")
        return False
    finally:
        if client is not None:
            client.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Import converted transaction JSON into MongoDB")
    parser.add_argument("--user-id", dest="user_id", default="", help="Attach transactions to a specific user id")
    parser.add_argument(
        "--source-file",
        dest="source_file",
        default="",
        help="Specific JSON file to import (absolute path or name inside Transactions/output)",
    )
    args = parser.parse_args()

    if not MONGO_URI:
        print("ERROR: MONGO_URI is missing. Set it in scripts/.env")
        return

    latest: Path | None = None
    if args.source_file:
        candidate = Path(args.source_file)
        if not candidate.is_absolute():
            candidate = OUTPUT_FOLDER / candidate
        if not candidate.exists():
            print(f"ERROR: source file not found: {candidate}")
            return
        latest = candidate
    else:
        print("Looking for latest JSON file...")
        latest = get_latest_json_file(OUTPUT_FOLDER)

    if latest is None:
        return

    modified = datetime.fromtimestamp(latest.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
    print(f"Found: {latest.name} (modified {modified})")
    import_json_to_mongo(latest, user_id=(args.user_id or "").strip() or None)


if __name__ == "__main__":
    main()
