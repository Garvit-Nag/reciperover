import pandas as pd
import numpy as np
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ast import literal_eval
from scipy.sparse import hstack, save_npz, load_npz
from sklearn.preprocessing import MinMaxScaler
from app.models.recipe import Recipe
from app.services.image_search import ImageSearchService
import joblib
import os
import logging  # Add this if it's missing

# Create or get the logger
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
        
        # Add feature weights
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
        self.preprocess_data()
        self.create_feature_matrices()
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

    def preprocess_data(self):
            bool_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 
                       'is_low carb', 'is_keto', 'is_paleo']
            for col in bool_columns:
                self.df[col] = self.df[col].fillna(0).astype(int)
            
            # Handle numerical columns
            numerical_columns = ['Calories', 'TotalTime_minutes', 'AggregatedRating', 'ReviewCount']
            for col in numerical_columns:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(self.df[col].median())
            
            # Function to safely parse list-like strings
            def parse_list_string(s):
                try:
                    parsed = ast.literal_eval(s)
                    return parsed if isinstance(parsed, list) else [s]
                except (ValueError, SyntaxError):
                    return [s] if s else []
    
            # Preprocess list-like columns
            list_columns = ['RecipeIngredientParts', 'Keywords', 'keywords_name']
            for col in list_columns:
                self.df[col] = self.df[col].apply(parse_list_string)

    def create_feature_matrices(self):
        # Create TF-IDF matrices
        self.tfidf_vectorizer_ingredients = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1
        )
        
        ingredients_text = self.df['RecipeIngredientParts'].apply(lambda x: ' '.join(x) if x else '')
        tfidf_matrix_ingredients = self.tfidf_vectorizer_ingredients.fit_transform(ingredients_text)
    
        # Keywords and keywords_name matrices
        self.tfidf_vectorizer_keywords = TfidfVectorizer(stop_words='english', max_features=3000)
        self.tfidf_vectorizer_keywords_name = TfidfVectorizer(stop_words='english', max_features=3000)
        
        keywords_text = self.df['Keywords'].apply(lambda x: ' '.join(x) if x else '')
        keywords_name_text = self.df['keywords_name'].apply(lambda x: ' '.join(x) if x else '')
        
        tfidf_matrix_keywords = self.tfidf_vectorizer_keywords.fit_transform(keywords_text)
        tfidf_matrix_keywords_name = self.tfidf_vectorizer_keywords_name.fit_transform(keywords_name_text)
    
        # Category and dietary matrices
        self.category_dummies = pd.get_dummies(self.df['RecipeCategory'])
        category_matrix = self.category_dummies.values
    
        dietary_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 
                         'is_low carb', 'is_keto', 'is_paleo']
        dietary_matrix = self.df[dietary_columns].values
    
        # Scale numerical features
        self.scaler = MinMaxScaler()
        calories_matrix = self.scaler.fit_transform(self.df[['Calories']].values)
        time_matrix = self.scaler.fit_transform(self.df[['TotalTime_minutes']].values)
        rating_matrix = self.scaler.fit_transform(self.df[['AggregatedRating']].values)
    
        # Combine all features with weights
        self.combined_matrix = hstack([
            tfidf_matrix_ingredients * self.feature_weights['ingredients'],
            category_matrix * self.feature_weights['category'],
            dietary_matrix * self.feature_weights['dietary'],
            calories_matrix * self.feature_weights['calories'],
            time_matrix * self.feature_weights['time'],
            tfidf_matrix_keywords * self.feature_weights['keywords'],
            tfidf_matrix_keywords_name * self.feature_weights['keywords_name'],
            rating_matrix * 0.05  # Small weight for ratings in base similarity
        ])
    
    async def get_recommendations(self, category=None, dietary_preference=None, ingredients=None, 
                                  calories=None, time=None, keywords=None, keywords_name=None, top_n=5):
        logger.info(f"Starting recommendation process for category: {category}, dietary_preference: {dietary_preference}")
        
        query_vector = self.create_query_vector(
            category=category,
            dietary_preference=dietary_preference,
            ingredients=ingredients,
            calories=calories,
            time=time,
            keywords=keywords,
            keywords_name=keywords_name
        )
    
        similarity_scores = self.calculate_weighted_similarity(query_vector, calories, time)
        
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
    
                # Fix for RecipeIngredientParts
                try:
                    ingredient_parts = ast.literal_eval(recipe['RecipeIngredientParts'])
                    if isinstance(ingredient_parts, list):
                        if len(ingredient_parts) == 1 and isinstance(ingredient_parts[0], str):
                            ingredient_parts = [ingredient_parts[0]]
                        elif all(isinstance(item, str) for item in ingredient_parts):
                            ingredient_parts = ingredient_parts
                        else:
                            ingredient_parts = []
                    else:
                        ingredient_parts = []
                except (ValueError, SyntaxError):
                    ingredient_parts = []
    
                def parse_list_field(field):
                    if isinstance(field, list):
                        return field
                    elif isinstance(field, str):
                        try:
                            parsed = ast.literal_eval(field)
                            return parsed if isinstance(parsed, list) else []
                        except (ValueError, SyntaxError):
                            return []
                    return []

                results.append(Recipe(
                    RecipeId=int(recipe['RecipeId']),
                    Name=recipe['Name'],
                    RecipeCategory=recipe['RecipeCategory'],
                    # Use data directly - no parsing needed
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
    
    def calculate_weighted_similarity(self, query_vector, target_calories=None, target_time=None):
        base_similarity = cosine_similarity(query_vector, self.combined_matrix).flatten()
        
        penalties = np.ones_like(base_similarity)
        
        if target_calories is not None:
            calorie_diff = np.abs(self.df['Calories'].values - target_calories)
            calorie_penalty = 1 - (calorie_diff / self.df['Calories'].max())
            penalties *= calorie_penalty
            
        if target_time is not None:
            time_diff = np.abs(self.df['TotalTime_minutes'].values - target_time)
            time_penalty = 1 - (time_diff / self.df['TotalTime_minutes'].max())
            penalties *= time_penalty
        
        return base_similarity * penalties

    def create_query_vector(self, **kwargs):
        query_vector = np.zeros((1, self.combined_matrix.shape[1]))
        current_position = 0

        # Ingredients
        if kwargs.get('ingredients'):
            ingredients_query = self.tfidf_vectorizer_ingredients.transform([' '.join(kwargs['ingredients'])])
            query_vector[:, :ingredients_query.shape[1]] = ingredients_query.toarray() * self.feature_weights['ingredients']
            current_position += ingredients_query.shape[1]

        # Category
        category_vector = np.zeros((1, self.category_dummies.shape[1]))
        if kwargs.get('category') and kwargs['category'] in self.category_dummies.columns:
            category_index = self.category_dummies.columns.get_loc(kwargs['category'])
            category_vector[0, category_index] = 1
        query_vector[:, current_position:current_position + self.category_dummies.shape[1]] = (
            category_vector * self.feature_weights['category']
        )
        current_position += self.category_dummies.shape[1]

        # Dietary preferences
        dietary_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 
                           'is_low carb', 'is_keto', 'is_paleo']
        dietary_vector = np.zeros((1, len(dietary_columns)))
        if kwargs.get('dietary_preference') in dietary_columns:
            dietary_index = dietary_columns.index(kwargs['dietary_preference'])
            dietary_vector[0, dietary_index] = 1
        query_vector[:, current_position:current_position + len(dietary_columns)] = (
            dietary_vector * self.feature_weights['dietary']
        )
        current_position += len(dietary_columns)

        # Calories and Time
        calories_vector = np.zeros((1, 1))
        time_vector = np.zeros((1, 1))
        
        if kwargs.get('calories'):
            calories_vector[0, 0] = kwargs['calories']
        if kwargs.get('time'):
            time_vector[0, 0] = kwargs['time']
            
        calories_vector = self.scaler.transform(calories_vector)
        time_vector = self.scaler.transform(time_vector)
        
        query_vector[:, current_position:current_position + 1] = calories_vector * self.feature_weights['calories']
        current_position += 1
        query_vector[:, current_position:current_position + 1] = time_vector * self.feature_weights['time']
        current_position += 1

        # Keywords and keywords_name
        if kwargs.get('keywords'):
            keywords_query = self.tfidf_vectorizer_keywords.transform([' '.join(kwargs['keywords'])])
            query_vector[:, current_position:current_position + keywords_query.shape[1]] = (
                keywords_query.toarray() * self.feature_weights['keywords']
            )
            current_position += keywords_query.shape[1]

        if kwargs.get('keywords_name'):
            keywords_name_query = self.tfidf_vectorizer_keywords_name.transform([' '.join(kwargs['keywords_name'])])
            query_vector[:, current_position:current_position + keywords_name_query.shape[1]] = (
                keywords_name_query.toarray() * self.feature_weights['keywords_name']
            )

        return query_vector