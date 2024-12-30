from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
import os
from dotenv import load_dotenv
from marshmallow import Schema, fields, ValidationError

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure the app
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:Jagan%579@localhost:5432/postgres')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '69c8d9875c5af04bbe11a5fbe334cd7bea1eb36c968af9b631c000c939d48ee')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '69c8d9875c5af04bbe11a5fbe334cd7bea1eb36c968af9b631c000c939d48ee7')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    bio = db.Column(db.Text)
    education = db.Column(db.ARRAY(db.String))
    work_experience = db.Column(db.ARRAY(db.String))
    skills = db.Column(db.ARRAY(db.String))
    projects = db.Column(db.ARRAY(db.String))
    certifications = db.Column(db.ARRAY(db.String))
    linkedin = db.Column(db.String(255))
    github = db.Column(db.String(255))
    privacy_settings = db.Column(db.JSON, default={})

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    images = db.Column(db.ARRAY(db.String), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user = db.relationship('User', backref=db.backref('posts', lazy=True))

# Define schemas for validation
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

class PostSchema(Schema):
    title = fields.Str(required=True)  # expects a string and is required
    description = fields.Str(required=True)  # expects a string and is required
    category = fields.Str(required=True)  # expects a string and is required
    images = fields.List(fields.Str(), required=True)  # expects a list of strings


class SkillSchema(Schema):
    skill = fields.Str(required=True)

class EducationSchema(Schema):
    university = fields.Str(required=True)
    degree = fields.Str(required=True)
    major = fields.Str(required=True)
    start_date = fields.Str(required=True)
    end_date = fields.Str(required=True)
    bio = fields.Str()

class ExperienceSchema(Schema):
    company_name = fields.Str(required=True)
    location = fields.Str(required=True)
    work_mode = fields.Str(required=True)
    start_date = fields.Str(required=True)
    end_date = fields.Str()
    currently_working = fields.Bool()

class ProjectSchema(Schema):
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    technologies = fields.Str()
    start_date = fields.Str(required=True)
    end_date = fields.Str()
    link = fields.Str()

class CertificationSchema(Schema):
    certification_name = fields.Str(required=True)
    organization = fields.Str(required=True)
    date_received = fields.Str()

# Error handler for validation errors
@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": e.messages}), 400

# Initialize the database
@app.route('/init', methods=['POST'])
def init_db():
    db.create_all()
    return jsonify({"message": "Database initialized."}), 200

# Register a new user
@app.route('/register', methods=['POST'])
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
        education=validated_data.get('education'),
        work_experience=validated_data.get('work_experience'),
        skills=validated_data.get('skills'),
        projects=validated_data.get('projects'),
        certifications=validated_data.get('certifications'),
        linkedin=validated_data.get('linkedin'),
        github=validated_data.get('github'),
        privacy_settings=validated_data.get('privacy_settings')
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
        app.logger.error(f"Error registering user: {str(e)}")
        return jsonify({"error": "An error occurred during registration."}), 500

# Login a user and generate a JWT token
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    schema = LoginSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    user = User.query.filter_by(email=validated_data['email']).first()

    if user and bcrypt.check_password_hash(user.password, validated_data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "access_token": access_token}), 200
    else:
        return jsonify({"error": "Invalid email or password."}), 401

# Profile route to fetch the logged-in user’s data
@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

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
    user = db.session.get(User, user_id)

    if user:
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()
        return jsonify({"message": "Profile updated successfully."}), 200
    else:
        return jsonify({"error": "User not found."}), 404

@app.route('/add_skill', methods=['POST'])
@jwt_required()
def add_skill():
    try:
        # Get the user ID from the JWT token
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the request data and validate it
        data = request.get_json()
        schema = SkillSchema()
        validated_data = schema.load(data)

        # Extract the skill and check if it's already in the user's skills
        skill = validated_data['skill']
        if skill not in user.skills:
            user.skills = (user.skills or []) + [skill]
            db.session.commit()
            return jsonify({"message": "Skill added successfully", "skills": user.skills}), 200
        else:
            return jsonify({"message": "Skill already exists in user's profile.", "skills": user.skills}), 200

    except ValidationError as ve:
        app.logger.error(f"Validation Error: {ve.messages}")
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        app.logger.error(f"Error adding skill: {str(e)}")
        return jsonify({"error": "An error occurred while adding the skill. Please try again."}), 500



# Route to add education
@app.route('/add_education', methods=['POST'])
@jwt_required()
def add_education():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    schema = EducationSchema()
    validated_data = schema.load(data)
    
    education_entry = validated_data
    user.education = (user.education or []) + [education_entry]
    db.session.commit()
    return jsonify({"message": "Education added successfully", "education": user.education}), 200

# Route to add work experience
@app.route('/add_experience', methods=['POST'])
@jwt_required()
def add_experience():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    schema = ExperienceSchema()
    validated_data = schema.load(data)
    
    experience_entry = validated_data
    user.work_experience = (user.work_experience or []) + [experience_entry]
    db.session.commit()
    return jsonify({"message": "Work experience added successfully", "work_experience": user.work_experience}), 200

# Route to add a project
@app.route('/add_project', methods=['POST'])
@jwt_required()
def add_project():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    schema = ProjectSchema()
    validated_data = schema.load(data)
    
    project_entry = validated_data
    user.projects = (user.projects or []) + [project_entry]
    db.session.commit()
    return jsonify({"message": "Project added successfully", "projects": user.projects}), 200

# Route to add a certification
@app.route('/add_certification', methods=['POST'])
@jwt_required()
def add_certification():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    schema = CertificationSchema()
    validated_data = schema.load(data)
    
    certification_entry = validated_data
    user.certifications = (user.certifications or []) + [certification_entry]
    db.session.commit()
    return jsonify({"message": "Certification added successfully", "certifications": user.certifications}), 200

# Route to create a new post
@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    schema = PostSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        app.logger.error(f"Validation errors: {err.messages}")  # Log specific validation errors
        return jsonify({"error": err.messages}), 422
    # Remaining code for post creation


    user_id = get_jwt_identity()

    try:
        new_post = Post(
            user_id=user_id,
            title=validated_data['title'],
            description=validated_data['description'],
            category=validated_data['category'],
            images=validated_data['images']
        )
        db.session.add(new_post)
        db.session.commit()
        return jsonify({
            "message": "Post created successfully.",
            "post": {
                "id": new_post.id,
                "title": new_post.title,
                "description": new_post.description,
                "category": new_post.category,
                "images": new_post.images,
                "created_at": new_post.created_at
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating post: {str(e)}")
        return jsonify({"error": "An error occurred while creating the post."}), 500

# Route to fetch posts with pagination
@app.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    post_list = [
        {
            "id": post.id,
            "title": post.title,
            "description": post.description,
            "category": post.category,
            "images": post.images,
            "created_at": post.created_at,
            "user": {
                "id": post.user.id,
                "name": post.user.name,
                "email": post.user.email
            }
        } for post in posts.items
    ]

    return jsonify({
        "posts": post_list,
        "total": posts.total,
        "pages": posts.pages,
        "current_page": posts.page
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5002, debug=True)
