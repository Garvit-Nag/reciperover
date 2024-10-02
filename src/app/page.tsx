import ChefsInsights from "@/components/ChefsInsights";
import FeaturedRecipes from "@/components/FeaturedRecipes";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import InstructionsOfRecipes from "@/components/InstructionsOfRecipes";
import InstructionTestimonialCards from "@/components/InstructionTestimonialCards";
import Navbar from "@/components/Navbar";
import RecipeRecommendationForm from "@/components/RecommendationsForm";
import Search from "@/pages/search";

export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Navbar/>
      <HeroSection/>
      <FeaturedRecipes/>
      <RecipeRecommendationForm/>
      <ChefsInsights/>
      <InstructionTestimonialCards/>
      <InstructionsOfRecipes/>
      <Footer/>
    </main>
  );
}