#!/usr/bin/env python3
import os
from datetime import datetime, timedelta
from pathlib import Path

import bcrypt
import jwt
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, errors

# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

# Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://shikharsaxena7777_db_user:Codecode123@globathon.rl4ckeo.mongodb.net/?appName=Globathon')
DB_NAME = os.getenv('DB_NAME', 'Users')
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'c84d3aa356344f5e0b93915b9d16b073f')
JWT_ALGORITHM = 'HS256'
TOKEN_EXPIRE_DAYS = 7
INITIAL_USER_POINTS = 100

# MongoDB client setup (lazy network checks in request flow)
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
db = client[DB_NAME]
profiles_collection = db['profiles']
_indexes_ready = False

app = Flask(__name__)
CORS(app)


def _get_profiles_collection():
    global _indexes_ready
    try:
        client.admin.command('ping')
        if not _indexes_ready:
            profiles_collection.create_index('email', unique=True)
            _indexes_ready = True
        return profiles_collection, None
    except errors.PyMongoError as exc:
        return None, str(exc)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_token(user_id: str, email: str) -> str:
    payload = {
        'sub': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@app.route('/health', methods=['GET'])
def health():
    _, db_error = _get_profiles_collection()
    if db_error:
        return jsonify({'status': 'degraded', 'database': 'unreachable', 'detail': db_error}), 200
    return jsonify({'status': 'ok', 'database': 'connected'}), 200


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'detail': 'Invalid JSON'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    if not email or not password:
        return jsonify({'detail': 'Email and password required'}), 400

    users_collection, db_error = _get_profiles_collection()
    if users_collection is None:
        return jsonify({'detail': f'Database unavailable: {db_error}'}), 503

    try:
        if users_collection.find_one({'email': email}, {'_id': 1}):
            return jsonify({'detail': 'Email already registered'}), 400

        user = {
            'email': email,
            'hashed_password': hash_password(password),
            'name': name,
            'points': INITIAL_USER_POINTS,
            'created_at': datetime.utcnow(),
        }
        result = users_collection.insert_one(user)
    except errors.DuplicateKeyError:
        return jsonify({'detail': 'Email already registered'}), 400
    except errors.PyMongoError as exc:
        return jsonify({'detail': f'Database error while creating profile: {exc}'}), 500

    user_id = str(result.inserted_id)
    token = create_token(user_id, email)

    return jsonify(
        {
            'id': user_id,
            'user_id': user_id,
            'email': email,
            'name': name,
            'points': INITIAL_USER_POINTS,
            'access_token': token,
            'token_type': 'bearer',
        }
    ), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'detail': 'Invalid JSON'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'detail': 'Email and password required'}), 400

    users_collection, db_error = _get_profiles_collection()
    if users_collection is None:
        return jsonify({'detail': f'Database unavailable: {db_error}'}), 503

    try:
        user = users_collection.find_one({'email': email})
    except errors.PyMongoError as exc:
        return jsonify({'detail': f'Database error while logging in: {exc}'}), 500

    if not user:
        return jsonify({'detail': 'Invalid credentials'}), 401

    hashed_password = user.get('hashed_password')
    if not hashed_password or not verify_password(password, hashed_password):
        return jsonify({'detail': 'Invalid credentials'}), 401

    token = create_token(str(user['_id']), user['email'])
    return jsonify(
        {
            'access_token': token,
            'token_type': 'bearer',
            'user_id': str(user['_id']),
        }
    )


if __name__ == '__main__':
    auth_port = int(os.getenv('AUTH_PORT', '8001'))
    app.run(host='0.0.0.0', port=auth_port, debug=True)
