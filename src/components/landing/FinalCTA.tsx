import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="section-padding">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-20 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(245 58% 20%), hsl(280 40% 15%), hsl(228 15% 10%))",
        }}
      >
        <div className="absolute inset-0 bg-primary/5 animate-glow-pulse pointer-events-none" />
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 relative">
          Accelerate Onboarding with <span className="gradient-text">Onboard AI</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-10 relative">
          Reduce turnaround times, lower operational costs, and improve customer conversion rates. Join leading banks automating with Intelligent Orchestration.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary gap-2 relative transition-transform hover:scale-105 active:scale-95"
          onClick={() => document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Get Started Now <ArrowRight size={16} />
        </Button>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
