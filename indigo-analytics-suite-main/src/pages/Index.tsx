import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import KpiCards from "@/components/dashboard/KpiCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import ActivityTable from "@/components/dashboard/ActivityTable";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-60"
        )}
      >
        <TopNavbar />

        <main className="space-y-6 p-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, John. Here's your overview for today.
            </p>
          </div>

          <KpiCards />
          <ChartsSection />
          <ActivityTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
