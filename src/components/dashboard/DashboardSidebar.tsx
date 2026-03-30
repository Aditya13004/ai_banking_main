import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  Settings,
  Activity,
  Bot,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";



interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const [role, setRole] = useState<string>("customer");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('users').select('role').eq('id', user.id).single().then(({data}) => setRole(data?.role || 'customer'));
    });
  }, []);

  const menuItems = role === "admin" ? [
    { icon: LayoutDashboard, label: "Exception Queue", path: "/dashboard" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: FileText, label: "Reports", path: "/dashboard/reports" },
    { icon: Users, label: "CRM Directory", path: "/dashboard/users" },
    { icon: Activity, label: "Live Activity", path: "/dashboard/activity" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ] : [
    { icon: LayoutDashboard, label: "My Account", path: "/dashboard" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

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
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground tracking-tight">
            Onboard AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
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
