import os
from dotenv import load_dotenv


load_dotenv()  # Load variables from .env

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    DATABASE_URI = os.getenv('DATABASE_URI')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'



class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    DEBUG = False
    TESTING = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}
