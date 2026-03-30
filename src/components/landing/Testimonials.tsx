import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  { quote: "Reduced account opening turnaround time significantly.", author: "Operations Director", org: "Global Bank" },
  { quote: "Lower onboarding operational costs with intelligent orchestration while maintaining compliance.", author: "VP Operations", org: "Digital Bank" },
  { quote: "Increased customer conversion rates and improved transparency across the entire experience.", author: "Chief Digital Officer", org: "Fintech Leader" },
];

const Testimonials = () => (
  <section id="testimonials" className="section-padding">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          Trusted by <span className="gradient-text">Leaders</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="glass-card rounded-2xl p-8 flex flex-col"
          >
            <Quote size={24} className="text-primary/40 mb-4" />
            <p className="text-foreground/90 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
            <div>
              <p className="text-sm font-semibold">{t.author}</p>
              <p className="text-xs text-muted-foreground">{t.org}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
