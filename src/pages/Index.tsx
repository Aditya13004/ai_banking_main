import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ProductPreview from "@/components/landing/ProductPreview";
import UseCases from "@/components/landing/UseCases";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import AiAssistant from "@/components/ui/AiAssistant";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <HowItWorks />
    <Features />
    <ProductPreview />
    <UseCases />
    <Testimonials />
    <FinalCTA />
    <Footer />
    <AiAssistant />
  </div>
);

export default Index;
