from dataclasses import dataclass
from typing import List

@dataclass
class Recipe:
    RecipeId: int
    Name: str
    RecipeCategory: str
    RecipeIngredientParts: List[str]
    Keywords: List[str]
    Calories: float
    TotalTime_minutes: int
    AggregatedRating: float
    ReviewCount: int