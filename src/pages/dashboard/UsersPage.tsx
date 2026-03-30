import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Users as UsersIcon, Search, ShieldCheck, ShieldAlert, BrainCircuit, Activity, ChevronRight, ChevronDown, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const channelRef = useRef<any>(null);

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").eq("role", "customer");
    setUsers(data || []);
    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    fetchUsers();

    // ── Supabase Realtime subscription ────────────────────────────────────
    channelRef.current = supabase
      .channel("users-crm-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          setLastUpdate(new Date());
          if (payload.eventType === "UPDATE") {
            setUsers(prev => prev.map(u => u.id === (payload.new as any).id ? payload.new as any : u));
          } else {
            fetchUsers(); // INSERT / DELETE — just refetch for simplicity
          }
        }
      )
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return "bg-secondary text-muted-foreground";
    if (status.includes("pending review")) return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    if (status === "approved") return "bg-success/10 text-success border-success/20";
    if (status === "rejected") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-secondary text-foreground";
  };

  const calculateDropoffRisk = (status: string) => {
    if (status === 'pending') return { level: 'High Risk', reason: 'Abandoned at basic info step.' };
    if (status === 'pending review') return { level: 'Low Risk', reason: 'Actively in Agent AI Pipeline.' };
    return { level: 'Settled', reason: 'Onboarding completed.' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-indigo-500" />
            Agentic CRM Directory
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">Autonomous onboarding lifecycle tracking and AI drop-off prediction.</p>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              LIVE · {lastUpdate.toLocaleTimeString("en-IN")}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full bg-secondary/50 border border-border rounded-lg text-sm py-2 px-4 focus:ring-2 focus:ring-primary/50 outline-none" 
              placeholder="Search by name or PAN..." 
            />
          </div>
          <button className="px-4 py-2 bg-primary rounded-lg text-primary-foreground font-medium hover:bg-primary/90 glow-primary transition-all">
            Export CRM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card gradient-border p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">Agentic Learning Node</h3>
          </div>
          <p className="text-3xl font-bold mt-2">12.4%</p>
          <p className="text-sm text-muted-foreground mt-1">Reduction in drop-offs this week based on AI proactive engagement patterns.</p>
        </div>
        <div className="glass-card gradient-border p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-lg">Avg Turnaround Time</h3>
          </div>
          <p className="text-3xl font-bold mt-2">1.2 Min</p>
          <p className="text-sm text-muted-foreground mt-1">For autonomous approvals. (Down from 48 hours manually).</p>
        </div>
        <div className="glass-card gradient-border p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-lg">Straight-Through Processing</h3>
          </div>
          <p className="text-3xl font-bold mt-2">86%</p>
          <p className="text-sm text-muted-foreground mt-1">Applications cleared without entering Human-in-the-loop exception queue.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant Name</th>
                <th className="px-6 py-4 font-medium">Contact / Identifiers</th>
                <th className="px-6 py-4 font-medium">Agentic State</th>
                <th className="px-6 py-4 font-medium">AI Dropoff Prediction</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Scanning global registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No onboarding applications found in the pipeline.
                  </td>
                </tr>
              ) : (
                users
                  .filter(u => !search || (u.name?.toLowerCase().includes(search.toLowerCase()) || u.pan?.includes(search)))
                  .map((user) => {
                  const dropoff = calculateDropoffRisk(user.status);
                  const isExpanded = expandedId === user.id;
                  return (
                    <>
                    <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{user.name || "Anonymous App"}</div>
                        <div className="text-xs text-muted-foreground truncate w-32">{user.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          PAN: {user.pan || 'Missed'} | Phone: {user.phone || 'Missed'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${dropoff.level === 'High Risk' ? 'text-orange-400' : 'text-muted-foreground'}`}>
                          {dropoff.level === 'High Risk' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-success" />}
                          <span className="font-medium">{dropoff.level}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{dropoff.reason}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : user.id)}
                          className="flex items-center gap-1 hover:text-primary text-muted-foreground transition-colors font-medium">
                          {isExpanded ? 'Hide' : 'View Node'}
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${user.id}-detail`} className="bg-secondary/20 border-b border-border/50">
                        <td colSpan={5} className="px-6 py-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Bank</p>
                              <p className="font-medium">{user.bank || 'Not Selected'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">AI Confidence</p>
                              <p className="font-bold text-primary">{user.ai_confidence_score != null ? `${user.ai_confidence_score}%` : 'Not Analysed'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Risk Level</p>
                              <p className={`font-bold ${user.kyc_risk_level === 'Low' ? 'text-success' : user.kyc_risk_level === 'High' ? 'text-destructive' : 'text-orange-400'}`}>
                                {user.kyc_risk_level || 'Pending'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Escalation Reason</p>
                              <p className="text-muted-foreground text-xs">{user.escalation_reason || 'None'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
