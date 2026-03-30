import { FileText, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const kpis = [
  {
    title: "Total Applications",
    value: "1,248",
    change: "+15.2%",
    trend: "up",
    icon: FileText,
    description: "vs last month",
  },
  {
    title: "Pending Review",
    value: "142",
    change: "-5.4%",
    trend: "down",
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Approval Rate",
    value: "92.4%",
    change: "+2.1%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "vs last month",
  },
  {
    title: "Avg Onboarding Time",
    value: "1.2 Days",
    change: "-12.5%",
    trend: "up" as const,
    icon: Activity,
    description: "vs last quarter",
  },
];

const KpiCards = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.title}
          className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:glow-primary"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <kpi.icon className="h-5 w-5 text-primary" />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                kpi.trend === "up"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {kpi.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {kpi.change}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {kpi.title} · {kpi.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
