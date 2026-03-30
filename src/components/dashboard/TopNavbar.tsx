import { Search, Bell, ChevronDown, LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const TopNavbar = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLightMode, setIsLightMode] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Default to the name stored in Supabase Auth when they signed up
        const authName = user.user_metadata?.name || user.email?.split('@')[0] || "User";
        setUserName(authName);
        
        // Try to fetch DB role & name
        supabase.from('users').select('name, role').eq('id', user.id).single().then(({ data, error }) => {
          if (!error && data) {
            if (data.name) setUserName(data.name);
            setUserRole(data.role === 'admin' ? "Admin" : "Customer");
          }
        });
      }
    });

    if (document.documentElement.classList.contains('light-theme') || document.body.classList.contains('light-theme')) {
      setIsLightMode(true);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleTheme = () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      setIsLightMode(false);
    } else {
      document.body.classList.add('light-theme');
      setIsLightMode(true);
    }
  };

  const initials = userName
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "U";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-6 glass">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything..."
          className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Advanced Interactive Theme Toggle! */}
        <button 
          onClick={toggleTheme} 
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Toggle Theme"
        >
          {isLightMode ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-orange-400" />}
        </button>

        {/* Notification */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-secondary/30">
                <h3 className="font-semibold text-foreground">Agentic Alerts</h3>
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium">3 New</span>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                <button 
                  onClick={() => { setShowNotifs(false); navigate('/admin'); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 transition-colors flex gap-3 group"
                >
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Action Required: Escalation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">A human-in-the-loop exception requires review in the Admin Workspace.</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Just now</p>
                  </div>
                </button>
                <button 
                  onClick={() => { setShowNotifs(false); navigate('/dashboard/reports'); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 transition-colors flex gap-3 group"
                >
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Compliance Log Generated</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sanctions check completed. Audit report ready for download.</p>
                    <p className="text-[10px] text-muted-foreground mt-2">5m ago</p>
                  </div>
                </button>
                <button 
                  onClick={() => { setShowNotifs(false); navigate('/dashboard/activity'); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 transition-colors flex gap-3 group"
                >
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-success shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Autonomous Clearance</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Retail account auto-cleared. Virtual cards generated.</p>
                    <p className="text-[10px] text-muted-foreground mt-2">12m ago</p>
                  </div>
                </button>
              </div>
              <button 
                onClick={() => setShowNotifs(false)}
                className="w-full p-3 text-xs text-center text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors border-t border-border/50"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-secondary">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
          </button>
          <button 
            onClick={handleLogout} 
            className="p-2 ml-1 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
