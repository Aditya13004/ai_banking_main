import { useState } from "react";
import { Menu, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Testimonials", href: "#testimonials" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span><span className="gradient-text">Onboard</span> AI</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-transform hover:scale-105 active:scale-95"
            onClick={() => document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border/50 px-6 py-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <Button
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2 transition-transform hover:scale-105 active:scale-95"
            onClick={() => {
              setOpen(false);
              document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get Started
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
