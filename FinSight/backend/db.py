from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = None
db = None

def _sanitize_mongo_uri(uri: str | None) -> str:
    if not uri:
        raise ValueError("MONGO_URI is not set")
    if "://" not in uri:
        return uri

    scheme, rest = uri.split("://", 1)
    authority, sep, tail = rest.partition("/")
    if "@" not in authority:
        return uri

    userinfo, hostinfo = authority.rsplit("@", 1)
    if ":" not in userinfo:
        return uri

    username, password = userinfo.split(":", 1)
    safe_user = quote_plus(username)
    safe_pass = quote_plus(password)
    safe_authority = f"{safe_user}:{safe_pass}@{hostinfo}"
    return f"{scheme}://{safe_authority}{sep}{tail}"

async def connect_to_mongo():
    global client, db
    safe_uri = _sanitize_mongo_uri(MONGO_URI)
    if not DB_NAME:
        raise ValueError("DB_NAME is not set")
    client = AsyncIOMotorClient(safe_uri)
    db = client[DB_NAME]
    print("Connected to MongoDB")

async def close_mongo_connection():
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_users_collection():
    return db.users

def get_transactions_collection():
    return db.transactions
