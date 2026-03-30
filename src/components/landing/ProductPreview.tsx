import { motion } from "framer-motion";
import heroDashboard from "@/assets/actual-dashboard.png";

const ProductPreview = () => (
  <section className="section-padding">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
          See It in <span className="gradient-text">Action</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          A unified dashboard for managing onboarding, verification, and compliance — all powered by AI.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="gradient-border glass rounded-3xl p-3 glow-primary"
      >
        <img
          src={heroDashboard}
          alt="AI Banking Dashboard showing onboarding workflow"
          className="rounded-2xl w-full"
          loading="lazy"
          width={1280}
          height={800}
        />
      </motion.div>
    </div>
  </section>
);

export default ProductPreview;
