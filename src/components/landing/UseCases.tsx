import { motion } from "framer-motion";
import { Building2, Smartphone, Briefcase, RefreshCw } from "lucide-react";

const cases = [
  { icon: Building2, title: "Retail Savings Account Onboarding", desc: "End-to-end orchestration for individual savings accounts." },
  { icon: Smartphone, title: "Digital-Only Account Opening", desc: "Fully digital journey optimized for modern banking experiences." },
  { icon: Briefcase, title: "SME Current Account Onboarding", desc: "Dynamically handle complex multi-signatory business account openings." },
  { icon: RefreshCw, title: "Re-KYC & Account Reactivation", desc: "Automate periodic re-verification and dormant account reactivation flows." },
];

const UseCases = () => (
  <section id="use-cases" className="section-padding">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          Built for Every <span className="gradient-text">Use Case</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Adaptable AI that fits your onboarding needs.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6 text-center group hover:glow-border transition-shadow duration-500"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
              <c.icon size={22} className="text-primary" />
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default UseCases;
