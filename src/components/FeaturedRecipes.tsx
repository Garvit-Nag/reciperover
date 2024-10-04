'use client'

import React from 'react'
import recipeData from '../data/recipes.json'
import Link from 'next/link'
import { BackgroundGradient } from './ui/background-gradient'

interface Recipe{
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

function FeaturedCourses() {
    const mainRecipes = recipeData.recipes.filter((recipe:Recipe) => recipe.RecipeId)

function formatDuration(duration: string) {
        return duration.replace('PT', '').replace(/(\d+)(H|M|S)/g, '$1$2 ').trim();
    }

  return (
    <div className='py-12 bg-gray-900'>
        <div>
            <div className="text-center">
                <h2 className='text-base text-teal-600 font-semibold tracking wide uppercase'>
                    MAIN RECIPES
                </h2>
                <p className='mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl'>
                    Cook with us 🔥
                </p>
            </div>
        </div>
        <div className='mt-10 mx-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center'>
                {mainRecipes.map((recipe:Recipe)=> (
                    <div key={recipe.RecipeId} className="flex justify-center">
                        <BackgroundGradient className='flex flex-col rounded-[22px] bg-white dark:bg-zinc-900 overflow-hidden h-full max-w-sm'>
                            <div className='bg-black p-4 bg-neutral-900 sm:p-6 flex flex-col items-center text-center flex-grow'>
                                <p className='text-lg sm:text-xl text-white mt-4 mb-2 text-neutral-200'>{recipe.Name}</p>
                                <p className='text-sm text-white text-neutral-600 text-neutral-400 flex-grow'>{recipe.Description}</p>
                                <p className='text-sm mt-5 text-white text-neutral-600 text-neutral flex-grow'>Duration: {formatDuration(recipe.TotalTime)}</p>
                                <p className='text-sm mt-5 text-white text-neutral-600 text-neutral flex-grow'>Rating: {recipe.AggregatedRating}/5</p>
                                <Link className='text-sm text-white mt-5 text-neutral-600 text-neutral flex-grow border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800' href={'https://www.food.com/'}>
                                    Learn More
                                </Link>
                            </div>
                        </BackgroundGradient>
                    </div>
                ))}
            </div>
        </div>
        <div className='mt-16 mb-2 text-center'>
            <Link href={'/recipes'} className='px-4 py-2 rounded border border-neutral-600 text-neutral-700 bg-white hover:bg-gray-100 transition duration-200'>
                View All Recipes
            </Link>
        </div>    
    </div>
  )
}

export default FeaturedCourses