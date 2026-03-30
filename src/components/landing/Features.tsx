import { motion } from "framer-motion";
import { Workflow, GitBranch, Plug, BrainCircuit, Users } from "lucide-react";

const features = [
  { icon: Workflow, title: "Autonomous Planning", desc: "Break down account opening into sequential and parallel steps." },
  { icon: GitBranch, title: "Decision-Making", desc: "Decide when to proceed automatically, retry, or escalate to operations staff." },
  { icon: Plug, title: "Tool & System Interaction", desc: "Interface with KYC systems, document verification tools, CRM, and core banking systems." },
  { icon: BrainCircuit, title: "Memory & Learning", desc: "Learn from past onboarding cases to reduce drop-offs and delays." },
  { icon: Users, title: "Human-in-the-Loop", desc: "Escalate exceptions (e.g., unclear documents, high-risk profiles) to human reviewers." }
];

const Features = () => (
  <section id="features" className="section-padding">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          Key Agentic <span className="gradient-text">Capabilities</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Advanced intelligence powering the Account Opening Orchestration Agent.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card gradient-border rounded-2xl p-8 group hover:glow-border transition-shadow duration-500"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <f.icon size={24} className="text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
