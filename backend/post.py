from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from datetime import datetime
import logging

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Logging setup
logging.basicConfig(level=logging.ERROR)

# Post model
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    post_type = db.Column(db.String(50), nullable=False)  # e.g., "project", "research", "job", etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    file_urls = db.Column(db.Text, default="[]")  # JSON encoded list of file URLs

# Marshmallow schema for post validation
class PostSchema(Schema):
    title = fields.Str(required=True)
    content = fields.Str()
    post_type = fields.Str(required=True, validate=lambda x: x in ["project", "research", "job", "service", "general"])
    file_urls = fields.List(fields.Str())

# Routes

# Create a new post
@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.get_json()
    schema = PostSchema()

    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    new_post = Post(
        user_id=user_id,
        title=validated_data["title"],
        content=validated_data.get("content"),
        post_type=validated_data["post_type"],
        file_urls=str(validated_data.get("file_urls", []))
    )

    try:
        db.session.add(new_post)
        db.session.commit()
        return jsonify({"message": "Post created successfully.", "post_id": new_post.id}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating post: {str(e)}")
        return jsonify({"error": "An error occurred while creating the post."}), 500

# Fetch all posts
@app.route('/posts', methods=['GET'])
@jwt_required()
def get_all_posts():
    user_id = get_jwt_identity()
    posts = Post.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "post_type": post.post_type,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "file_urls": eval(post.file_urls)
        } for post in posts
    ]), 200

# Delete a post
@app.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id, user_id=user_id).first()

    if not post:
        return jsonify({"error": "Post not found or access denied."}), 404

    try:
        db.session.delete(post)
        db.session.commit()
        return jsonify({"message": "Post deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting post: {str(e)}")
        return jsonify({"error": "An error occurred while deleting the post."}), 500

# Update a post
@app.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id, user_id=user_id).first()

    if not post:
        return jsonify({"error": "Post not found or access denied."}), 404

    data = request.get_json()
    schema = PostSchema()

    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    try:
        post.title = validated_data["title"]
        post.content = validated_data.get("content", post.content)
        post.post_type = validated_data["post_type"]
        post.file_urls = str(validated_data.get("file_urls", eval(post.file_urls)))

        db.session.commit()
        return jsonify({"message": "Post updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating post: {str(e)}")
        return jsonify({"error": "An error occurred while updating the post."}), 500

# Initialize the database
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
