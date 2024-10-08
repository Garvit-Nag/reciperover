// File: src/app/recommendations/page.tsx
"use client"

import { useEffect, useState, useRef } from "react";
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

// ScrollArea component implementation
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`overflow-auto ${className}`}>
      {children}
    </div>
  );
};

// Skeleton component implementation
const Skeleton = ({ className }: { className: string }) => {
  return (
    <div className={`animate-pulse bg-gray-600 ${className}`}></div>
  );
};

// Dialog component implementation
const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>
      <div onClick={e => e.stopPropagation()} className="bg-[#1E1E1E] rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="text-white p-6">{children}</div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold">{children}</h2>
);

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-300 mt-2">{children}</p>
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
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <div
      className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
      onClick={() => setSelectedRecipe(recipe)}
    >
      <div className="relative">
        {recipe.Images && recipe.Images.length > 0 && (
          <img
            src={recipe.Images[0]}
            alt={recipe.Name}
            className="w-full h-48 object-cover"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = defaultImageUrl)} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
          <Star className="w-4 h-4 text-yellow-400 inline" />
          <span className="text-white text-sm ml-1">{recipe.AggregatedRating.toFixed(1)}</span>
        </div>
        <h3 className="absolute bottom-2 left-2 text-white font-semibold text-lg truncate w-11/12">
          {recipe.Name}
        </h3>
      </div>
      <div className="p-4 text-white">
        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{recipe.Description}</p>
        <div className="flex justify-between text-sm">
          <span className="flex items-center">
            <Flame className="w-4 h-4 text-[#14B8A6] mr-1" />
            {recipe.Calories.toFixed(0)} cal
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 text-[#14B8A6] mr-1" />
            {recipe.TotalTime_minutes} mins
          </span>
        </div>
      </div>
    </div>
  );

  const RecipeCardSkeleton = () => (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] p-8">
      <h1 className="text-4xl font-semibold text-center mb-12 text-white">Your Recipe Recommendations</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-white text-center p-10">No recommendations found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recommendations.map((recipe) => (
            <RecipeCard key={recipe.RecipeId} recipe={recipe} />
          ))}
        </div>
      )}

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent>
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipe.Name}</DialogTitle>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(80vh-4rem)]">
                <div className="space-y-4">
                  {selectedRecipe.Images && selectedRecipe.Images.length > 0 && (
                    <img
                      src={selectedRecipe.Images[0]}
                      alt={selectedRecipe.Name}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => (e.currentTarget.src = defaultImageUrl)} 
                    />
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span>{selectedRecipe.AggregatedRating.toFixed(1)} ({selectedRecipe.ReviewCount} reviews)</span>
                    </div>
                    <div className="flex space-x-4">
                      <span className="flex items-center">
                        <Flame className="w-5 h-5 text-[#14B8A6] mr-1" />
                        {selectedRecipe.Calories.toFixed(0)} cal
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-5 h-5 text-[#14B8A6] mr-1" />
                        {selectedRecipe.TotalTime_minutes} mins
                      </span>
                    </div>
                  </div>
                  <DialogDescription>{selectedRecipe.Description}</DialogDescription>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Category</h4>
                    <p className="text-gray-300">{selectedRecipe.RecipeCategory}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Keywords</h4>
                    <p className="text-gray-300">{selectedRecipe.Keywords.join(", ")}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Ingredients</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {selectedRecipe.RecipeIngredientParts.map((ingredient, index) => (
                        <li key={index}>
                          {selectedRecipe.RecipeIngredientQuantities[index]} {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Instructions</h4>
                    <ol className="list-decimal list-inside text-gray-300">
                      {selectedRecipe.RecipeInstructions.map((instruction, index) => (
                        <li key={index} className="mb-2">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Similarity</h4>
                    <p className="text-gray-300 mb-10">{(selectedRecipe.Similarity * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
      <div className="mt-12 text-center">
        <a href="/" className="text-teal-400 hover:underline hover:text-teal-300">Back to Recommendation Form</a>
      </div>
    </div>
  );
};

export default RecommendationsPage;