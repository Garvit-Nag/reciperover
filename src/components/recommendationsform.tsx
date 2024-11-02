"use client";

import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { useRouter } from "next/navigation";
import Preloader from "../components/ui/Preloader";


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
  // const router = useRouter();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [category, setCategory] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [calories, setCalories] = useState(0);
  const [time, setTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false); // New state to track mounting
  const [protein, setProtein] = useState(0);

  const [availableDietaryPreferences, setAvailableDietaryPreferences] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState({ min: 0, max: 1100 });
  const [timeRange, setTimeRange] = useState({ min: 0, max: 12000000 });

  const categoryOptions = formData
    ? formData.categories.map((cat) => ({ value: cat, label: cat }))
    : [];

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      setDietaryPreference([]);
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
    if (category && dietaryPreference.length > 0 && formData && formData.ingredients) {
      const mergedIngredients = dietaryPreference.flatMap(
        (preference) => formData.ingredients[category]?.[preference] || []
      );
      
      // A Set to ensure unique values.
      const uniqueIngredients = [...new Set(mergedIngredients)];
      
      setAvailableIngredients(uniqueIngredients);
      setIngredients([]); 
    }
  }, [category, dietaryPreference, formData]);   

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!");
    
    if (!isMounted) {
      return;
    }
  
    setIsLoading(true);  // Show preloader
    
    const formPayload = {
      category,
      dietary_preference: dietaryPreference,
      ingredients,
      calories,
      time,
    };
    
    console.log("Form Payload: ", formPayload);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPayload),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit form");
      }
      
      const recommendations = await response.json();
      sessionStorage.setItem('recommendations', JSON.stringify(recommendations));
      router.push('/recommendations');
    } catch (error) {
      console.error("Error submitting the form:", error);
      setIsLoading(false);  // Hide preloader if there's an error
    }
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isLoading && <Preloader />}
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
              Dietary Preferences
            </label>
            <Select
              id="dietaryPreference"
              value={availableDietaryPreferences
                .filter((pref) => dietaryPreference.includes(pref))
                .map((pref) => ({ value: pref, label: pref }))}  // Map selected options
              onChange={(options) => setDietaryPreference(options ? options.map((option) => option.value) : [])}
              options={availableDietaryPreferences.map((pref) => ({
                value: pref,
                label: pref,
              }))}
              isMulti // Enables multiple selection.
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
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "#374151",
                  color: "#FFFFFF",
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "#FFFFFF", 
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: "#FFFFFF",
                  ":hover": {
                    backgroundColor: "#FF5A5F", 
                    color: "#FFFFFF",
                  },
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
            <label htmlFor="ingredients" className="block text-sm text-gray-300">
              Ingredients
            </label>
            <Select
              id="ingredients"
              value={availableIngredients
                .filter((ingredient) => ingredients.includes(ingredient))
                .map((ingredient) => ({ value: ingredient, label: ingredient }))} 
              onChange={(options) => setIngredients(options ? options.map((option) => option.value) : [])} 
              options={availableIngredients.map((ingredient) => ({
                value: ingredient,
                label: ingredient,
              }))}
              isMulti
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
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "#374151", 
                  color: "#FFFFFF",
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "#FFFFFF",
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: "#FFFFFF", 
                  ":hover": {
                    backgroundColor: "#FF5A5F", 
                    color: "#FFFFFF",
                  },
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
            <label htmlFor="calories" className="block text-sm text-gray-300">
              Calories ({calories})
            </label>
            <input
              id="calories"
              type="range"
              min={calorieRange.min}
              max={calorieRange.max}
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value, 10))}
              className="mt-2 w-full"
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
            {/* <Link href={'/recommended_recipes'}> */}
              <button
                type="submit"
                className="w-80 py-2 text-white bg-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-indigo-500 mx-auto"
              >
                Get Recommendations
              </button>
            {/* </Link> */}
          </div>
        </form>
      </div>
    </>
  );
};

export default RecipeRecommendationForm;