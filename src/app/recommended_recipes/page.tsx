import React from "react";

const sampleRecipes = [
  {
    name: "Spaghetti with Spicy Mixed Seafood",
    rating: 4.9,
    imageUrl: "https://img.sndimg.com/food/image/upload/v1/img/feed/56/pzhS4q7QKSMqZASDBtNB_IMG_20180506_232451.jpg",
    description: "A delicious mix of seafood and pasta.",
    calories: 320,
    time: 30,
  },
  {
    name: "Grilled Chicken Salad",
    rating: 4.5,
    imageUrl: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/58/picY2Aqui.jpg",
    description: "A light, healthy chicken salad.",
    calories: 250,
    time: 15,
  },
  {
    name: "Beef Steak with Vegetables",
    rating: 4.8,
    imageUrl: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/AFPDDHATWzQ0b1CDpDAT_255%20berry%20blue%20frzn%20dess.jpg",
    description: "Juicy beef steak served with veggies.",
    calories: 450,
    time: 40,
  },
  {
    name: "Grilled Chicken Salad",
    rating: 4.5,
    imageUrl: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/58/picY2Aqui.jpg",
    description: "A light, healthy chicken salad.",
    calories: 250,
    time: 15,
  },
  {
    name: "Beef Steak with Vegetables",
    rating: 4.8,
    imageUrl: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/AFPDDHATWzQ0b1CDpDAT_255%20berry%20blue%20frzn%20dess.jpg",
    description: "Juicy beef steak served with veggies.",
    calories: 450,
    time: 40,
  },
  {
    name: "Grilled Chicken Salad",
    rating: 4.5,
    imageUrl: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/58/picY2Aqui.jpg",
    description: "A light, healthy chicken salad.",
    calories: 250,
    time: 15,
  }
  // Add more recipes as needed
];

interface Recipe {
  name: string;
  rating: number;
  imageUrl: string;
  description: string;
  calories: number;
  time: number;
}

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto shadow-white rounded-md shadow-md overflow-hidden">
      <div className="relative h-64">
        {/* Recipe Image as Background */}
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {/* Rating Badge */}
        <div className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold">
          ★ {recipe.rating}
        </div>
        {/* Gradient Overlay and Recipe Name */}
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 text-white p-3 text-lg font-semibold">
          {recipe.name}
        </div>
      </div>
      {/* Recipe Description, Calories and Time */}
      <div className="p-4 bg-black">
        <p className="text-white text-sm mb-2">{recipe.description}</p>
        <div className="flex justify-between text-sm font-semibold text-white">
          <span>🔥{recipe.calories} Calories</span>
          <span>⏳{recipe.time} mins</span>
        </div>
      </div>
    </div>
  );
};

const RecipeList: React.FC<{ recipes: Recipe[] | undefined }> = ({ recipes }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cards in 2 Rows with 3 Cards Each */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ensure recipes is defined before using slice */}
        {recipes && recipes.length > 0 ? (
          recipes.slice(0, 6).map((recipe, index) => (
            <RecipeCard key={index} recipe={recipe} />
          ))
        ) : (
          <p>No recipes available</p>
        )}
      </div>
      {/* Arrow Button to Explore More */}
      <div className="text-center mt-10">
        <button className="bg-white text-black px-6 py-2 rounded-md">
          Explore More
        </button>
      </div>
    </div>
  );
};

// Define a functional component to render the RecipeList
const RecommendedRecipesPage: React.FC = () => {
  return (
    <div className="inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#80808055_1px,transparent_1px),linear-gradient(to_bottom,#80808055_1px,transparent_1px)] bg-[size:20px_20px]">
      <h1 className="text-center text-3xl font-bold py-6 text-white underline">Recommended Recipes</h1>
      <RecipeList recipes={sampleRecipes} />
    </div>
  );
};

export default RecommendedRecipesPage;