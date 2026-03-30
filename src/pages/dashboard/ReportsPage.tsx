import { FileText, Download, ShieldCheck, AlertTriangle, Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ReportsPage = () => {
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState({ cleared: 0, escalated: 0 });
  const [reasons, setReasons] = useState<{name: string, pct: number, count: number}[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const channelRef = useRef<any>(null);

  const fetchReportData = async () => {
    const { data: users } = await supabase.from('users').select('*');
    if (!users) return;

    // 1. Calculate Agentic Risk Triggers
    const cleared = users.filter((u: any) => u.status === 'approved').length;
    const escalated = users.filter((u: any) => u.status === 'escalate' || u.status?.includes('pending review')).length;
    setStats({ cleared, escalated });

    // 2. Calculate Top Escalation Factors
    const issueCounts: Record<string, number> = {};
    let totalIssues = 0;
    users.forEach((u: any) => {
      if (u.escalation_reason) {
        u.escalation_reason.split(',').forEach((r: string) => {
          const clean = r.trim();
          if (clean) {
            issueCounts[clean] = (issueCounts[clean] || 0) + 1;
            totalIssues++;
          }
        });
      }
    });

    const reasonsArr = Object.entries(issueCounts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / totalIssues) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
    
    // Provide fallbacks if DB is empty
    setReasons(reasonsArr.length > 0 ? reasonsArr : [
      { name: "System Awaiting Data", count: 0, pct: 0 },
    ]);

    // 3. Generate Recent Audit Artifacts from real DB state
    const highRiskUsers = users.filter(u => u.kyc_risk_level === 'High' || u.kyc_risk_level === 'Critical').slice(0, 2);
    const lowRiskUsers = users.filter(u => u.kyc_risk_level === 'Low').slice(0, 2);
    
    const dynamicAudits = [
      ...highRiskUsers.map(u => ({
        label: `AML Reject: ${u.name || 'Anonymous'}`,
        node: "Gemini Validation Engine",
        risk: u.kyc_risk_level,
        date: "Just now",
        id: u.id
      })),
      ...lowRiskUsers.map(u => ({
        label: `Auto-Clear: ${u.name || 'Anonymous'}`,
        node: "Core Orchestrator",
        risk: u.kyc_risk_level,
        date: "Recently",
        id: u.id
      })),
    ];

    // Fallback if not enough data yet
    if (dynamicAudits.length === 0) {
      dynamicAudits.push(
        { label: "AML Velocity Baseline", node: "System Startup", risk: "Low", date: "System Init", id: "1" },
        { label: "Rule Engine Config", node: "Admin Workspace", risk: "Safe", date: "System Init", id: "2" }
      );
    }
    
    setRecentAudits(dynamicAudits);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    fetchReportData();

    // ── Supabase Realtime subscription ────────────────────────────────────
    channelRef.current = supabase
      .channel('reports-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchReportData)
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const { data: users } = await supabase.from('users').select('*');
      const rows = (users || []).map((u: any) => [
        u.name || 'N/A', u.email || 'N/A', u.bank || 'N/A',
        u.status || 'N/A', u.kyc_risk_level || 'N/A',
        u.ai_confidence_score ?? 'N/A', `"${u.escalation_reason || 'None'}"`,
      ]);
      const header = ['Name','Email','Bank','Status','Risk Level','AI Confidence','Escalation Reason'];
      const csv = [header, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `onboard-ai-audit-${Date.now()}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success(`Downloaded audit with ${rows.length} applicant records.`);
    } catch (e: any) {
      toast.error('Download failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadRow = (label: string) => {
    const csv = `Report,Node,Generated\n"${label}",AI Engine,${new Date().toISOString()}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${label.replace(/ /g,'-')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${label} downloaded.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Compliance & Discrepancy Reports
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">Exportable regulatory audits logged by the autonomous AI engine.</p>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              LIVE · {lastUpdate.toLocaleTimeString("en-IN")}
            </span>
          </div>
        </div>
        <Button onClick={handleDownloadCSV} disabled={downloading} className="glow-primary flex items-center gap-2">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? 'Generating...' : 'Download Complete Audit (CSV)'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Escalation Factors — Now connected to real users table */}
        <div className="glass-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="text-warning w-5 h-5 text-orange-400" />
            Top Escalation Factors (Real-Time)
          </h3>
          <ul className="space-y-4">
            {reasons.map((r, i) => (
              <li key={i} className={`flex justify-between items-center text-sm ${i !== reasons.length - 1 ? "border-b border-border/50 pb-2" : ""}`}>
                <span className="text-foreground truncate pr-4">{r.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded-md text-muted-foreground">{r.count} hits</span>
                  <span className={`font-bold ${r.pct > 30 ? 'text-destructive' : 'text-muted-foreground'}`}>{r.pct}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Agentic Risk Triggers — Connected to real user counts */}
        <div className="glass-card p-6 rounded-2xl border border-border bg-indigo-500/5">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck className="text-indigo-500 w-5 h-5" />
            Agentic Risk Triggers
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            The orchestration agent dynamically assesses risk levels and coordinates tasks across compliance teams depending on extracted documents.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-xl">
              <p className="text-2xl font-bold text-foreground">{stats.cleared}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Auto-Cleared Nodes</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-xl">
              <p className="text-2xl font-bold text-indigo-500">{stats.escalated}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Escalated to Operations</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
        Recent Audit Artifacts
        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">● Realtime</span>
      </h3>
      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Report Artifact</th>
              <th className="px-6 py-4 font-medium">Generation Node</th>
              <th className="px-6 py-4 font-medium">Risk Label</th>
              <th className="px-6 py-4 font-medium">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {recentAudits.map((r, i) => (
              <tr key={r.id || i} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="bg-secondary p-2 rounded-lg text-muted-foreground"><Landmark size={16} /></div>
                  <div>
                    <span className="font-medium text-foreground">{r.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.date}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{r.node}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full border ${r.risk === 'Critical' || r.risk === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : r.risk === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-success/10 border-success/20 text-success'}`}>
                    {r.risk}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm" className="hover:text-primary" onClick={() => handleDownloadRow(r.label)}>
                    <Download size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
