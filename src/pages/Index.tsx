import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedSections from "@/components/FeaturedSections";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedSections />
      <Footer />
    </div>
  );
};

export default Index;
