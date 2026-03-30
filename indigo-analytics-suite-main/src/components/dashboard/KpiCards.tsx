import { DollarSign, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const kpis = [
  {
    title: "Revenue",
    value: "$48,352",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Active Users",
    value: "2,420",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-0.4%",
    trend: "down" as const,
    icon: TrendingUp,
    description: "vs last month",
  },
  {
    title: "Growth",
    value: "+24.5%",
    change: "+4.1%",
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
