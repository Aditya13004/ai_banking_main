import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, BrainCircuit, Database, Scan, ShieldCheck, MailWarning, Play, Loader2 } from "lucide-react";

const nodeIcons: Record<string, any> = {
  "Document Storage": Database,
  "Gemini 2.0 Flash": BrainCircuit,
  "Document OCR Engine": Scan,
  "Verification App": ShieldCheck,
  "Escalation Router": MailWarning,
  "Core Orchestrator": Play,
};

const nodeColors: Record<string, string> = {
  "Document Storage": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Gemini 2.0 Flash": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "Document OCR Engine": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Verification App": "text-success bg-success/10 border-success/20",
  "Escalation Router": "text-destructive bg-destructive/10 border-destructive/20",
  "Core Orchestrator": "text-primary bg-primary/10 border-primary/20",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      // simplified query strictly to the table to avoid PostgREST relationship cache errors
      const { data, error } = await supabase
        .from("orchestration_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) console.error("Error fetching logs:", error);
      setLogs(data || []);
      setLoading(false);
    };

    fetchLogs();
    
    // Realtime subscription for instant updates across the network
    const channel = supabase.channel('activity-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orchestration_logs' }, fetchLogs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTime = (ts: string) => {
    if (!ts) return "--";
    return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-500" />
            Live Orchestration Stream
          </h1>
          <p className="text-muted-foreground mt-1">Real-time log of all Gemini AI agent decisions, tool interactions, and escalations.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 text-success rounded-full text-sm font-medium animate-pulse">
          <div className="w-2 h-2 rounded-full bg-success" /> Agent Engine Active
        </div>
      </div>

      <div className="glass-card gradient-border p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 font-mono space-y-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase border-b border-border/50 pb-3 mb-4">
            <span className="w-24 shrink-0">Time</span>
            <span className="w-44 shrink-0">Agent Node / Tool</span>
            <span className="flex-1">Action / Payload</span>
            <span className="w-16 text-right">Score</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No orchestration actions yet.</p>
              <p className="text-xs mt-2">Complete an onboarding flow as a customer to see live logs here.</p>
            </div>
          ) : (
            logs.map((log, i) => {
              const Icon = nodeIcons[log.agent_node] || BrainCircuit;
              const colorClass = nodeColors[log.agent_node] || "text-muted-foreground bg-secondary border-border";
              const isGemini = log.agent_node === "Gemini 2.0 Flash";
              return (
                <div key={log.id || i}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/30 group">
                  <span className="w-24 text-xs text-muted-foreground shrink-0">{formatTime(log.created_at)}</span>
                  <div className="w-44 flex items-center gap-2 shrink-0">
                    <div className={`p-1.5 rounded-md border ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-xs ${isGemini ? "font-bold text-indigo-400" : "text-foreground"}`}>
                      {log.agent_node}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${isGemini ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {log.action_taken}
                    </span>
                  </div>
                  <span className={`w-16 text-right text-xs font-bold ${
                    (log.confidence_score ?? 0) >= 80 ? "text-success" :
                    (log.confidence_score ?? 0) >= 60 ? "text-orange-400" : "text-destructive"
                  }`}>
                    {log.confidence_score != null ? `${log.confidence_score}%` : "--"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
