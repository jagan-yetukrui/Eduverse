from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://your_username:your_password@localhost/jaganyetukuri'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# User model
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
    privacy_settings = db.Column(db.JSON)

# Endpoint to initialize the database
@app.route('/init', methods=['POST'])
def init_db():
    db.create_all()
    return jsonify({"message": "Database initialized."}), 200

# Register endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.json
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
        github=data.get('github', '')
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created successfully."}), 201
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({"message": "Login successful."}), 200
    else:
        return jsonify({"error": "Invalid email or password."}), 401

if __name__ == '__main__':
    app.run(debug=True)
