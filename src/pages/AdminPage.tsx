import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Check, X, LogOut, BrainCircuit, AlertTriangle, ShieldAlert, Activity, Users, Sun, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const channelRef = useRef<any>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("role", "customer");
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch queue: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    if (document.body.classList.contains('light-theme')) setIsLightMode(true);

    // ── Supabase Realtime subscription on the users table ─────────────────
    channelRef.current = supabase
      .channel("admin-users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          setLastUpdate(new Date());
          // Update the local state immediately without full refetch
          if (payload.eventType === "INSERT") {
            setUsers(prev => [payload.new as any, ...prev].filter(u => u.role === "customer"));
            toast.info(`New applicant joined: ${(payload.new as any).email}`);
          } else if (payload.eventType === "UPDATE") {
            setUsers(prev => prev.map(u => u.id === (payload.new as any).id ? payload.new as any : u));
            toast.success(`Status updated → ${(payload.new as any).status}`);
          } else if (payload.eventType === "DELETE") {
            setUsers(prev => prev.filter(u => u.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const handleOverride = async (userId: string, status: string) => {
    try {
      const { error } = await supabase.from("users").update({ status }).eq("id", userId);
      if (error) throw error;
      // No need to manually fetchUsers — realtime subscription handles the UI update
    } catch (error: any) {
      toast.error("Error executing orchestration override: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getAIAnalysis = (user: any) => {
    // Use REAL AI data if available, fallback to ID-based mock
    if (user.ai_confidence_score != null) {
      return {
        score: user.ai_confidence_score,
        risk: user.kyc_risk_level || "Medium",
        flag: user.escalation_reason || "Gemini AI Analysed",
      };
    }
    const code = parseInt(user.id.slice(0, 4), 16) % 3;
    if (user.status === 'approved') return { score: 98, risk: "Low", flag: "Autonomous Clear" };
    if (user.status === 'rejected') return { score: 32, risk: "Critical", flag: "Permanent Discrepancy" };
    if (code === 0) return { score: 76, risk: "Medium", flag: "Aadhaar clarity low" };
    if (code === 1) return { score: 82, risk: "Medium", flag: "Name fuzzy-match issue" };
    return { score: 65, risk: "High", flag: "Missing compliance tag" };
  };

  const pendingCount = users.filter(u => u.status?.includes('pending') || u.status === 'escalate').length;
  const approvedCount = users.filter(u => u.status === 'approved').length;
  const rejectedCount = users.filter(u => u.status === 'rejected').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="w-8 h-8 text-indigo-500" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-indigo-500">
                Exception Resolution Queue
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">Human-in-the-Loop Orchestration Workspace</p>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                LIVE · Updated {lastUpdate.toLocaleTimeString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics — Live from Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "System Volume", value: `${users.length} Leads`, color: "border-l-blue-500", icon: <Activity className="w-5 h-5 text-blue-500" /> },
            { label: "Autonomous Clears", value: approvedCount, color: "border-l-indigo-500", icon: <BrainCircuit className="w-5 h-5 text-indigo-500" /> },
            { label: "Escalated to Human", value: pendingCount, color: "border-l-orange-500", icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, valueClass: "text-orange-500" },
            { label: "Rejected Pipeline", value: rejectedCount, color: "border-l-red-500", icon: <ShieldAlert className="w-5 h-5 text-red-500" />, valueClass: "text-red-500" },
          ].map((m, i) => (
            <div key={i} className={`glass-card p-6 rounded-2xl border-l-4 ${m.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <h3 className={`text-2xl font-bold mt-1 ${m.valueClass || ''}`}>{m.value}</h3>
                </div>
                {m.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Exception Queue */}
        <div className="glass-card gradient-border p-6 rounded-2xl shadow-xl">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={20} className="text-primary" /> Active Exception Queue
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">● Realtime</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Review operations escalated by Gemini AI requiring manual clearance.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    <th className="py-4 px-4 font-semibold text-sm">Applicant</th>
                    <th className="py-4 px-4 font-semibold text-sm">Target Bank</th>
                    <th className="py-4 px-4 font-semibold text-sm">Gemini AI Analysis</th>
                    <th className="py-4 px-4 font-semibold text-sm">Risk Score</th>
                    <th className="py-4 px-4 font-semibold text-sm">Current State</th>
                    <th className="py-4 px-4 font-semibold text-sm text-right">Human Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Queue is clear. AI handling all volumes autonomously.</td></tr>
                  ) : (
                    users.map(user => {
                      const analysis = getAIAnalysis(user);
                      const isPending = user.status?.includes('pending') || user.status === 'escalate';
                      return (
                        <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-foreground">{user.name || "–"}</div>
                            <div className="text-xs text-muted-foreground">{user.phone || user.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium px-2 py-1 bg-secondary rounded-md">{user.bank || "General Pool"}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {analysis.score >= 90 ? <Check size={14} className="text-success" /> : <AlertTriangle size={14} className="text-orange-500" />}
                              <span className="text-sm">{analysis.flag}</span>
                            </div>
                            <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
                              <div className={`h-full transition-all ${analysis.score >= 90 ? 'bg-success' : analysis.score > 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ width: `${analysis.score}%` }} />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                              analysis.risk === 'Low' ? 'bg-success/20 text-success' :
                              analysis.risk === 'Medium' ? 'bg-orange-500/20 text-orange-500' :
                              'bg-red-500/20 text-red-500'}`}>{analysis.risk}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              user.status === 'approved' ? 'bg-success/20 text-success border border-success/30' :
                              user.status === 'rejected' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                              'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse'}`}>
                              {user.status === "approved" ? "Auto-Cleared" : user.status === "rejected" ? "Disqualified" : "Human Override Required"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            {isPending ? (
                              <>
                                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/80 h-8 gap-1"
                                  onClick={() => handleOverride(user.id, "approved")}>
                                  <Check size={14} /> Force Clear
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 gap-1"
                                  onClick={() => handleOverride(user.id, "rejected")}>
                                  <X size={14} /> Re-KYC
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground mr-2 flex items-center gap-1 justify-end">
                                <Zap size={12} className="text-success" /> Workflow Concluded
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
