from flask import Blueprint, request, jsonify, current_app
from app.models.recipe import Recipe
import json
import asyncio
from app.services import extraction

api_bp = Blueprint('api', __name__)

@api_bp.route('/form-data', methods=['GET'])
def get_form_data():
    with open('form_data.json', 'r') as file:
        data = json.load(file)
    return jsonify(data)

@api_bp.route('/recommend', methods=['POST'])
async def recommend_recipes():  # Make this function async
    data = request.json
    category = data.get('category')
    dietary_preference = data.get('dietary_preference')
    ingredients = data.get('ingredients', [])
    calories = data.get('calories')
    time = data.get('time')
    keywords = data.get('keywords', [])
    keywords_name = data.get('keywords_name', [])

    try:
        if calories is not None:
            calories = int(calories)
        if time is not None:
            time = int(time)
    except ValueError:
        return jsonify({"error": "Calories and time must be integers if provided"}), 400

    # Use await to call the async function
    recommendations = await current_app.recommendation_system.get_recommendations(
        category=category,
        dietary_preference=dietary_preference,
        ingredients=ingredients,
        calories=calories,
        time=time,
        keywords=keywords,
        keywords_name=keywords_name
    )

    return jsonify([vars(recipe) for recipe in recommendations])

@api_bp.route('/recommend2', methods=['POST'])
async def recommend_recipes2():  # Make this function async
    data = request.json
    raw_text = data.get('text', '')
    extracted_info = extraction.extract_recipe_attributes(raw_text, "./recipe_ner_model")

    category = extracted_info.get('category')
    dietary_preference = extracted_info.get('dietary_preference') # remove
    ingredients = extracted_info.get('ingredients', [])
    calories = extracted_info.get('calories')
    time = extracted_info.get('time')
    keywords = extracted_info.get('keywords', [])
    keywords_name = extracted_info.get('keywords_name', [])
    
    try:
        if calories is not None:
            calories = int(calories)
        if time is not None:
            time = int(time)
    except ValueError:
        return jsonify({"error": "Calories and time must be integers if provided"}), 400

    # Use await to call the async function
    recommendations = await current_app.recommendation_system.get_recommendations(
        category=category,
        dietary_preference=dietary_preference,
        ingredients=ingredients,
        calories=calories,
        time=time,
        keywords=keywords,
        keywords_name=keywords_name
    )

    return jsonify([vars(recipe) for recipe in recommendations])