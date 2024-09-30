'use client'

import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/search?q=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  return (
    <div className='py-12 bg-gray-900'>
      <div className="top-90 my-10 inset-x-0 max-w-2xl mx-auto z-50">
        <h1>Recipe Search</h1>
        <input
          className='text-black bg-white'
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a recipe..."
        />
        <button onClick={handleSearch}>Search</button>
        <div> 
          {results.map((recipe) => (
            <div key={recipe.RecipeId}>
              <h2>{recipe.Name}</h2>
              <p><strong>Author:</strong> {recipe.AuthorName}</p>
              <p><strong>Description:</strong> {recipe.Description}</p>
              <p><strong>Cook Time:</strong> {recipe.CookTime}</p>
              <p><strong>Ingredients:</strong> {recipe.RecipeIngredientParts}</p>
              {/* Add more fields as needed */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;