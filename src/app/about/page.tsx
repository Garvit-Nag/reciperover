'use client';

import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black py-10">
      <div className="container mx-auto px-6">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">About Us</h1>

          <p className="text-lg text-gray-700 text-center mb-4">
            Welcome to <span className="font-semibold">RecipeRover</span>, where we are dedicated to offering the best recipes and food inspiration. Our mission is to help you discover new flavors, explore diverse cuisines, and enjoy cooking at home.
          </p>

          <p className="text-lg text-gray-700 text-center mb-4">
            At <span className="font-semibold">RecipeRover</span>, we believe that cooking should be fun, easy, and accessible for everyone. Whether you're an experienced chef or just starting out, we provide you with the tools and recipes you need to create delicious meals effortlessly.
          </p>

          <p className="text-lg text-gray-700 text-center">
            Thank you for visiting our site. We hope you find inspiration and joy in every recipe you try. If you have any queries, mail us at <a className="text-blue-600 underline" href="mailto:gurmeharsinghv@gmail.com">gurmeharsinghv@gmail.com</a>.
          </p>

          <div className="flex justify-center mt-6">
            <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;