import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, BrainCircuit, CheckCircle2, Building2, CreditCard, ShieldAlert, Activity, RefreshCw, FileWarning, AlertTriangle, X, Smartphone, Globe, ArrowDownLeft, ArrowUpRight, IndianRupee, Check, Briefcase, RotateCcw, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BANKS } from "@/components/onboarding/OnboardingWizard";

const DashboardHome = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showStatements, setShowStatements] = useState(false);
  const [fundMethod, setFundMethod] = useState<"upi" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [fundSuccess, setFundSuccess] = useState(false);
  const channelRef = useRef<any>(null);

  const fetchStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) { setUserData(data); setStatus(data.status); }
      else setStatus('pending');
    }
  };

  useEffect(() => {
    fetchStatus();
    // Supabase Realtime — update customer status instantly when admin acts
    let userId: string;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      userId = user.id;
      channelRef.current = supabase
        .channel("dashboard-home-realtime")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` },
          (payload) => { setUserData(payload.new); setStatus((payload.new as any).status); }
        )
        .subscribe();
    });
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  if (!status) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  // ── STEP 1: No onboarding started ───────────────────────────────────────
  if (status === 'pending') {
    return <div className="space-y-6"><OnboardingWizard /></div>;
  }

  // ── STEP 2: Form saved, not yet AI-analysed ─────────────────────────────
  if (status === 'form_complete') {
    return <div className="space-y-6"><OnboardingWizard /></div>;
  }

  // ── STEP 3: AI Retry required — bad data ────────────────────────────────
  if (status === 'retry') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
          <RefreshCw className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-orange-400">AI Requires Resubmission</h2>
        <p className="text-muted-foreground max-w-md">
          {userData?.escalation_reason || "The AI Agent detected data inconsistencies. Please correct your information and resubmit."}
        </p>
        <div className="glass-card p-4 rounded-xl border border-orange-500/20 max-w-sm w-full text-left space-y-2">
          <p className="text-sm font-semibold text-orange-400">AI Flags:</p>
          {userData?.escalation_reason?.split(",").map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle size={12} className="text-orange-400" /> {f.trim()}
            </div>
          ))}
        </div>
        <Button onClick={async () => {
          await supabase.from('users').update({ status: 'pending' }).eq('id', userData.id);
          setStatus('pending');
        }} variant="outline" className="gap-2">
          <RefreshCw size={16} /> Start Over
        </Button>
      </div>
    );
  }

  // ── STEP 4: Upload required ──────────────────────────────────────────────
  if (status === 'upload_required') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
          <FileWarning className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-yellow-400">Document Upload Required</h2>
        <p className="text-muted-foreground max-w-md">Your KYC identity document is missing. Please upload your Aadhaar or PAN card to proceed.</p>
        <Button onClick={() => { supabase.from('users').update({ status: 'pending' }).eq('id', userData.id); setStatus('pending'); }} className="glow-primary gap-2">
          Upload Document Now
        </Button>
      </div>
    );
  }

  // ── STEP 5: AI Processing / Pending Review ──────────────────────────────
  if (status?.includes('pending')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="w-32 h-32 glass rounded-full flex items-center justify-center border-2 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
            <BrainCircuit className="w-16 h-16 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-primary">
            Agentic AI Verifying Profile
          </h2>
          <p className="text-muted-foreground text-lg">
            Orchestration engine is running KYC, AML, sanctions checks, and compliance verification across multiple systems.
          </p>
          <div className="glass-card p-4 rounded-xl text-left space-y-3 border-indigo-500/20 mt-6">
            <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-success" /><span className="text-sm font-medium">Document Authenticity Check — Complete</span></div>
            <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-success" /><span className="text-sm font-medium">Sanctions & Watchlist Ping — Clear</span></div>
            <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /><span className="text-sm font-medium text-indigo-400">AML Risk Assessment — In Progress</span></div>
          </div>
          <p className="text-xs text-muted-foreground">AI Confidence: <b>{userData?.ai_confidence_score ?? "--"}%</b> · Risk: <b>{userData?.kyc_risk_level ?? "Evaluating..."}</b></p>
        </div>
      </div>
    );
  }

  // ── STEP 6: Escalated / Rejected ────────────────────────────────────────
  if (status === 'rejected' || status === 'escalate') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in duration-500">
        <ShieldAlert className="w-24 h-24 text-destructive" />
        <h2 className="text-3xl font-bold text-destructive">Application Escalated to Operations</h2>
        <p className="text-muted-foreground max-w-md">
          Our AI orchestrator flagged a discrepancy: <b className="text-foreground">{userData?.escalation_reason || "high-risk profile"}</b>.
          <br /><br />An operations agent will contact you shortly for Re-KYC verification.
        </p>
        <div className="glass-card p-4 rounded-xl border border-destructive/20 max-w-sm w-full text-left">
          <p className="text-xs text-muted-foreground">AI Confidence Score: <b>{userData?.ai_confidence_score ?? "--"}%</b></p>
          <p className="text-xs text-muted-foreground mt-1">Risk Level: <b className="text-destructive">{userData?.kyc_risk_level ?? "High"}</b></p>
        </div>
      </div>
    );
  }

  // Mock statements with realistic initial data
  const statements = [
    { id: 1, desc: "Account Opening Bonus",     type: "credit", amount: 2500.00,    date: "Today, 12:00 AM", status: "Credited" },
    { id: 2, desc: "KYC Verification Fee",       type: "debit",  amount: 250.00,    date: "Today, 12:01 AM", status: "Debited" },
    { id: 3, desc: `Welcome Cashback — ${userData?.bank?.split(" ")[0] || "Bank"}`, type: "credit", amount: 500.00, date: "Today", status: "Pending" },
  ];

  const totalCredits = statements.filter(t => t.type === "credit").reduce((a, b) => a + b.amount, 0);
  const totalDebits = statements.filter(t => t.type === "debit").reduce((a, b) => a + b.amount, 0);
  const currentBalance = 15450.00 + totalCredits - totalDebits; // Giving a rich starting balance

  const handleFundSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (fundMethod === "upi" && !upiId.includes("@")) { toast.error("Enter a valid UPI ID (e.g. name@upi)"); return; }
    setFundLoading(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate payment gateway
    setFundLoading(false);
    setFundSuccess(true);
    toast.success(`₹${amount} funding request submitted successfully!`);
    await supabase.from("orchestration_logs").insert({
      user_id: userData?.id,
      action_taken: `Fund request ₹${amount} via ${fundMethod === "upi" ? `UPI (${upiId})` : "Net Banking"}`,
      agent_node: "Payment Gateway",
      confidence_score: 100,
    });
  };

  const getAccountDetails = () => {
    const type = userData?.account_type;
    if (type === "digital_only") return { label: "Digital-only", color: "from-purple-600 to-indigo-500", icon: <Smartphone className="w-5 h-5 text-purple-400" />, shadow: "shadow-purple-500/20" };
    if (type === "sme_current") return { label: "SME Current", color: "from-orange-600 to-amber-500", icon: <Briefcase className="w-5 h-5 text-orange-400" />, shadow: "shadow-orange-500/20" };
    if (type === "rekyc") return { label: "Re-KYC Active", color: "from-emerald-600 to-teal-500", icon: <RotateCcw className="w-5 h-5 text-emerald-400" />, shadow: "shadow-emerald-500/20" };
    return { label: "Retail Savings", color: "from-blue-600 to-primary", icon: <Landmark className="w-5 h-5 text-blue-400" />, shadow: "shadow-primary/20" };
  };

  const account = getAccountDetails();

  // ── STEP 7: Fully Approved — Active Account ──────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            {account.icon}
            {account.label} Account
          </h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {userData?.name}! Your {account.label} portal is active.</p>
          <div className="flex items-center gap-4 mt-2">
             <span className="text-xs text-muted-foreground">AI Confidence: <b className="text-foreground">{userData?.ai_confidence_score ?? 100}%</b></span>
             <span className="text-xs text-muted-foreground">Risk Rating: <b className="text-success">{userData?.kyc_risk_level ?? "Low"}</b></span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 text-success rounded-full text-xs font-medium">
           <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> SYSTEM: LIVE & VERIFIED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Virtual Card dynamically themed */}
        <div className={`glass-card p-0 rounded-3xl relative overflow-hidden group shadow-2xl ${account.shadow}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${account.color} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
          
          <div className="absolute -top-12 -right-12 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110">
            {userData?.account_type === "sme_current" ? <Briefcase className="w-48 h-48" /> : userData?.account_type === "digital_only" ? <Smartphone className="w-48 h-48" /> : <Building2 className="w-48 h-48" />}
          </div>
          
          <div className="relative z-10 p-8 space-y-8 text-white">
            <div className="flex justify-between items-center">
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md border border-white/20">
                {account.label} · {userData?.bank?.split(" ")[0]?.toUpperCase() || "ZENITH BANK"}
              </div>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
            
            <div className="space-y-1 font-mono">
              <h3 className="text-3xl tracking-[0.2em] font-medium drop-shadow-md">
                {userData?.account_type === "sme_current" ? "8821 77** **** 9912" : "5521 89** **** 4492"}
              </h3>
              <div className="flex gap-6 mt-4 opacity-80 text-[10px] tracking-widest uppercase font-bold">
                <span>EXP 12/30</span><span>CVV ***</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] font-bold opacity-70 tracking-tighter uppercase mb-0.5">ACCHOLDER</p>
                <p className="font-semibold tracking-widest uppercase truncate max-w-[150px]">{userData?.name || "Premium Member"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold opacity-70 tracking-tighter uppercase mb-0.5">AVAIL BAL</p>
                <p className="text-2xl font-black text-white drop-shadow-lg">₹ {currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setShowFundModal(true); setFundSuccess(false); setAmount(""); setUpiId(""); }}
              className="glass p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-colors border-primary/20 text-primary group">
              <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform"><CreditCard className="w-6 h-6" /></div>
              <span className="font-medium">Fund Account</span>
            </button>
            <button
              onClick={() => setShowStatements(true)}
              className="glass p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-indigo-500/10 transition-colors border-indigo-500/20 text-indigo-400 group">
              <div className="p-3 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform"><Activity className="w-6 h-6" /></div>
              <span className="font-medium">View Statements</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── FUND ACCOUNT MODAL ─────────────────────────────────────────────── */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setShowFundModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {fundSuccess ? (
              <div className="flex flex-col items-center text-center py-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">Request Submitted!</h3>
                <p className="text-muted-foreground">Your fund request of <b className="text-foreground">₹{amount}</b> has been sent to the payment gateway. Funds will reflect within 2-4 hours.</p>
                <Button onClick={() => setShowFundModal(false)} className="glow-primary w-full">Done</Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-1">Fund Your Account</h3>
                <p className="text-sm text-muted-foreground mb-6">Add money via UPI or Net Banking instantly.</p>

                {/* Payment method toggle */}
                <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
                  <button onClick={() => setFundMethod("upi")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${ fundMethod === "upi" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground" }`}>
                    <Smartphone className="w-4 h-4" /> UPI
                  </button>
                  <button onClick={() => setFundMethod("netbanking")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${ fundMethod === "netbanking" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground" }`}>
                    <Globe className="w-4 h-4" /> Net Banking
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Amount */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Amount (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full pl-9 bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {["500", "1000", "5000", "10000"].map(v => (
                        <button key={v} onClick={() => setAmount(v)}
                          className="flex-1 text-xs py-1.5 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-colors font-medium">₹{v}</button>
                      ))}
                    </div>
                  </div>

                  {/* UPI or Net Banking field */}
                  {fundMethod === "upi" ? (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">UPI ID</label>
                      <input type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Select Bank</label>
                      <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1 mt-2">
                        {BANKS.filter(b => ["sbi", "hdfc", "icici", "axis", "kotak", "idfc", "yes", "pnb", "bob"].includes(b.id)).map((bank) => (
                          <div key={bank.id}
                            className="flex items-center gap-2 p-2 rounded-xl border border-border bg-secondary/30 hover:bg-primary/10 cursor-pointer transition-colors"
                            onClick={() => { /* Mock bank selection */ }}>
                            <div className="w-6 h-6 rounded-full bg-white overflow-hidden p-0.5 shrink-0">
                              <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs truncate">{bank.name.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleFundSubmit} disabled={fundLoading} className="w-full glow-primary" size="lg">
                    {fundLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</> : `Send ₹${amount || "0"} via ${fundMethod === "upi" ? "UPI" : "Net Banking"}`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW STATEMENTS MODAL ──────────────────────────────────────────── */}
      {showStatements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-border rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setShowStatements(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h3 className="text-xl font-bold mb-1">Account Statements</h3>
            <p className="text-sm text-muted-foreground mb-6">{userData?.bank} — {userData?.name}</p>

            {/* Balance summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-success mb-1"><ArrowDownLeft className="w-4 h-4" /><span className="text-xs font-semibold">Total Credits</span></div>
                <p className="text-2xl font-bold text-success">₹ {totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-destructive mb-1"><ArrowUpRight className="w-4 h-4" /><span className="text-xs font-semibold">Total Debits</span></div>
                <p className="text-2xl font-bold text-destructive">₹ {totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Transaction list */}
            <div className="space-y-3">
              {statements.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${ txn.type === "credit" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive" }`}>
                      {txn.type === "credit" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{txn.desc}</p>
                      <p className="text-xs text-muted-foreground">{txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${ txn.type === "credit" ? "text-success" : "text-destructive" }`}>
                      {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{txn.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-6">Transactions are updated in real-time via Supabase.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
