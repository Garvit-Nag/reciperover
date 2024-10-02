"use client";

import React, { useState, useEffect } from 'react';

interface FormData {
  categories: string[];
  dietary_preferences: {
    [key: string]: string[];
  };
  ingredients: {
    [key: string]: {
      [key: string]: string[];
    };
  };
  calorie_ranges: {
    [key: string]: { min: number; max: number };
  };
  time_ranges: {
    [key: string]: { min: number; max: number };
  };
}

const RecipeRecommendationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [category, setCategory] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [calories, setCalories] = useState(0);
  const [time, setTime] = useState(0);

  const [availableDietaryPreferences, setAvailableDietaryPreferences] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState({ min: 0, max: 1000 });
  const [timeRange, setTimeRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    async function fetchFormData() {
      try {
          const response = await fetch('http://127.0.0.1:5000/form-data'); // Update this line
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();
          // Handle the data
      } catch (error) {
          console.error('Error fetching form data:', error);
      }
    }

    fetchFormData();
  }, []);
  console.log('Rendering form with data:', formData);
  useEffect(() => {
    if (category && formData) {
      setAvailableDietaryPreferences(formData.dietary_preferences[category] || []);
      setDietaryPreference('');
      setIngredients([]);
      if (formData.calorie_ranges && formData.calorie_ranges[category]) {
        setCalorieRange(formData.calorie_ranges[category]);
        setCalories(formData.calorie_ranges[category].min);
      } else {
        setCalorieRange({ min: 0, max: 1000 });
        setCalories(0);
      }
      if (formData.time_ranges && formData.time_ranges[category]) {
        setTimeRange(formData.time_ranges[category]);
        setTime(formData.time_ranges[category].min);
      } else {
        setTimeRange({ min: 0, max: 1000 });
        setTime(0);
      }
    }
  }, [category, formData]);

  useEffect(() => {
    if (category && dietaryPreference && formData && formData.ingredients) {
      setAvailableIngredients(formData.ingredients[category]?.[dietaryPreference] || []);
      setIngredients([]);
    }
  }, [category, dietaryPreference, formData]);

  const handleIngredientChange = (ingredient: string) => {
    setIngredients(prev => 
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ category, dietaryPreference, ingredients, calories, time });
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a category</option>
          {formData.categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
          <label htmlFor="dietaryPreference" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
          <select
          id="dietaryPreference"
          value={dietaryPreference}
          onChange={(e) => setDietaryPreference(e.target.value)}
          disabled={!category}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a dietary preference</option>
          {availableDietaryPreferences.map((pref) => (
            <option key={pref} value={pref}>{pref}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ingredients</label>
        <div className="mt-2 space-y-2">
          {availableIngredients.map((ingredient) => (
            <label key={ingredient} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={ingredients.includes(ingredient)}
                onChange={() => handleIngredientChange(ingredient)}
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2">{ingredient}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
          Calories: {calories}
        </label>
        <input
          type="range"
          id="calories"
          min={calorieRange.min}
          max={calorieRange.max}
          value={calories}
          onChange={(e) => setCalories(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Total Time (minutes): {time}
        </label>
        <input
          type="range"
          id="time"
          min={timeRange.min}
          max={timeRange.max}
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Get Recommendations
      </button>
    </form>
  );
};

export default RecipeRecommendationForm;