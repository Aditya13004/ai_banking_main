const columns = [
  { title: "Product", links: ["Overview", "Dashboard", "Integrations", "Pricing"] },
  { title: "Features", links: ["Workflow Automation", "Decision Engine", "KYC Integration", "Analytics"] },
  { title: "Use Cases", links: ["Retail Banking", "Digital Accounts", "SME Onboarding", "Re-KYC"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
];

const Footer = () => (
  <footer className="border-t border-border/50 section-padding py-16">
    <div className="max-w-7xl mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-1">
          <span className="font-display text-xl font-bold">
            <span className="gradient-text">Onboard</span> AI
          </span>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Intelligent automation for modern banking onboarding.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-border/30 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Onboard AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
