from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
import logging
import json

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///settings.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Logging setup
logging.basicConfig(level=logging.ERROR)

# Database Models
class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=True, nullable=False)
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=False)
    privacy_level = db.Column(db.String(50), default="public")  # public, private, custom
    blocked_users = db.Column(db.Text, default="[]")  # JSON encoded list
    two_factor_auth = db.Column(db.Boolean, default=False)

class HelpRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="Pending")  # Pending, Resolved

# Marshmallow Schemas
class SettingsSchema(Schema):
    email_notifications = fields.Bool()
    sms_notifications = fields.Bool()
    privacy_level = fields.Str(validate=lambda x: x in ["public", "private", "custom"])
    blocked_users = fields.List(fields.Int())
    two_factor_auth = fields.Bool()

class HelpRequestSchema(Schema):
    subject = fields.Str(required=True)
    message = fields.Str(required=True)

# Routes

# Fetch user settings
@app.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = get_jwt_identity()
    settings = UserSettings.query.filter_by(user_id=user_id).first()

    if not settings:
        return jsonify({"error": "Settings not found."}), 404

    return jsonify({
        "email_notifications": settings.email_notifications,
        "sms_notifications": settings.sms_notifications,
        "privacy_level": settings.privacy_level,
        "blocked_users": json.loads(settings.blocked_users),
        "two_factor_auth": settings.two_factor_auth
    }), 200

# Update user settings
@app.route('/settings', methods=['POST'])
@jwt_required()
def update_settings():
    user_id = get_jwt_identity()
    data = request.get_json()
    schema = SettingsSchema()

    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    settings = UserSettings.query.filter_by(user_id=user_id).first()

    if not settings:
        settings = UserSettings(user_id=user_id)

    settings.email_notifications = validated_data.get("email_notifications", settings.email_notifications)
    settings.sms_notifications = validated_data.get("sms_notifications", settings.sms_notifications)
    settings.privacy_level = validated_data.get("privacy_level", settings.privacy_level)
    settings.blocked_users = json.dumps(validated_data.get("blocked_users", json.loads(settings.blocked_users)))
    settings.two_factor_auth = validated_data.get("two_factor_auth", settings.two_factor_auth)

    try:
        db.session.add(settings)
        db.session.commit()
        return jsonify({"message": "Settings updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating settings: {str(e)}")
        return jsonify({"error": "An error occurred while updating settings."}), 500

# Block/unblock users
@app.route('/blocked', methods=['POST'])
@jwt_required()
def manage_blocked_users():
    user_id = get_jwt_identity()
    data = request.get_json()
    action = data.get("action")  # "block" or "unblock"
    target_user_id = data.get("target_user_id")

    if not action or not target_user_id:
        return jsonify({"error": "Action and target_user_id are required."}), 400

    settings = UserSettings.query.filter_by(user_id=user_id).first()

    if not settings:
        settings = UserSettings(user_id=user_id, blocked_users="[]")

    blocked_users = json.loads(settings.blocked_users)

    if action == "block" and target_user_id not in blocked_users:
        blocked_users.append(target_user_id)
    elif action == "unblock" and target_user_id in blocked_users:
        blocked_users.remove(target_user_id)
    else:
        return jsonify({"error": "Invalid action or user already in desired state."}), 400

    settings.blocked_users = json.dumps(blocked_users)

    try:
        db.session.add(settings)
        db.session.commit()
        return jsonify({"message": f"User {'blocked' if action == 'block' else 'unblocked'} successfully."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error managing blocked users: {str(e)}")
        return jsonify({"error": "An error occurred while managing blocked users."}), 500

# Submit a help request
@app.route('/help', methods=['POST'])
@jwt_required()
def help_request():
    user_id = get_jwt_identity()
    data = request.get_json()
    schema = HelpRequestSchema()

    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    new_request = HelpRequest(
        user_id=user_id,
        subject=validated_data["subject"],
        message=validated_data["message"]
    )

    try:
        db.session.add(new_request)
        db.session.commit()
        return jsonify({"message": "Help request submitted successfully."}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error submitting help request: {str(e)}")
        return jsonify({"error": "An error occurred while submitting your request."}), 500

# Get all help requests for a user
@app.route('/help', methods=['GET'])
@jwt_required()
def get_help_requests():
    user_id = get_jwt_identity()
    help_requests = HelpRequest.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": req.id,
            "subject": req.subject,
            "message": req.message,
            "status": req.status
        } for req in help_requests
    ]), 200

# Initialize the database
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
