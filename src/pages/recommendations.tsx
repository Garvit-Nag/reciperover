import { useEffect, useState } from "react";
// import Link from "next/link";

interface Recipe {
  RecipeId: number;
  Name: string;
  RecipeCategory: string;
  RecipeIngredientParts: string[];
  RecipeIngredientQuantities: string[];
  Keywords: string[];
  keywords_name: string[];
  Calories: number;
  TotalTime_minutes: number;
  AggregatedRating: number;
  ReviewCount: number;
  Description: string;
  RecipeInstructions: string[];
  Images: string[];
  Similarity: number;
}

const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);

  useEffect(() => {
    const storedRecommendations = sessionStorage.getItem('recommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
      sessionStorage.removeItem('recommendations');
    }
  }, []);

  if (!recommendations.length) {
    return <div className="text-white text-center p-10">No recommendations found.</div>;
  }

  return (
    <div className="bg-gray-900 p-10 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Your Recipe Recommendations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((recipe) => (
          <div key={recipe.RecipeId} className="bg-neutral-800 p-5 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{recipe.Name}</h2>
            {recipe.Images && recipe.Images.length > 0 && (
              <img src={recipe.Images[0]} alt={recipe.Name} className="w-full h-48 object-cover mb-4 rounded" />
            )}
            <p className="mb-2">Category: {recipe.RecipeCategory}</p>
            <p className="mb-2">Keywords: {recipe.Keywords.join(", ")}</p>
            <p className="mb-2">Name Keywords: {recipe.keywords_name.join(", ")}</p>
            <p className="mb-2">Calories: {recipe.Calories.toFixed(1)}</p>
            <p className="mb-2">Time: {recipe.TotalTime_minutes} minutes</p>
            <p className="mb-2">Rating: {recipe.AggregatedRating.toFixed(1)} ({recipe.ReviewCount} reviews)</p>
            <p className="mb-2">Similarity: {(recipe.Similarity * 100).toFixed(2)}%</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-teal-400">View Description</summary>
              <p className="mt-2">{recipe.Description}</p>
            </details>
            <details className="mt-4">
              <summary className="cursor-pointer text-teal-400">View Ingredients</summary>
              <p>
                Ingredients: {recipe.RecipeIngredientParts.join(", ")}
              </p>
            </details>
            <details className="mt-4">
              <summary className="cursor-pointer text-teal-400">View Instructions</summary>
              <ol className="list-decimal list-inside mt-2">
                {recipe.RecipeInstructions.map((step, stepIndex) => (
                  <li key={stepIndex} className="mb-1">{step}</li>
                ))}
              </ol>
            </details>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <a className="text-teal-400 hover:underline">Back to Recommendation Form</a>
      </div>
    </div>
  );
};

export default RecommendationsPage;