from flask import Blueprint, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, unset_jwt_cookies
from marshmallow import Schema, fields, ValidationError
import json
import logging
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import requests
from oauthlib.oauth2 import WebApplicationClient
import jwt as pyjwt
from functools import wraps
import os

# Create a Blueprint
auth_blueprint = Blueprint('auth', __name__)

# Initialize extensions (to be initialized in main.py)
db = SQLAlchemy()
bcrypt = Bcrypt()

# OAuth 2.0 client setup
google_client = WebApplicationClient(os.getenv('GOOGLE_CLIENT_ID'))

# Logging setup
logging.basicConfig(level=logging.ERROR)

# Rate limiting decorator
def rate_limit(max_requests=100, window=60):
    def decorator(f):
        requests_dict = {}
        @wraps(f)
        def decorated_function(*args, **kwargs):
            now = datetime.utcnow().timestamp()
            ip = request.remote_addr
            
            if ip in requests_dict:
                requests_list = requests_dict[ip]
                requests_list = [req for req in requests_list if now - req < window]
                
                if len(requests_list) >= max_requests:
                    return jsonify({"error": "Too many requests"}), 429
                
                requests_list.append(now)
                requests_dict[ip] = requests_list
            else:
                requests_dict[ip] = [now]
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Marshmallow Schemas
class RegisterSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    bio = fields.Str(load_default="")
    education = fields.List(fields.Dict(), load_default=[])
    work_experience = fields.List(fields.Dict(), load_default=[])
    skills = fields.List(fields.Str(), load_default=[])
    projects = fields.List(fields.Str(), load_default=[])
    certifications = fields.List(fields.Str(), load_default=[])
    linkedin = fields.Str(load_default="")
    github = fields.Str(load_default="")
    privacy_settings = fields.Dict(load_default={})

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String, nullable=True)  # Nullable for OAuth users
    bio = db.Column(db.Text)
    education = db.Column(db.ARRAY(db.String))
    work_experience = db.Column(db.ARRAY(db.String))
    skills = db.Column(db.ARRAY(db.String))
    projects = db.Column(db.ARRAY(db.String))
    certifications = db.Column(db.ARRAY(db.String))
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))
    privacy_settings = db.Column(db.JSON, default={})
    apple_user_id = db.Column(db.String(255), unique=True)
    google_user_id = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Register a new user
@auth_blueprint.route('/register', methods=['POST'])
@rate_limit(100, 3600)  # 100 requests per hour
def register():
    data = request.get_json()
    schema = RegisterSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    hashed_password = bcrypt.generate_password_hash(validated_data['password']).decode('utf-8')
    new_user = User(
        name=validated_data['name'],
        email=validated_data['email'],
        password=hashed_password,
        bio=validated_data.get('bio'),
        education=json.dumps(validated_data.get('education')),
        work_experience=json.dumps(validated_data.get('work_experience')),
        skills=json.dumps(validated_data.get('skills')),
        projects=json.dumps(validated_data.get('projects')),
        certifications=json.dumps(validated_data.get('certifications')),
        linkedin=validated_data.get('linkedin'),
        github=validated_data.get('github'),
        privacy_settings=json.dumps(validated_data.get('privacy_settings'))
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created successfully."}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered."}), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error registering user: {str(e)}")
        return jsonify({"error": "An error occurred during registration."}), 500

# Login a user and generate a JWT token
@auth_blueprint.route('/login', methods=['POST'])
@rate_limit(10, 60)  # 10 requests per minute
def login():
    data = request.get_json()
    schema = LoginSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    user = User.query.filter_by(email=validated_data['email']).first()

    if user and bcrypt.check_password_hash(user.password, validated_data['password']):
        access_token = create_access_token(
            identity=user.id,
            additional_claims={"email": user.email}
        )
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200
    else:
        return jsonify({"error": "Invalid email or password."}), 401

# Apple Login
@auth_blueprint.route('/apple/login')
def apple_login():
    return redirect(os.getenv('APPLE_AUTH_URL'))

@auth_blueprint.route('/apple/callback', methods=['POST'])
def apple_callback():
    try:
        token = request.json.get('id_token')
        # Verify token with Apple's public key
        decoded = pyjwt.decode(token, verify=False)
        
        apple_user_id = decoded.get('sub')
        email = decoded.get('email')
        name = request.json.get('user', {}).get('name', {}).get('firstName', '')
        
        user = User.query.filter_by(apple_user_id=apple_user_id).first()
        if not user:
            user = User(
                name=name,
                email=email,
                apple_user_id=apple_user_id
            )
            db.session.add(user)
            db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token}), 200
        
    except Exception as e:
        logging.error(f"Apple login error: {str(e)}")
        return jsonify({"error": "Authentication failed"}), 400

# Google Login
@auth_blueprint.route('/google/login')
def google_login():
    return redirect(os.getenv('GOOGLE_AUTH_URL'))

@auth_blueprint.route('/google/callback')
def google_callback():
    try:
        code = request.args.get('code')
        token_endpoint = "https://oauth2.googleapis.com/token"
        
        token_response = requests.post(
            token_endpoint,
            data={
                'code': code,
                'client_id': os.getenv('GOOGLE_CLIENT_ID'),
                'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
                'redirect_uri': os.getenv('GOOGLE_REDIRECT_URI'),
                'grant_type': 'authorization_code'
            }
        )
        
        id_token = token_response.json()['id_token']
        google_user_info = pyjwt.decode(id_token, verify=False)
        
        user = User.query.filter_by(google_user_id=google_user_info['sub']).first()
        if not user:
            user = User(
                name=google_user_info.get('name'),
                email=google_user_info.get('email'),
                google_user_id=google_user_info['sub']
            )
            db.session.add(user)
            db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token}), 200
        
    except Exception as e:
        logging.error(f"Google login error: {str(e)}")
        return jsonify({"error": "Authentication failed"}), 400

# Fetch the logged-in user's profile
@auth_blueprint.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user:
        return jsonify({
            'name': user.name,
            'email': user.email,
            'bio': user.bio,
            'education': json.loads(user.education) if user.education else [],
            'work_experience': json.loads(user.work_experience) if user.work_experience else [],
            'skills': json.loads(user.skills) if user.skills else [],
            'projects': json.loads(user.projects) if user.projects else [],
            'certifications': json.loads(user.certifications) if user.certifications else [],
            'linkedin': user.linkedin,
            'github': user.github,
            'privacy_settings': json.loads(user.privacy_settings) if user.privacy_settings else {}
        }), 200
    else:
        return jsonify({"error": "User not found."}), 404

# Validate token
@auth_blueprint.route('/validate', methods=['GET'])
@jwt_required()
def validate_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify({
            "valid": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }), 200
    return jsonify({"valid": False}), 401

# Logout user
@auth_blueprint.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200
