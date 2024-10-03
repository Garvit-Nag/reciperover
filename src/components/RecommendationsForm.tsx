"use client";

import React, { useState, useEffect } from "react";
import Select from 'react-select';

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
  const [category, setCategory] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [calories, setCalories] = useState(0);
  const [time, setTime] = useState(0);

  const [availableDietaryPreferences, setAvailableDietaryPreferences] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState({ min: 0, max: 1100 });
  const [timeRange, setTimeRange] = useState({ min: 0, max: 12000000 });

  const categoryOptions = formData
    ? formData.categories.map((cat) => ({ value: cat, label: cat }))
    : [];

  useEffect(() => {
    async function fetchFormData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/form-data"); // Fetching from the backend.
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json(); 
        setFormData(data); 
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    }

    fetchFormData();
  }, []);

  useEffect(() => {
    if (category && formData) {
      setAvailableDietaryPreferences(formData.dietary_preferences[category] || []);
      setDietaryPreference("");
      setIngredients([]);
      if (formData.calorie_ranges && formData.calorie_ranges[category]) {
        setCalorieRange(formData.calorie_ranges[category]);
        setCalories(formData.calorie_ranges[category].min);
      } else {
        setCalorieRange({ min: 0, max: 1100 });
        setCalories(0);
      }
      if (formData.time_ranges && formData.time_ranges[category]) {
        setTimeRange(formData.time_ranges[category]);
        setTime(formData.time_ranges[category].min);
      } else {
        setTimeRange({ min: 0, max: 12000000 });
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
    setIngredients((prev) =>
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient]
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
    <div style={{ background: "#0f172a", padding: "20px" }}>
      <h3 className="text-base text-teal-400 font-semibold tracking wide uppercase" style={{ textAlign: "center" }}>
        Recommendation Form
      </h3>
      <p className="mt-2 mb-10 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl my-5" style={{ textAlign: "center" }}>
        Choose your Recipe 🍵
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 rounded-lg shadow-md max-w-lg mx-auto bg-neutral-900"
        style={{color: "white", border: '2px solid white'}}
      >
        <div>
          <label htmlFor="category" className="block text-sm text-gray-300">
            Category
          </label>
          <Select
            id="category"
            value={categoryOptions.find((option) => option.value === category)}
            onChange={(option) => setCategory(option?.value || "")}
            options={categoryOptions}
            className="mt-2 block w-full"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "#1F2937", 
                color: "#FFFFFF", 
                borderColor: "#6B7280", 
                "&:hover": {
                  borderColor: "#4B5563", 
                },
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#FFFFFF", 
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1F2937", 
                color: "#FFFFFF", 
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? "#374151" : "#1F2937", 
                "&:hover": {
                  backgroundColor: "#374151", 
                },
                color: "#FFFFFF", 
              }),
            }}
            maxMenuHeight={150} 
          />
        </div>

        <div>
          <label htmlFor="dietaryPreference" className="block text-sm text-gray-300">
            Dietary Preference
          </label>
          <Select
            id="dietaryPreference"
            value={availableDietaryPreferences
              .map((pref) => ({ value: pref, label: pref }))
              .find((option) => option.value === dietaryPreference)} 
            onChange={(option) => setDietaryPreference(option?.value || "")}
            options={availableDietaryPreferences.map((pref) => ({
              value: pref,
              label: pref,
            }))}
            isDisabled={!category} 
            className="mt-2 block w-full"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "#1F2937", 
                color: "#FFFFFF", 
                borderColor: "#6B7280", 
                "&:hover": {
                  borderColor: "#4B5563", 
                },
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#FFFFFF", 
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1F2937", 
                color: "#FFFFFF", 
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? "#374151" : "#1F2937", 
                "&:hover": {
                  backgroundColor: "#374151", 
                },
                color: "#FFFFFF",
              }),
            }}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Ingredients</label>
          <div className="mt-2 space-y-4"> 
            {availableIngredients.map((ingredient) => (
              <label key={ingredient} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={ingredients.includes(ingredient)}
                  onChange={() => handleIngredientChange(ingredient)}
                  className="form-checkbox h-4 w-4 text-indigo-400 bg-gray-800 rounded"
                />
                <span className="ml-1 mr-4 text-gray-300">{ingredient}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="calories" className="block text-sm text-gray-300">
            Calories: {calories}
          </label>
          <input
            type="range"
            id="calories"
            min={calorieRange.min}
            max={calorieRange.max}
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="mt-2 w-full h-2 bg-gray-600 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm text-gray-300">
            Total Time (minutes): 
          </label>
          <input
            type="number"
            id="time"
            min={timeRange.min}
            max={timeRange.max}
            value={time === 0 ? "" : time} 
            onChange={(e) => setTime(Number(e.target.value) || 0)} 
            className="mt-2 block w-full border border-gray-500 text-white py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ background: '#1f2937', borderRadius: '4px', height: '38px' }}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-80 py-2 text-white bg-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-indigo-500 mx-auto"
          >
            Get Recommendations
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeRecommendationForm;