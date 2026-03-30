import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AdminAuthPage() {
  const [view, setView] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (view === "signup") {
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            }
          }
        });
        if (error) throw error;
        if (authData.user) {
          // Secretly assigning the hardcoded 'admin' role! This allows you to easily test without messing with the DB manually.
          await supabase.from('users').insert({ id: authData.user.id, name, email, role: 'admin', status: 'approved' });
        }
        toast.success("Admin Signup successful! Please log in.");
        setView("login");
      } else if (view === "login") {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Admin Login successful!");
        navigate("/admin");
      } else if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin`
        });
        if (error) throw error;
        toast.success("Password reset email sent!");
        setView("login");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 blur-[120px] rounded-full point-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground inline-block mb-2">
            Secure Admin Portal
          </h1>
          <p className="text-red-400 font-medium">Restricted Access</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {view === "login"
              ? "Sign in to manage onboarding applications"
              : view === "signup"
              ? "Create an administrative account (Demo Feature)"
              : "Enter your email to reset your administrative password"}
          </p>
        </div>

        <div className="glass-card border border-red-500/20 p-8 rounded-3xl relative backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.form
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleAuth}
              className="space-y-6"
            >
              <div className="space-y-4">
                {view === "signup" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Admin Full Name</label>
                    <div className="relative">
                      <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background/50 border border-border focus:border-red-500/50 focus:ring-red-500/20 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 transition-all"
                        placeholder="Admin Name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background/50 border border-border focus:border-red-500/50 focus:ring-red-500/20 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 transition-all"
                      placeholder="admin@onboardai.com"
                      required
                    />
                  </div>
                </div>

                {view !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      {view === "login" && (
                        <button
                          type="button"
                          onClick={() => setView("forgot")}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-background/50 border border-border focus:border-red-500/50 focus:ring-red-500/20 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 transition-all"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 py-6 text-md font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {view === "login" ? <LogIn className="w-5 h-5" /> : view === "signup" ? <UserPlus className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    {view === "login" ? "Secure Sign In" : view === "signup" ? "Authorize Sign Up" : "Send Reset Link"}
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
                {view === "login" ? (
                  <>
                    Need admin access?{" "}
                    <button type="button" onClick={() => setView("signup")} className="text-red-500 font-medium hover:underline">
                      Sign Up Here
                    </button>
                  </>
                ) : view === "signup" ? (
                  <>
                    Already authorized?{" "}
                    <button type="button" onClick={() => setView("login")} className="text-red-500 font-medium hover:underline">
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Remember your password?{" "}
                    <button type="button" onClick={() => setView("login")} className="text-red-500 font-medium hover:underline">
                      Back to Sign In
                    </button>
                  </>
                )}
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
