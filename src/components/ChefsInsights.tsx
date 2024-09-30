"use client";
import { StickyScroll } from "./ui/sticky-roll-reveal";
import Image from "next/image";
import React from 'react'

const content = [
  {
      title: "Pro Tips & Tricks",
      description:
          "Uncover the invaluable secrets that professional chefs rely on to elevate their dishes to restaurant-quality standards. From precise knife skills to perfect seasoning, these expert tips will transform your cooking and boost your culinary confidence."
  },
  {
      title: "Plating & Presentation",
      description:
          "Learn the art of plating like a professional, turning every dish into a visual masterpiece. Explore techniques that highlight color, texture, and balance to create stunning presentations that leave a lasting impression."
  },
  {
      title: "Kitchen Hacks",
      description:
          "Discover innovative and time-saving kitchen hacks that streamline your cooking process. These practical tips will help you navigate the kitchen efficiently, reducing prep time and minimizing effort with every meal."
  },
  {
      title: "Chef's Favorites",
      description:
          "Dive into a curated selection of beloved recipes and go-to meals from top chefs around the world. These signature dishes represent the heart and soul of their culinary expertise, perfect for any occasion or gathering."
  },
  {
      title: "Global Cuisine Exploration",
      description:
          "Embark on a culinary journey across continents with expert insights into international cooking traditions. Experience the diversity of flavors and techniques that define global cuisine, bringing new tastes into your kitchen."
  },
];  

function ChefsInsights() {
  return (
    <div>
        {/* <h3 className="text-center mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">Chef's Guide 👨🏻‍🍳</h3> */}
        <StickyScroll content={content}/> 
    </div>
  )
}

export default ChefsInsights