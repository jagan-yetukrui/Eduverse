from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from autho import auth_blueprint, db, bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///main.db'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_blueprint, url_prefix='/api/auth')

@app.route('/')
def home():
    return {"message": "Welcome to the API!"}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables
    app.run(debug=True)
