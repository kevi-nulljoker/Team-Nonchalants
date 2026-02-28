#!/usr/bin/env python3
import os
from datetime import datetime, timedelta
from pathlib import Path

import bcrypt
import jwt
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument, errors

# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

# Configuration
MONGO_URI = os.getenv(
    'MONGO_URI',
    'mongodb+srv://shikharsaxena7777_db_user:Codecode123@globathon.rl4ckeo.mongodb.net/?appName=Globathon',
)
DB_NAME = os.getenv('DB_NAME', 'Users')
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'c84d3aa356344f5e0b93915b9d16b073f')
JWT_ALGORITHM = 'HS256'
TOKEN_EXPIRE_DAYS = 7
INITIAL_USER_POINTS = int(os.getenv('INITIAL_USER_POINTS', '100'))

ACTION_POINTS = {
    'goal_created': 50,
    'goal_completed_short': 200,
    'goal_completed_mid': 500,
    'goal_completed_long': 1000,
    'quiz_completed': 100,
}

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
db = client[DB_NAME]
profiles_collection = db['profiles']
point_transactions_collection = db['point_transactions']
_indexes_ready = False

app = Flask(__name__)
CORS(app)


def _json_error(message: str, status: int = 400):
    return jsonify({'detail': message}), status


def _get_profiles_collection():
    global _indexes_ready
    try:
        client.admin.command('ping')
        if not _indexes_ready:
            profiles_collection.create_index('email', unique=True)
            point_transactions_collection.create_index([('user_id', 1), ('created_at', -1)])
            _indexes_ready = True
        return profiles_collection, None
    except errors.PyMongoError as exc:
        return None, str(exc)


def _to_object_id(user_id: str):
    try:
        return ObjectId(user_id)
    except Exception:
        return None


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


def _serialize_transaction(txn: dict):
    return {
        'id': str(txn.get('_id')),
        'user_id': str(txn.get('user_id')),
        'action': txn.get('action'),
        'change': txn.get('change', 0),
        'balance_after': txn.get('balance_after', 0),
        'metadata': txn.get('metadata', {}),
        'created_at': txn.get('created_at').isoformat() if txn.get('created_at') else None,
    }


def _record_point_transaction(user_oid: ObjectId, action: str, change: int, metadata: dict | None = None):
    metadata = metadata or {}

    users_collection, db_error = _get_profiles_collection()
    if users_collection is None:
        return None, f'Database unavailable: {db_error}', 503

    try:
        current_user = users_collection.find_one({'_id': user_oid}, {'total_points': 1, 'points': 1})
    except errors.PyMongoError as exc:
        return None, f'Database error while reading user points: {exc}', 500

    if not current_user:
        return None, 'User not found', 404

    current_points = int(current_user.get('total_points', current_user.get('points', INITIAL_USER_POINTS)))
    if change < 0 and current_points + change < 0:
        return None, 'Insufficient points to complete this action', 400

    now = datetime.utcnow()

    try:
        updated_user = users_collection.find_one_and_update(
            {'_id': user_oid},
            {
                '$inc': {'total_points': change, 'points': change},
                '$set': {'updated_at': now},
            },
            return_document=ReturnDocument.AFTER,
        )

        balance_after = int(updated_user.get('total_points', updated_user.get('points', 0)))
        transaction = {
            'user_id': user_oid,
            'action': action,
            'change': change,
            'balance_after': balance_after,
            'metadata': metadata,
            'created_at': now,
        }
        result = point_transactions_collection.insert_one(transaction)
        transaction['_id'] = result.inserted_id

        return {
            'total_points': balance_after,
            'transaction': _serialize_transaction(transaction),
        }, None, 200
    except errors.PyMongoError as exc:
        return None, f'Database error while updating points: {exc}', 500


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

        now = datetime.utcnow()
        user = {
            'email': email,
            'hashed_password': hash_password(password),
            'name': name,
            'total_points': INITIAL_USER_POINTS,
            'points': INITIAL_USER_POINTS,
            'created_at': now,
            'updated_at': now,
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
            'total_points': INITIAL_USER_POINTS,
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

    total_points = int(user.get('total_points', user.get('points', INITIAL_USER_POINTS)))
    token = create_token(str(user['_id']), user['email'])
    return jsonify(
        {
            'access_token': token,
            'token_type': 'bearer',
            'user_id': str(user['_id']),
            'total_points': total_points,
        }
    )


@app.route('/users/<user_id>/points', methods=['GET'])
def get_points(user_id: str):
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return _json_error('Invalid user_id format', 400)

    users_collection, db_error = _get_profiles_collection()
    if users_collection is None:
        return _json_error(f'Database unavailable: {db_error}', 503)

    try:
        user = users_collection.find_one({'_id': user_oid}, {'total_points': 1, 'points': 1})
    except errors.PyMongoError as exc:
        return _json_error(f'Database error while fetching points: {exc}', 500)

    if not user:
        return _json_error('User not found', 404)

    total_points = int(user.get('total_points', user.get('points', INITIAL_USER_POINTS)))
    return jsonify({'user_id': user_id, 'total_points': total_points})


@app.route('/users/<user_id>/point-transactions', methods=['GET'])
def list_point_transactions(user_id: str):
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return _json_error('Invalid user_id format', 400)

    limit_raw = request.args.get('limit', '50')
    try:
        limit = max(1, min(int(limit_raw), 200))
    except ValueError:
        return _json_error('limit must be an integer', 400)

    _, db_error = _get_profiles_collection()
    if db_error:
        return _json_error(f'Database unavailable: {db_error}', 503)

    try:
        docs = list(
            point_transactions_collection.find({'user_id': user_oid})
            .sort('created_at', -1)
            .limit(limit)
        )
    except errors.PyMongoError as exc:
        return _json_error(f'Database error while fetching transactions: {exc}', 500)

    return jsonify({'transactions': [_serialize_transaction(tx) for tx in docs]})


@app.route('/users/<user_id>/points/award', methods=['POST'])
def award_points(user_id: str):
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return _json_error('Invalid user_id format', 400)

    data = request.get_json(silent=True) or {}
    action = str(data.get('action', '')).strip()

    if action == 'goal_completed':
        term = str(data.get('goal_term', '')).strip().lower()
        action = f'goal_completed_{term}'

    if action not in ACTION_POINTS:
        valid = ', '.join(sorted(ACTION_POINTS.keys()) + ['goal_completed (+ goal_term: short|mid|long)'])
        return _json_error(f'Unsupported action. Allowed actions: {valid}', 400)

    amount = ACTION_POINTS[action]
    metadata = data.get('metadata', {}) if isinstance(data.get('metadata'), dict) else {}

    if action.startswith('goal_completed_'):
        metadata.setdefault('goal_term', action.removeprefix('goal_completed_'))

    result, err, status = _record_point_transaction(user_oid, action, amount, metadata)
    if err:
        return _json_error(err, status)

    return jsonify(result), 201


@app.route('/users/<user_id>/points/deduct', methods=['POST'])
def deduct_points(user_id: str):
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return _json_error('Invalid user_id format', 400)

    data = request.get_json(silent=True) or {}
    action = str(data.get('action', '')).strip() or 'course_unlocked_paid'

    if action != 'course_unlocked_paid':
        return _json_error('Only course_unlocked_paid is supported for deductions', 400)

    course_cost = data.get('course_cost')
    if not isinstance(course_cost, int) or course_cost <= 0:
        return _json_error('course_cost must be a positive integer', 400)

    metadata = data.get('metadata', {}) if isinstance(data.get('metadata'), dict) else {}
    metadata.setdefault('course_cost', course_cost)

    result, err, status = _record_point_transaction(user_oid, action, -course_cost, metadata)
    if err:
        return _json_error(err, status)

    return jsonify(result), 201


@app.route('/users/<user_id>/quiz-results', methods=['POST'])
def save_quiz_results(user_id: str):
    user_oid = _to_object_id(user_id)
    if not user_oid:
        return _json_error('Invalid user_id format', 400)

    data = request.get_json(silent=True) or {}
    profile = data.get('profile')
    answers = data.get('answers')

    if not isinstance(profile, dict):
        return _json_error('profile must be an object', 400)
    if answers is not None and not isinstance(answers, dict):
        return _json_error('answers must be an object when provided', 400)

    users_collection, db_error = _get_profiles_collection()
    if users_collection is None:
        return _json_error(f'Database unavailable: {db_error}', 503)

    now = datetime.utcnow()
    try:
        updated = users_collection.find_one_and_update(
            {'_id': user_oid},
            {
                '$set': {
                    'quiz_profile': profile,
                    'quiz_answers': answers or {},
                    'quiz_completed_at': now,
                    'updated_at': now,
                }
            },
            return_document=ReturnDocument.AFTER,
        )
    except errors.PyMongoError as exc:
        return _json_error(f'Database error while saving quiz results: {exc}', 500)

    if not updated:
        return _json_error('User not found', 404)

    return jsonify(
        {
            'user_id': user_id,
            'quiz_profile': updated.get('quiz_profile', {}),
            'quiz_completed_at': updated.get('quiz_completed_at').isoformat() if updated.get('quiz_completed_at') else None,
        }
    ), 200


if __name__ == '__main__':
    auth_port = int(os.getenv('AUTH_PORT', '8001'))
    app.run(host='0.0.0.0', port=auth_port, debug=True)
