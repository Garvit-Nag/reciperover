import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ast import literal_eval
from scipy.sparse import hstack
from sklearn.preprocessing import MinMaxScaler
from app.models.recipe import Recipe

class FlexibleRecipeRecommendationSystem:
    def __init__(self, csv_file_path):
        self.df = pd.read_csv(csv_file_path)
        self.preprocess_data()
        self.create_feature_matrices()

    def preprocess_data(self):
        list_columns = ['Keywords', 'RecipeIngredientParts']
        for col in list_columns:
            self.df[col] = self.df[col].apply(lambda x: literal_eval(x) if isinstance(x, str) else [])

        bool_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 'is_low carb', 'is_keto', 'is_paleo']
        for col in bool_columns:
            self.df[col] = self.df[col].astype(int)

    def create_feature_matrices(self):
        self.tfidf_vectorizer_ingredients = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix_ingredients = self.tfidf_vectorizer_ingredients.fit_transform(self.df['RecipeIngredientParts'].apply(lambda x: ' '.join(x)))

        self.tfidf_vectorizer_keywords = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix_keywords = self.tfidf_vectorizer_keywords.fit_transform(self.df['Keywords'].apply(lambda x: ' '.join(x)))

        self.category_dummies = pd.get_dummies(self.df['RecipeCategory'])
        self.category_matrix = self.category_dummies.values

        dietary_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 'is_low carb', 'is_keto', 'is_paleo']
        self.dietary_matrix = self.df[dietary_columns].values

        self.scaler = MinMaxScaler()
        numerical_features = ['Calories', 'TotalTime_minutes', 'AggregatedRating', 'ReviewCount']
        self.numerical_matrix = self.scaler.fit_transform(self.df[numerical_features])

        self.combined_matrix = hstack([
            self.tfidf_matrix_ingredients,
            self.tfidf_matrix_keywords,
            self.category_matrix,
            self.dietary_matrix,
            self.numerical_matrix
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
            query_vector[:, :self.tfidf_matrix_ingredients.shape[1]] = ingredient_query.toarray()

        if keywords or cooking_method:
            all_keywords = keywords or []
            if cooking_method:
                all_keywords.append(cooking_method)
            keyword_query = self.tfidf_vectorizer_keywords.transform([' '.join(all_keywords)])
            start = self.tfidf_matrix_ingredients.shape[1]
            end = start + self.tfidf_matrix_keywords.shape[1]
            query_vector[:, start:end] = keyword_query.toarray()

        if category:
            if category in self.category_dummies.columns:
                start = self.tfidf_matrix_ingredients.shape[1] + self.tfidf_matrix_keywords.shape[1]
                category_index = self.category_dummies.columns.get_loc(category)
                query_vector[:, start + category_index] = 1

        if dietary_preference:
            dietary_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 'is_low carb', 'is_keto', 'is_paleo']
            if dietary_preference in dietary_columns:
                start = self.tfidf_matrix_ingredients.shape[1] + self.tfidf_matrix_keywords.shape[1] + self.category_matrix.shape[1]
                dietary_index = dietary_columns.index(dietary_preference)
                query_vector[:, start + dietary_index] = 1

        start = self.tfidf_matrix_ingredients.shape[1] + self.tfidf_matrix_keywords.shape[1] + self.category_matrix.shape[1] + self.dietary_matrix.shape[1]
        if calories is not None:
            query_vector[:, start] = self.scaler.transform([[calories, 0, 0, 0]])[0][0]
        if time is not None:
            query_vector[:, start + 1] = self.scaler.transform([[0, time, 0, 0]])[0][1]

        return query_vector