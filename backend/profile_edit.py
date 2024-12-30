from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
import logging
import json

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///profile.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Logging setup
logging.basicConfig(level=logging.ERROR)

# Database Model for User Profile
class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=True, nullable=False)
    experience = db.Column(db.Text, default="[]")  # JSON encoded list of experiences
    education = db.Column(db.Text, default="[]")  # JSON encoded list of education
    skills = db.Column(db.Text, default="[]")  # JSON encoded list of skills
    certifications = db.Column(db.Text, default="[]")  # JSON encoded list of certifications/licenses
    projects = db.Column(db.Text, default="[]")  # JSON encoded list of projects

# Marshmallow Schemas
class ExperienceSchema(Schema):
    company = fields.Str(required=True)
    position = fields.Str(required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(allow_none=True)
    description = fields.Str()

class EducationSchema(Schema):
    institution = fields.Str(required=True)
    degree = fields.Str(required=True)
    field_of_study = fields.Str(required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(allow_none=True)
    grade = fields.Str()

class SkillSchema(Schema):
    skill_name = fields.Str(required=True)

class CertificationSchema(Schema):
    name = fields.Str(required=True)
    organization = fields.Str(required=True)
    issue_date = fields.Date(required=True)
    expiration_date = fields.Date(allow_none=True)

class ProjectSchema(Schema):
    title = fields.Str(required=True)
    description = fields.Str()
    start_date = fields.Date(required=True)
    end_date = fields.Date(allow_none=True)

# Helper function for updating profile fields
def update_profile_field(user_id, field_name, data, schema):
    profile = UserProfile.query.filter_by(user_id=user_id).first()

    if not profile:
        profile = UserProfile(user_id=user_id)
        setattr(profile, field_name, json.dumps([]))

    existing_data = json.loads(getattr(profile, field_name))

    try:
        validated_data = schema.load(data, many=True)
        updated_data = validated_data
        setattr(profile, field_name, json.dumps(updated_data))
        db.session.add(profile)
        db.session.commit()
        return jsonify({"message": f"{field_name.capitalize()} updated successfully."}), 200
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating {field_name}: {str(e)}")
        return jsonify({"error": f"An error occurred while updating {field_name}."}), 500

# Routes for updating profile fields

# Update experience
@app.route('/profile/experience', methods=['POST'])
@jwt_required()
def update_experience():
    user_id = get_jwt_identity()
    data = request.get_json()
    return update_profile_field(user_id, "experience", data, ExperienceSchema())

# Update education
@app.route('/profile/education', methods=['POST'])
@jwt_required()
def update_education():
    user_id = get_jwt_identity()
    data = request.get_json()
    return update_profile_field(user_id, "education", data, EducationSchema())

# Update skills
@app.route('/profile/skills', methods=['POST'])
@jwt_required()
def update_skills():
    user_id = get_jwt_identity()
    data = request.get_json()
    return update_profile_field(user_id, "skills", data, SkillSchema())

# Update certifications/licenses
@app.route('/profile/certifications', methods=['POST'])
@jwt_required()
def update_certifications():
    user_id = get_jwt_identity()
    data = request.get_json()
    return update_profile_field(user_id, "certifications", data, CertificationSchema())

# Update projects
@app.route('/profile/projects', methods=['POST'])
@jwt_required()
def update_projects():
    user_id = get_jwt_identity()
    data = request.get_json()
    return update_profile_field(user_id, "projects", data, ProjectSchema())

# Fetch entire profile
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    profile = UserProfile.query.filter_by(user_id=user_id).first()

    if not profile:
        return jsonify({"error": "Profile not found."}), 404

    return jsonify({
        "experience": json.loads(profile.experience),
        "education": json.loads(profile.education),
        "skills": json.loads(profile.skills),
        "certifications": json.loads(profile.certifications),
        "projects": json.loads(profile.projects)
    }), 200

# Initialize the database
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
