'use client';

import React, { useState } from 'react';
import axios from 'axios';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>(''); // User's input query
  const [results, setResults] = useState<any[]>([]); // Search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/search', { query });
      console.log('API Response:', response.data); // Log the response
  
      // Adjust based on actual response structure
      if (response.data && Array.isArray(response.data.recipes)) {
        setResults(response.data.recipes);
      } else if (response.data && response.data.data && Array.isArray(response.data.data.recipes)) {
        setResults(response.data.data.recipes);
      } else if (response.data && response.data.success && Array.isArray(response.data.recipes)) {
        setResults(response.data.recipes);
      } else {
        setResults([]);
        setError('Unexpected response format from the server.');
        console.error('Unexpected response format:', response.data); // Log unexpected format
      }
    } catch (error) {
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Error:', error);
      }
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };    

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="container mx-auto px-6">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter keywords to search recipes..."
              required
              data-processedid={undefined} // Or remove unnecessary attributes
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 mt-4 rounded-lg hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Display Error */}
          {error && (
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
          )}

          {/* Display Search Results */}
          <div>
            {results && results.length > 0 ? ( // Check if results is defined
              <div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Search Results:</h2>
                <ul>
                  {results.map((recipe) => (
                    <li key={recipe.recipe_id} className="text-lg text-gray-700 mb-2">
                      {recipe.keywords_name} ({recipe.keywords})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-lg text-gray-700 text-center">
                {loading ? '' : 'No results found'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;