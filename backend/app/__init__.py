from flask import Flask
from app.api.routes import api_bp
from app.services.recommendation import FlexibleRecipeRecommendationSystem
from config import Config

def create_app(config_object=Config):  # Use Config class directly
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Initialize the recommendation system
    app.recommendation_system = FlexibleRecipeRecommendationSystem(app.config['CSV_FILE_PATH'])

    app.register_blueprint(api_bp)

    return app
