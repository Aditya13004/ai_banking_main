import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroDashboard from "@/assets/actual-dashboard.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center section-padding pt-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-glow-pulse pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-primary mb-6 border border-primary/30 rounded-full px-4 py-1.5">
          Intelligent Onboarding
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
          Onboard AI for Intelligent{" "}
          <span className="gradient-text glow-text">Account Opening</span> & Onboarding
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Overcome manual handoffs, delays, and repetitive verification. Our Orchestration Agent dynamically manages the complete lifecycle—from KYC to account activation.
        </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary gap-2 transition-transform hover:scale-105 active:scale-95"
              onClick={() => document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Onboarding <ArrowRight size={16} />
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary gap-2 transition-transform hover:scale-105 active:scale-95">
              <Play size={16} /> View Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="gradient-border glass rounded-2xl p-2 glow-border">
            <img
              src={heroDashboard}
              alt="AI-powered banking onboarding dashboard"
              className="rounded-xl w-full"
              width={1280}
              height={800}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
