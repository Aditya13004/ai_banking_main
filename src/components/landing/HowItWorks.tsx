import { motion } from "framer-motion";
import { UserPlus, BrainCircuit, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Understand & Capture", desc: "Understands the complete workflow (data capture, KYC, verification) and proactively identifies missing information." },
  { icon: BrainCircuit, title: "Dynamically Orchestrate", desc: "Determines next steps based on inputs, coordinating tasks across internal systems, APIs, and human review teams." },
  { icon: CheckCircle2, title: "Optimize & Activate", desc: "Continuously learns from historical data to optimize the process and accelerate account activation." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-padding">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          How It <span className="gradient-text">Works</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Three simple steps to transform your onboarding process.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="glass-card rounded-2xl p-8 text-center group hover:glow-border transition-shadow duration-500"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <s.icon size={28} className="text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary mb-2 block">Step {i + 1}</span>
            <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
