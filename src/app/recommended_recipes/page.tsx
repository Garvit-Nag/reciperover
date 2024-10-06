'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Sample Recipes Data
const sampleRecipes = [
  {
    name: 'Spaghetti with Spicy Mixed Seafood',
    rating: 4.9,
    imageUrl:
      'https://img.sndimg.com/food/image/upload/v1/img/feed/56/pzhS4q7QKSMqZASDBtNB_IMG_20180506_232451.jpg',
    description: 'A delicious mix of seafood and pasta.',
    calories: 320,
    time: 30,
    instructions: 'Boil pasta. Cook seafood with spices. Combine and serve hot.',
  },
  {
    name: 'Grilled Chicken Salad',
    rating: 4.5,
    imageUrl:
      'https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/58/picY2Aqui.jpg',
    description: 'A light, healthy chicken salad.',
    calories: 250,
    time: 15,
    instructions: 'Grill chicken. Chop vegetables. Mix together with dressing.',
  },
  {
    name: 'Beef Steak with Vegetables',
    rating: 4.8,
    imageUrl:
      'https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/AFPDDHATWzQ0b1CDpDAT_255%20berry%20blue%20frzn%20dess.jpg',
    description: 'Juicy beef steak served with veggies.',
    calories: 450,
    time: 40,
    instructions: 'Season steak. Grill to desired doneness. Serve with veggies.',
  },
];

// Recipe Interface
interface Recipe {
  name: string;
  rating: number;
  imageUrl: string;
  description: string;
  calories: number;
  time: number;
  instructions: string;
}

// Recipe Card Component
const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full max-w-sm mx-auto shadow-white rounded-md shadow-md overflow-hidden cursor-pointer">
      <div className="relative h-64">
        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold">
          ★ {recipe.rating}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-lg font-semibold bg-gradient-to-t from-black to-transparent">
          {recipe.name}
        </div>
      </div>
      <div className="p-4 bg-black">
        <p className="text-white text-sm mb-2">{recipe.description}</p>
        <div className="flex justify-between text-sm font-semibold text-white">
          <span>🔥 {recipe.calories} Calories</span>
          <span>⏳ {recipe.time} mins</span>
        </div>
      </div>
    </div>
  );
};

// Expanded Card Component
const ExpandedCard: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
      onClick={onClose}>
      <div
        className="bg-white rounded-lg overflow-hidden max-w-3xl w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-black text-xl">
          ✕
        </button>
        <div className="flex flex-col lg:flex-row">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full lg:w-1/3 object-cover rounded-lg"
          />
          <div className="p-6 lg:w-2/3">
            <h2 className="text-3xl font-bold mb-4">{recipe.name}</h2>
            <p className="text-gray-700 mb-4">{recipe.description}</p>
            <div className="flex justify-between text-gray-800 font-semibold mb-6">
              <span>🔥 {recipe.calories} Calories</span>
              <span>⏳ {recipe.time} mins</span>
              <span>★ {recipe.rating}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Instructions:</h3>
            <p className="text-gray-700">{recipe.instructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recipe List Component
const RecipeList: React.FC<{ recipes: Recipe[] }> = ({ recipes }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
        ))}
      </div>
      {selectedRecipe && <ExpandedCard recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
      <div className="text-center mt-10">
        <Link href={'/recipes'}>
          <button className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition">
            Explore More
          </button>
        </Link>
      </div>
    </div>
  );
};

// Parent Component
const RecommendedRecipesPage: React.FC = () => {
  return (
    <div className="inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#80808055_1px,transparent_1px),linear-gradient(to_bottom,#80808055_1px,transparent_1px)] bg-[size:20px_20px] min-h-screen">
      <h1 className="text-center text-3xl font-bold py-6 text-white underline">Recommended Recipes</h1>
      <RecipeList recipes={sampleRecipes} />
    </div>
  );
};

export default RecommendedRecipesPage;