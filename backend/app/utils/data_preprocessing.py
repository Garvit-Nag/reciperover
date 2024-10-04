import pandas as pd
import numpy as np
import ast
import logging

logger = logging.getLogger(__name__)

def preprocess_data(df):
    """
    Preprocess the dataframe by handling boolean, numerical, and list-like columns.
    """
    bool_columns = ['is_vegetarian', 'is_vegan', 'is_gluten free', 'is_dairy free', 
                    'is_low carb', 'is_keto', 'is_paleo']
    for col in bool_columns:
        df[col] = df[col].fillna(0).astype(int)
    
    numerical_columns = ['Calories', 'TotalTime_minutes', 'AggregatedRating', 'ReviewCount']
    for col in numerical_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(df[col].median())
    
    list_columns = ['RecipeIngredientParts', 'Keywords', 'keywords_name']
    for col in list_columns:
        df[col] = df[col].apply(parse_list_string)
    
    return df

def parse_list_string(s):
    """
    Safely parse list-like strings.
    """
    try:
        parsed = ast.literal_eval(s)
        return parsed if isinstance(parsed, list) else [s]
    except (ValueError, SyntaxError):
        return [s] if s else []

def parse_recipe_ingredients(ingredient_parts):
    """
    Parse RecipeIngredientParts field.
    """
    try:
        parsed = ast.literal_eval(ingredient_parts)
        if isinstance(parsed, list):
            if len(parsed) == 1 and isinstance(parsed[0], str):
                return [parsed[0]]
            elif all(isinstance(item, str) for item in parsed):
                return parsed
        return []
    except (ValueError, SyntaxError):
        return []

def parse_list_field(field):
    """
    Parse a list field, handling various input types.
    """
    if isinstance(field, list):
        return field
    elif isinstance(field, str):
        try:
            parsed = ast.literal_eval(field)
            return parsed if isinstance(parsed, list) else []
        except (ValueError, SyntaxError):
            return []
    return []