import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ast import literal_eval
from scipy.sparse import hstack, save_npz, load_npz
from sklearn.preprocessing import MinMaxScaler
from app.models.recipe import Recipe
import joblib
import os

class FlexibleRecipeRecommendationSystem:
    def __init__(self, csv_file_path, precomputed_dir):
        self.csv_file_path = csv_file_path
        self.precomputed_dir = precomputed_dir
        self.df = None
        self.tfidf_vectorizer_ingredients = None
        self.tfidf_vectorizer_keywords = None
        self.category_dummies = None
        self.scaler = None
        self.combined_matrix = None

        if self.precomputed_files_exist():
            self.load_precomputed_data()
        else:
            self.compute_and_save_data()

    def precomputed_files_exist(self):
        files = [
            'df.joblib',
            'tfidf_vectorizer_ingredients.joblib',
            'tfidf_vectorizer_keywords.joblib',
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

    def load_precomputed_data(self):
        self.df = joblib.load(os.path.join(self.precomputed_dir, 'df.joblib'))
        self.tfidf_vectorizer_ingredients = joblib.load(os.path.join(self.precomputed_dir, 'tfidf_vectorizer_ingredients.joblib'))
        self.tfidf_vectorizer_keywords = joblib.load(os.path.join(self.precomputed_dir, 'tfidf_vectorizer_keywords.joblib'))
        self.category_dummies = joblib.load(os.path.join(self.precomputed_dir, 'category_dummies.joblib'))
        self.scaler = joblib.load(os.path.join(self.precomputed_dir, 'scaler.joblib'))
        self.combined_matrix = load_npz(os.path.join(self.precomputed_dir, 'combined_matrix.npz'))

    def save_precomputed_data(self):
        os.makedirs(self.precomputed_dir, exist_ok=True)
        joblib.dump(self.df, os.path.join(self.precomputed_dir, 'df.joblib'))
        joblib.dump(self.tfidf_vectorizer_ingredients, os.path.join(self.precomputed_dir, 'tfidf_vectorizer_ingredients.joblib'))
        joblib.dump(self.tfidf_vectorizer_keywords, os.path.join(self.precomputed_dir, 'tfidf_vectorizer_keywords.joblib'))
        joblib.dump(self.category_dummies, os.path.join(self.precomputed_dir, 'category_dummies.joblib'))
        joblib.dump(self.scaler, os.path.join(self.precomputed_dir, 'scaler.joblib'))
        save_npz(os.path.join(self.precomputed_dir, 'combined_matrix.npz'), self.combined_matrix)

    def preprocess_data(self):
        list_columns = ['Keywords', 'RecipeIngredientParts']
        for col in list_columns:
            self.df[col] = self.df[col].apply(lambda x: literal_eval(x) if isinstance(x, str) else [])

        bool_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 'is_low carb', 'is_keto', 'is_paleo']
        for col in bool_columns:
            self.df[col] = self.df[col].astype(int)

    def create_feature_matrices(self):
        self.tfidf_vectorizer_ingredients = TfidfVectorizer(stop_words='english')
        tfidf_matrix_ingredients = self.tfidf_vectorizer_ingredients.fit_transform(self.df['RecipeIngredientParts'].apply(lambda x: ' '.join(x)))

        self.tfidf_vectorizer_keywords = TfidfVectorizer(stop_words='english')
        tfidf_matrix_keywords = self.tfidf_vectorizer_keywords.fit_transform(self.df['Keywords'].apply(lambda x: ' '.join(x)))

        self.category_dummies = pd.get_dummies(self.df['RecipeCategory'])
        category_matrix = self.category_dummies.values

        dietary_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 'is_low carb', 'is_keto', 'is_paleo']
        dietary_matrix = self.df[dietary_columns].values

        self.scaler = MinMaxScaler()
        numerical_features = ['Calories', 'TotalTime_minutes', 'AggregatedRating', 'ReviewCount']
        numerical_matrix = self.scaler.fit_transform(self.df[numerical_features])

        self.combined_matrix = hstack([
            tfidf_matrix_ingredients,
            tfidf_matrix_keywords,
            category_matrix,
            dietary_matrix,
            numerical_matrix
        ])

    def get_recommendations(self, category=None, dietary_preference=None, ingredients=None, calories=None, time=None, keywords=None, cooking_method=None, top_n=5):
        query_vector = self.create_query_vector(category, dietary_preference, ingredients, calories, time, keywords, cooking_method)
        similarity_scores = cosine_similarity(query_vector, self.combined_matrix).flatten()
        top_indices = similarity_scores.argsort()[-top_n:][::-1]

        results = []
        for idx in top_indices:
            recipe = self.df.iloc[idx]
            results.append(Recipe(
                RecipeId=int(recipe['RecipeId']),
                Name=recipe['Name'],
                RecipeCategory=recipe['RecipeCategory'],
                RecipeIngredientParts=recipe['RecipeIngredientParts'],
                Keywords=recipe['Keywords'],
                Calories=float(recipe['Calories']),
                TotalTime_minutes=int(recipe['TotalTime_minutes']),
                AggregatedRating=float(recipe['AggregatedRating']),
                ReviewCount=int(recipe['ReviewCount'])
            ))

        results.sort(key=lambda x: (x.AggregatedRating, x.ReviewCount), reverse=True)
        return results

    def create_query_vector(self, category=None, dietary_preference=None, ingredients=None, calories=None, time=None, keywords=None, cooking_method=None):
        query_vector = np.zeros((1, self.combined_matrix.shape[1]))

        if ingredients:
            ingredient_query = self.tfidf_vectorizer_ingredients.transform([' '.join(ingredients)])
            query_vector[:, :ingredient_query.shape[1]] = ingredient_query.toarray()

        if keywords or cooking_method:
            all_keywords = keywords or []
            if cooking_method:
                all_keywords.append(cooking_method)
            keyword_query = self.tfidf_vectorizer_keywords.transform([' '.join(all_keywords)])
            start = ingredient_query.shape[1] if ingredients else 0
            end = start + keyword_query.shape[1]
            query_vector[:, start:end] = keyword_query.toarray()

        if category:
            if category in self.category_dummies.columns:
                start = (ingredient_query.shape[1] if ingredients else 0) + (keyword_query.shape[1] if keywords or cooking_method else 0)
                category_index = self.category_dummies.columns.get_loc(category)
                query_vector[:, start + category_index] = 1

        if dietary_preference:
            dietary_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 'is_low carb', 'is_keto', 'is_paleo']
            if dietary_preference in dietary_columns:
                start = (ingredient_query.shape[1] if ingredients else 0) + (keyword_query.shape[1] if keywords or cooking_method else 0) + self.category_dummies.shape[1]
                dietary_index = dietary_columns.index(dietary_preference)
                query_vector[:, start + dietary_index] = 1

        start = (ingredient_query.shape[1] if ingredients else 0) + (keyword_query.shape[1] if keywords or cooking_method else 0) + self.category_dummies.shape[1] + len(dietary_columns)
        if calories is not None:
            query_vector[:, start] = self.scaler.transform([[calories, 0, 0, 0]])[0][0]
        if time is not None:
            query_vector[:, start + 1] = self.scaler.transform([[0, time, 0, 0]])[0][1]

        return query_vector