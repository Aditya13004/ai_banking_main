import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  Settings,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: FileText, label: "Reports", active: false },
  { icon: Users, label: "Users", active: false },
  { icon: Activity, label: "Activity", active: false },
  { icon: Settings, label: "Settings", active: false },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground tracking-tight">
            Nexus
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              item.active
                ? "bg-primary/10 text-primary glow-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", item.active && "text-primary")} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {collapsed ? "→" : "← Collapse"}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
