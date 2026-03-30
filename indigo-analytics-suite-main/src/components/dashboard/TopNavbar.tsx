import { Search, Bell, ChevronDown } from "lucide-react";

const TopNavbar = () => {
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
        {/* Notification */}
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-secondary">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
            JD
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
