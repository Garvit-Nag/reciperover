import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

# Preprocess the text (tokenization, lowercasing, removing stopwords, etc.)
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    # Add more preprocessing steps as needed (like stemming or lemmatization)
    return text

# Search function to find matching recipes
def search_recipes(query):
    # Load the recipe dataset (assuming it's stored as a CSV or Excel file)
    dataset = pd.read_csv('backend/recipe_dataset.csv')

    # Prepare a TF-IDF vectorizer to compare the query and the dataset
    vectorizer = TfidfVectorizer(stop_words='english')
    
    # Combine only the Keywords and keywords_name fields for searching
    dataset['combined'] = dataset['Keywords'] + ' ' + dataset['keywords_name']
    
    # Fit and transform the dataset and query using TF-IDF
    tfidf_matrix = vectorizer.fit_transform(dataset['combined'])
    query_vector = vectorizer.transform([query])

    # Calculate cosine similarity between the query and the dataset
    similarity_scores = cosine_similarity(query_vector, tfidf_matrix)
    similar_indices = similarity_scores.argsort().flatten()[-10:]  # Get top 10 results

    # Return the matching recipes by their IDs
    return dataset.iloc[similar_indices].to_dict('records')