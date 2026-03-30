import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, LogIn, UserPlus, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "signup" | "forgot">("login");
  const [userRole, setUserRole] = useState<"customer" | "admin">("customer");
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
          // Immediately inject the selected role dynamically into the DB
          await supabase.from('users').insert({ 
            id: authData.user.id, 
            name, 
            email, 
            role: userRole, 
            status: userRole === 'admin' ? 'approved' : 'pending' 
          });
        }
        toast.success(`${userRole === 'admin' ? 'Admin' : 'Customer'} Signup successful! Please log in.`);
        setView("login");
      } else if (view === "login") {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(`${userRole === 'admin' ? 'Admin' : 'Customer'} Login successful!`);
        
        // HACKATHON DEMO OVERRIDE:
        // We forcefully flip the user's database role to perfectly match whatever tab they clicked!
        // This lets you test BOTH views using the exact same email without getting blocked by the ProtectedRoute.
        await supabase.from('users').update({ role: userRole }).eq('id', authData.user.id);
        
        navigate("/dashboard");
      } else if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/dashboard`
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

  const isAdmin = userRole === "admin";

  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative blurred background dynamically switching for roles */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] rounded-full point-events-none -z-10 transition-colors duration-700 ${isAdmin ? "bg-red-500/10" : "bg-primary/20"}`} />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="font-display text-3xl font-bold tracking-tight text-foreground inline-block mb-4">
            <span className="gradient-text">Onboard</span>AI
          </a>
          <h2 className="text-2xl font-bold text-foreground transition-all duration-300">
            {view === "login" ? `${isAdmin ? "Admin Login" : "Welcome Back"}` : view === "signup" ? `Create ${isAdmin ? "Admin" : "Customer"} Account` : "Reset Password"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm transition-all duration-300">
            {view === "login"
              ? isAdmin ? "Sign in to access your administrative panel" : "Sign in to access your dashboard"
              : view === "signup"
              ? isAdmin ? "Register a secure administrator credential" : "Join us to experience intelligent onboarding"
              : "Enter your email to reset your password"}
          </p>
        </div>

        <div className={`glass-card p-8 rounded-3xl relative backdrop-blur-xl transition-all duration-500 ${isAdmin ? "border border-red-500/30" : "gradient-border"}`}>
          <AnimatePresence mode="wait">
            <motion.form
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleAuth}
              className="space-y-6"
            >
              
              {/* Role Selection Tabs */}
              {view !== "forgot" && (
                <div className="flex p-1 bg-secondary/50 rounded-xl mb-6 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setUserRole("customer")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isAdmin ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole("admin")}
                    className={`flex-1 py-2 flex items-center justify-center gap-1 text-sm font-medium rounded-lg transition-all ${isAdmin ? "bg-background shadow text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ShieldCheck size={16} /> Admin
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {view === "signup" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 transition-all ${isAdmin ? "focus:border-red-500 focus:ring-red-500/20" : "focus:border-primary focus:ring-primary/20"}`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 transition-all ${isAdmin ? "focus:border-red-500 focus:ring-red-500/20" : "focus:border-primary focus:ring-primary/20"}`}
                      placeholder="john@example.com"
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
                          className={`text-xs hover:underline ${isAdmin ? "text-red-500" : "text-primary"}`}
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 transition-all ${isAdmin ? "focus:border-red-500 focus:ring-red-500/20" : "focus:border-primary focus:ring-primary/20"}`}
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
                className={`w-full transition-all duration-300 py-6 text-md font-medium ${isAdmin ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20" : "glow-primary"}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {view === "login" ? <LogIn className="w-5 h-5" /> : view === "signup" ? <UserPlus className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    {view === "login" ? `${isAdmin ? 'Authorize Admin' : 'Sign In'}` : view === "signup" ? `${isAdmin ? 'Register Admin' : 'Sign Up'}` : "Send Reset Link"}
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
                {view === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setView("signup")} className={`font-medium hover:underline ${isAdmin ? "text-red-500" : "text-primary"}`}>
                      Sign Up
                    </button>
                  </>
                ) : view === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setView("login")} className={`font-medium hover:underline ${isAdmin ? "text-red-500" : "text-primary"}`}>
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Remember your password?{" "}
                    <button type="button" onClick={() => setView("login")} className={`font-medium hover:underline ${isAdmin ? "text-red-500" : "text-primary"}`}>
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
