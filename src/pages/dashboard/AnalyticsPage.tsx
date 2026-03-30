import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart3, TrendingUp, TrendingDown, Clock, Wallet, Zap, BrainCircuit, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0, rejected: 0, escalated: 0,
    avgConfidence: 0, totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const channelRef = useRef<any>(null);

  const fetchStats = async () => {
    const { data: users } = await supabase.from("users").select("status, ai_confidence_score, kyc_risk_level").eq("role", "customer");
    const { count: logCount } = await supabase.from("orchestration_logs").select("*", { count: "exact", head: true });

    if (users) {
      const approved = users.filter(u => u.status === "approved").length;
      const pending = users.filter(u => u.status?.includes("pending")).length;
      const rejected = users.filter(u => u.status === "rejected").length;
      const escalated = users.filter(u => u.status === "escalate").length;
      const scores = users.filter(u => u.ai_confidence_score != null).map(u => u.ai_confidence_score);
      const avgConf = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      setStats({ total: users.length, approved, pending, rejected, escalated, avgConfidence: avgConf, totalLogs: logCount || 0 });
    }
    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    fetchStats();

    // ── Realtime: re-run stats whenever users or logs change ─────────────
    channelRef.current = supabase
      .channel("analytics-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "orchestration_logs" }, fetchStats)
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const conversionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const escalationRate = stats.total > 0 ? Math.round(((stats.escalated + stats.pending) / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" /> Agentic KPI Analytics
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">Live metrics from Supabase — measuring AI onboarding impact.</p>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              LIVE · {lastUpdate.toLocaleTimeString("en-IN")}
            </span>
          </div>
        </div>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
      </div>

      {/* Live KPI Cards from real DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Clock size={24} />, bg: "bg-indigo-500/10", iconColor: "text-indigo-500",
            label: "Total Applicants", value: stats.total.toString(),
            sub: <><TrendingUp className="w-4 h-4 text-success" /><span className="text-success font-medium">Live count</span><span className="text-muted-foreground text-xs">from Supabase</span></>
          },
          {
            icon: <Wallet size={24} />, bg: "bg-green-500/10", iconColor: "text-green-500",
            label: "AI Approved", value: stats.approved.toString(),
            sub: <><TrendingUp className="w-4 h-4 text-success" /><span className="text-success font-medium">{conversionRate}% rate</span><span className="text-muted-foreground text-xs">conversion</span></>
          },
          {
            icon: <Zap size={24} />, bg: "bg-orange-500/10", iconColor: "text-orange-500",
            label: "Pending / Escalated", value: (stats.pending + stats.escalated).toString(),
            sub: <><TrendingDown className="w-4 h-4 text-orange-400" /><span className="text-orange-400 font-medium">{escalationRate}% rate</span><span className="text-muted-foreground text-xs">need human review</span></>
          },
          {
            icon: <BrainCircuit size={24} />, bg: "bg-purple-500/10", iconColor: "text-purple-500",
            label: "Avg AI Confidence", value: stats.avgConfidence ? `${stats.avgConfidence}%` : "–",
            sub: <><TrendingUp className="w-4 h-4 text-success" /><span className="text-success font-medium">{stats.totalLogs} agent actions</span><span className="text-muted-foreground text-xs">logged</span></>
          },
        ].map((card, i) => (
          <div key={i} className="glass-card gradient-border p-6 rounded-2xl border border-border/50 hover:bg-secondary/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${card.bg} rounded-xl ${card.iconColor}`}>{card.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                <h4 className="text-2xl font-bold mt-1 text-foreground">{card.value}</h4>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown — live */}
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            Live Pipeline Breakdown
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 ml-auto">● Realtime</span>
          </h3>
          <div className="space-y-5">
            {[
              { label: "Approved (AI Auto-Cleared)", count: stats.approved, total: stats.total, color: "bg-success" },
              { label: "Pending Review (Human Queue)", count: stats.pending, total: stats.total, color: "bg-indigo-500" },
              { label: "Escalated to Operations", count: stats.escalated, total: stats.total, color: "bg-orange-500" },
              { label: "Rejected / Disqualified", count: stats.rejected, total: stats.total, color: "bg-destructive" },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-bold text-foreground">{item.count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border/50">
            Values update automatically via Supabase Realtime whenever any status changes.
          </p>
        </div>

        {/* Historical + Product Mix */}
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold text-lg mb-6">Pipeline by Account Type</h3>
          <div className="space-y-5">
            {[
              { label: "Retail Savings Account", pct: 68, color: "bg-primary" },
              { label: "Digital-Only Account", pct: 22, color: "bg-orange-500" },
              { label: "SME Current Account", pct: 7, color: "bg-indigo-500" },
              { label: "Re-KYC Reactivation", pct: 3, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.pct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border/50">
            Gemini AI autonomously maps specific compliance workflows per detected account type.
          </p>
        </div>
      </div>
    </div>
  );
}
