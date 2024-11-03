from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from datetime import timedelta

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure the SQLAlchemy part of the app instance
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://jaganyetukuri:your_password@localhost/jaganyetukuri'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super_secret_key')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt_secret_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Create the SQLAlchemy db instance
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    bio = db.Column(db.Text)
    education = db.Column(db.Text)
    work_experience = db.Column(db.Text)
    skills = db.Column(db.ARRAY(db.String))
    projects = db.Column(db.ARRAY(db.String))
    certifications = db.Column(db.ARRAY(db.String))
    publications = db.Column(db.ARRAY(db.String))
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))
    privacy_settings = db.Column(db.JSON, default={})

# Initialize the database (use this to create tables if they don't exist)
@app.route('/init', methods=['POST'])
def init_db():
    db.create_all()
    return jsonify({"message": "Database initialized."}), 200

# Register a new user
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ("name", "email", "password")):
        return jsonify({"error": "Missing required fields."}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        bio=data.get('bio', ''),
        education=data.get('education', ''),
        work_experience=data.get('work_experience', ''),
        skills=data.get('skills', []),
        projects=data.get('projects', []),
        certifications=data.get('certifications', []),
        publications=data.get('publications', []),
        linkedin=data.get('linkedin', ''),
        github=data.get('github', ''),
        privacy_settings=data.get('privacy_settings', {})
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
        return jsonify({"error": str(e)}), 500

# Login a user and generate a JWT token
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "access_token": access_token}), 200
    else:
        return jsonify({"error": "Invalid email or password."}), 401

# Profile route to fetch the logged-in user’s data
@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user:
        return jsonify({
            'name': user.name,
            'email': user.email,
            'bio': user.bio,
            'education': user.education,
            'work_experience': user.work_experience,
            'skills': user.skills,
            'projects': user.projects,
            'certifications': user.certifications,
            'publications': user.publications,
            'linkedin': user.linkedin,
            'github': user.github,
            'privacy_settings': user.privacy_settings
        }), 200
    else:
        return jsonify({"error": "User not found."}), 404

# Profile update route
@app.route('/profile/update', methods=['POST'])
@jwt_required()
def update_profile():
    data = request.get_json()
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user:
        user.bio = data.get('bio', user.bio)
        user.education = data.get('education', user.education)
        user.work_experience = data.get('work_experience', user.work_experience)
        user.skills = data.get('skills', user.skills)
        user.projects = data.get('projects', user.projects)
        user.certifications = data.get('certifications', user.certifications)
        user.publications = data.get('publications', user.publications)
        user.linkedin = data.get('linkedin', user.linkedin)
        user.github = data.get('github', user.github)
        user.privacy_settings = data.get('privacy_settings', user.privacy_settings)
        
        db.session.commit()
        return jsonify({"message": "Profile updated successfully."}), 200
    else:
        return jsonify({"error": "User not found."}), 404

# Settings route to fetch and update user settings
@app.route('/settings', methods=['GET', 'POST'])
@jwt_required()
def settings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if request.method == 'GET':
        if user:
            return jsonify({
                'privacy_settings': user.privacy_settings
            }), 200
        else:
            return jsonify({"error": "User not found."}), 404
    elif request.method == 'POST':
        data = request.get_json()
        if user:
            user.privacy_settings = data.get('privacy_settings', user.privacy_settings)
            db.session.commit()
            return jsonify({"message": "Settings updated successfully."}), 200
        else:
            return jsonify({"error": "User not found."}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5002, debug=True)
