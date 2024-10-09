"use client";

import { useEffect, useState } from "react";
import { Star, Clock, Flame, X } from "lucide-react";

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

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-gray-900 text-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => (
  <div className={`overflow-auto ${className}`}>
    {children}
  </div>
);

const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRecommendations = sessionStorage.getItem('recommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
      sessionStorage.removeItem('recommendations');
    }
    setIsLoading(false);
  }, []);

  const defaultImageUrl = "default.png";

  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
    <div
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={() => setSelectedRecipe(recipe)}
    >
      <div className="relative">
        <img
          src={recipe.Images[0] || defaultImageUrl}
          alt={recipe.Name}
          className="w-full h-56 object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = defaultImageUrl)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute top-3 right-3 bg-yellow-400 rounded-full p-2 flex items-center space-x-1">
          <Star className="w-4 h-4 text-gray-900" />
          <span className="font-bold text-gray-900">{recipe.AggregatedRating.toFixed(1)}</span>
        </div>
        <h3 className="absolute bottom-3 left-3 text-white font-bold text-xl truncate w-11/12">
          {recipe.Name}
        </h3>
      </div>
      <div className="p-4 text-white">
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{recipe.Description}</p>
        <div className="flex justify-between text-sm">
          <span className="flex items-center bg-gray-700 rounded-full px-3 py-1">
            <Flame className="w-4 h-4 text-red-400 mr-2" />
            {recipe.Calories.toFixed(0)} cal
          </span>
          <span className="flex items-center bg-gray-700 rounded-full px-3 py-1">
            <Clock className="w-4 h-4 text-blue-400 mr-2" />
            {recipe.TotalTime_minutes} mins
          </span>
        </div>
      </div>
    </div>
  );

  const RecipeCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-56 bg-gray-700" />
      <div className="p-4">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-700 rounded w-full mb-3" />
        <div className="h-4 bg-gray-700 rounded w-full mb-3" />
        <div className="flex justify-between">
          <div className="h-8 bg-gray-700 rounded-full w-1/3" />
          <div className="h-8 bg-gray-700 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <h1 className="text-5xl font-bold text-center mb-12 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Your Recipe Recommendations</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-white text-center p-10 text-2xl">No recommendations found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.slice(0, 6).map((recipe) => (
            <RecipeCard key={recipe.RecipeId} recipe={recipe} />
          ))}
        </div>
      )}

      <Dialog open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)}>
        {selectedRecipe && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">{selectedRecipe.Name}</h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ScrollArea className="max-h-[calc(80vh-4rem)] pr-4">
              <div className="space-y-6">
                <img
                  src={selectedRecipe.Images[0] || defaultImageUrl}
                  alt={selectedRecipe.Name}
                  className="w-full h-56 object-cover rounded-lg"
                  onError={(e) => (e.currentTarget.src = defaultImageUrl)}
                />
                <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-6 h-6 text-yellow-400 mr-2" />
                    <span className="text-lg">{selectedRecipe.AggregatedRating.toFixed(1)} ({selectedRecipe.ReviewCount} reviews)</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="flex items-center bg-gray-700 rounded-full px-4 py-2">
                      <Flame className="w-5 h-5 text-red-400 mr-2" />
                      {selectedRecipe.Calories.toFixed(0)} cal
                    </span>
                    <span className="flex items-center bg-gray-700 rounded-full px-4 py-2">
                      <Clock className="w-5 h-5 text-blue-400 mr-2" />
                      {selectedRecipe.TotalTime_minutes} mins
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-lg">{selectedRecipe.Description}</p>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Category</h4>
                  <p className="text-gray-300">{selectedRecipe.RecipeCategory}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.Keywords.map((keyword, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">{keyword}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Ingredients</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {selectedRecipe.RecipeIngredientParts.map((ingredient, index) => (
                      <li key={index}>
                        <span className="font-medium">{selectedRecipe.RecipeIngredientQuantities[index]}</span> {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Instructions</h4>
                  <ol className="list-decimal list-inside text-gray-300 space-y-4">
                    {selectedRecipe.RecipeInstructions.map((instruction, index) => (
                      <li key={index} className="pl-2">{instruction}</li>
                    ))}
                  </ol>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">Similarity</h4>
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${selectedRecipe.Similarity * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 mt-2">{(selectedRecipe.Similarity * 100).toFixed(2)}% match</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </Dialog>
      <div className="mt-12 text-center">
        <Button onClick={() => window.location.href = "/"}>
          Back to Recommendation Form
        </Button>
      </div>
    </div>
  );
};

export default RecommendationsPage;