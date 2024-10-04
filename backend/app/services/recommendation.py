import pandas as pd
import numpy as np
import os
import logging
import joblib
from scipy.sparse import save_npz, load_npz
from app.models.recipe import Recipe
from app.services.image_search import ImageSearchService
from app.utils.data_preprocessing import preprocess_data, parse_recipe_ingredients
from app.utils.feature_engineering import create_feature_matrices, create_query_vector
from app.utils.similarity_calculation import calculate_weighted_similarity

logger = logging.getLogger(__name__)

class FlexibleRecipeRecommendationSystem:
    def __init__(self, csv_file_path, precomputed_dir):
        self.csv_file_path = csv_file_path
        self.precomputed_dir = precomputed_dir
        self.df = None
        self.tfidf_vectorizer_ingredients = None
        self.tfidf_vectorizer_keywords = None
        self.tfidf_vectorizer_keywords_name = None
        self.category_dummies = None
        self.scaler = None
        self.combined_matrix = None
        
        self.feature_weights = {
            'ingredients': 0.15,
            'category': 0.25,
            'dietary': 0.20,
            'calories': 0.10,
            'time': 0.10,
            'keywords': 0.10,
            'keywords_name': 0.10
        }
        
        self.image_search_service = ImageSearchService()

        if self.precomputed_files_exist():
            self.load_precomputed_data()
        else:
            self.compute_and_save_data()

    def precomputed_files_exist(self):
        files = [
            'df.joblib',
            'tfidf_vectorizer_ingredients.joblib',
            'tfidf_vectorizer_keywords.joblib',
            'tfidf_vectorizer_keywords_name.joblib',
            'category_dummies.joblib',
            'scaler.joblib',
            'combined_matrix.npz'
        ]
        return all(os.path.exists(os.path.join(self.precomputed_dir, f)) for f in files)

    def compute_and_save_data(self):
        self.df = pd.read_csv(self.csv_file_path)
        self.df = preprocess_data(self.df)
        (self.combined_matrix, self.tfidf_vectorizer_ingredients, self.tfidf_vectorizer_keywords,
         self.tfidf_vectorizer_keywords_name, self.category_dummies, self.scaler) = create_feature_matrices(self.df, self.feature_weights)
        self.save_precomputed_data()

    def save_precomputed_data(self):
        os.makedirs(self.precomputed_dir, exist_ok=True)
        joblib.dump(self.df, os.path.join(self.precomputed_dir, 'df.joblib'))
        joblib.dump(self.tfidf_vectorizer_ingredients, os.path.join(self.precomputed_dir, 'tfidf_vectorizer_ingredients.joblib'))
        joblib.dump(self.tfidf_vectorizer_keywords, os.path.join(self.precomputed_dir, 'tfidf_vectorizer_keywords.joblib'))
        joblib.dump(self.tfidf_vectorizer_keywords_name, os.path.join(self.precomputed_dir, 'tfidf_vectorizer_keywords_name.joblib'))
        joblib.dump(self.category_dummies, os.path.join(self.precomputed_dir, 'category_dummies.joblib'))
        joblib.dump(self.scaler, os.path.join(self.precomputed_dir, 'scaler.joblib'))
        save_npz(os.path.join(self.precomputed_dir, 'combined_matrix.npz'), self.combined_matrix)

    def load_precomputed_data(self):
            self.df = joblib.load(os.path.join(self.precomputed_dir, 'df.joblib'))
            self.tfidf_vectorizer_ingredients = joblib.load(os.path.join(self.precomputed_dir, 'tfidf_vectorizer_ingredients.joblib'))
            self.tfidf_vectorizer_keywords = joblib.load(os.path.join(self.precomputed_dir, 'tfidf_vectorizer_keywords.joblib'))
            self.tfidf_vectorizer_keywords_name = joblib.load(os.path.join(self.precomputed_dir, 'tfidf_vectorizer_keywords_name.joblib'))
            self.category_dummies = joblib.load(os.path.join(self.precomputed_dir, 'category_dummies.joblib'))
            self.scaler = joblib.load(os.path.join(self.precomputed_dir, 'scaler.joblib'))
            self.combined_matrix = load_npz(os.path.join(self.precomputed_dir, 'combined_matrix.npz'))

    async def get_recommendations(self, category=None, dietary_preference=None, ingredients=None, 
                                  calories=None, time=None, keywords=None, keywords_name=None, top_n=5):
        logger.info(f"Starting recommendation process for category: {category}, dietary_preference: {dietary_preference}")
        
        query_vector = create_query_vector(
            self.combined_matrix,
            self.tfidf_vectorizer_ingredients,
            self.tfidf_vectorizer_keywords,
            self.tfidf_vectorizer_keywords_name,
            self.category_dummies,
            self.scaler,
            self.feature_weights,
            category=category,
            dietary_preference=dietary_preference,
            ingredients=ingredients,
            calories=calories,
            time=time,
            keywords=keywords,
            keywords_name=keywords_name
        )
    
        similarity_scores = calculate_weighted_similarity(query_vector, self.combined_matrix, self.df, calories, time)
        
        if category:
            category_mask = self.df['RecipeCategory'] == category
            similarity_scores = similarity_scores * category_mask
    
        top_indices = similarity_scores.argsort()[-top_n*3:][::-1]
        logger.info(f"Found {len(top_indices)} potential recommendations")
    
        results = []
        async with ImageSearchService() as image_service:
            for idx in top_indices:
                if len(results) >= top_n:
                    break
    
                recipe = self.df.iloc[idx]
                
                if category and recipe['RecipeCategory'] != category:
                    logger.debug(f"Skipping recipe {recipe['Name']} due to category mismatch")
                    continue
    
                try:
                    logger.info(f"Searching images for recipe: {recipe['Name']}")
                    image_urls = await image_service.search_recipe_images(
                        recipe['Name'], recipe['Images'], 3
                    )
                    logger.info(f"Found {len(image_urls)} images for recipe: {recipe['Name']}")
                except Exception as e:
                    logger.error(f"Error searching images for {recipe['Name']}: {str(e)}")
                    image_urls = []
    
                ingredient_parts = parse_recipe_ingredients(recipe['RecipeIngredientParts'])

                results.append(Recipe(
                    RecipeId=int(recipe['RecipeId']),
                    Name=recipe['Name'],
                    RecipeCategory=recipe['RecipeCategory'],
                    RecipeIngredientParts=recipe['RecipeIngredientParts'],
                    Keywords=recipe['Keywords'],
                    keywords_name=recipe['keywords_name'],
                    Calories=float(recipe['Calories']),
                    TotalTime_minutes=int(recipe['TotalTime_minutes']),
                    AggregatedRating=float(recipe['AggregatedRating']),
                    ReviewCount=int(recipe['ReviewCount']),
                    Description=recipe['Description'],
                    RecipeIngredientQuantities=recipe['RecipeIngredientQuantities'],
                    RecipeInstructions=recipe['RecipeInstructions'],
                    Images=image_urls,
                    Similarity=float(similarity_scores[idx])
                ))
    
        # If we still don't have enough recommendations, fill with top similar recipes regardless of category
        if len(results) < top_n:
            logger.warning(f"Not enough recommendations found. Filling with top similar recipes.")
            remaining_indices = [idx for idx in top_indices if idx not in [r.RecipeId for r in results]]
            for idx in remaining_indices:
                if len(results) >= top_n:
                    break
                recipe = self.df.iloc[idx]
                results.append(Recipe(
                    RecipeId=int(recipe['RecipeId']),
                    Name=recipe['Name'],
                    RecipeCategory=recipe['RecipeCategory'],
                    RecipeIngredientParts=recipe['RecipeIngredientParts'],
                    Keywords=recipe['Keywords'],
                    keywords_name=recipe['keywords_name'],
                    Calories=float(recipe['Calories']),
                    TotalTime_minutes=int(recipe['TotalTime_minutes']),
                    AggregatedRating=float(recipe['AggregatedRating']),
                    ReviewCount=int(recipe['ReviewCount']),
                    Description=recipe['Description'],
                    RecipeIngredientQuantities=recipe['RecipeIngredientQuantities'],
                    RecipeInstructions=recipe['RecipeInstructions'],
                    Images=[],
                    Similarity=float(similarity_scores[idx])
                ))
    
        logger.info(f"Returning {len(results)} recommendations")
        return results[:top_n]