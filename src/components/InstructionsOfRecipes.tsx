'use client'
import Link from "next/link";
import recipeData from '../data/recipes.json'
import { HoverEffect } from "./ui/card-hover-effect";

interface Recipe {
    RecipeId: number,
    Name: string,
    AuthorId: number,
    AuthorName: string,
    CookTime: string,
    PrepTime: string,
    TotalTime: string,
    DatePublished: string,
    Description: string,
    Images: Array<string>,
    RecipeCategory: string,
    Keywords: string,
    RecipeIngredientQuantities: Array<string>,
    RecipeIngredientParts: Array<string>,
    AggregatedRating: number,
    ReviewCount: number,
    Calories: number,
    FatContent: number,
    SaturatedFatContent: number,
    CholesterolContent: number,
    SodiumContent: number,
    CarbohydrateContent: number,
    FiberContent: number,
    SugarContent: number,
    ProteinContent: number,
    RecipeServings: number,
    RecipeYield: string,
    RecipeInstructions: string
}

const items = recipeData.recipes.map((recipe: Recipe) => ({
    instr: recipe.RecipeInstructions,
    title: recipe.Name,
    name: recipe.AuthorName 
}));

const InstructionsOfRecipes = () => {
  return (
    <div className="p-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
            Recommended Dishes
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-light text-white sm:text-4xl">
            Improve Your Cooking Persona
          </p>
        </div>
        <div className="mt-10">
            <HoverEffect items={items.map(instruction => (
                {
                    title: instruction.title,
                    instr: instruction.instr,
                    name: instruction.name
                }
            ))}/>
        </div>
        <div className="mt-10 text-center">
          <Link
            href={"/recipes"}
            className="px-4 py-2 rounded border border-neutral-600 text-neutral-700 bg-white hover:bg-gray-100 transition duration-200"
          >
            View all Dishes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InstructionsOfRecipes