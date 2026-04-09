import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, UploadCloud, FileText, Loader2, ShieldCheck, Building2, Landmark, CreditCard, BrainCircuit, AlertTriangle, RefreshCw, Smartphone, Briefcase, RotateCcw, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { runAgentDecision, type AIAnalysisResult } from "@/lib/agentAI";

const STEPS = ["Account Type", "Select Bank", "Your Details", "Upload KYC", "AI Verdict"];

const ACCOUNT_TYPES = [
  { id: "retail_savings", label: "Retail Savings Account", desc: "Standard savings account for individuals", icon: Landmark, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "digital_only",   label: "Digital-Only Account",   desc: "100% paperless, instant activation",    icon: Smartphone, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "sme_current",    label: "SME Current Account",    desc: "For businesses and sole proprietors",    icon: Briefcase, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "rekyc",          label: "Re-KYC / Reactivation",  desc: "Update KYC or reactivate dormant account", icon: RotateCcw, color: "text-green-500", bg: "bg-green-500/10" },
];

export const BANKS = [
  { id: "sbi",      name: "State Bank of India",   domain: "sbi.co.in", logo: "/logos/sbi.svg" },
  { id: "pnb",      name: "Punjab National Bank",  domain: "pnbindia.in", logo: "/logos/pnb.svg" },
  { id: "bob",      name: "Bank of Baroda",        domain: "bankofbaroda.in", logo: "/logos/bob.svg" },
  { id: "canara",   name: "Canara Bank",          domain: "canarabank.com", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Canara_Bank_logo.svg" },
  { id: "union",    name: "Union Bank of India",   domain: "unionbankofindia.co.in", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Union_Bank_of_India_Logo.svg" },
  { id: "boi",      name: "Bank of India",         domain: "bankofindia.co.in", logo: "https://upload.wikimedia.org/wikipedia/commons/4/40/Bank_of_India_Logo.svg" },
  { id: "indian",   name: "Indian Bank",          domain: "indianbank.in", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Indian_Bank_Logo.svg" },
  { id: "central",  name: "Central Bank of India", domain: "centralbankofindia.co.in", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Central_Bank_of_India_logo.svg" },
  { id: "hdfc",     name: "HDFC Bank",             domain: "hdfcbank.com", logo: "/logos/hdfc.svg" },
  { id: "icici",    name: "ICICI Bank",            domain: "icicibank.com", logo: "/logos/icici.svg" },
  { id: "axis",     name: "Axis Bank",             domain: "axisbank.com", logo: "/logos/axis.svg" },
  { id: "kotak",    name: "Kotak Mahindra Bank",   domain: "kotak.com", logo: "/logos/kotak.svg" },
  { id: "idfc",     name: "IDFC FIRST Bank",       domain: "idfcfirstbank.com", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/IDFC_First_Bank_logo.svg" },
  { id: "yes",      name: "Yes Bank",              domain: "yesbank.in", logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/YES_Bank_SVG_Logo.svg" },
  { id: "indusind", name: "IndusInd Bank",         domain: "indusind.com", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/IndusInd_Bank_SVG_Logo.svg" },
];

// ── Proactive AI Chat Bubble ────────────────────────────────────────────────
function AITip({ msg }: { msg: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl"
    >
      <MessageCircle className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm text-indigo-300">{msg}</div>
      <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ accountType: "", bank: "", name: "", email: "", phone: "", pan: "", aadhaar: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiTip, setAiTip] = useState<string>("");
  const [bankSearch, setBankSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proactive AI tip: watch field changes and give smart hints
  useEffect(() => {
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      setAiTip("PAN format should be: 5 letters → 4 digits → 1 letter (e.g. ABCDE1234F)");
    } else if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar)) {
      setAiTip("Aadhaar must be exactly 12 digits with no spaces.");
    } else if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setAiTip("Phone number must be exactly 10 digits.");
    } else {
      setAiTip("");
    }
  }, [formData.pan, formData.aadhaar, formData.phone]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
    if (!/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = "Aadhaar must be 12 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      const { error } = await supabase.from('users').update({
        phone: formData.phone, pan: formData.pan, aadhaar: formData.aadhaar,
        name: formData.name, bank: formData.bank,
        account_type: formData.accountType,
        status: 'form_complete',
      }).eq('id', user.id);
      if (error) throw error;
      setCurrentStep(3);
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) setUploadedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setUploadedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Upload file to storage
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('kyc-docs').upload(`${user.id}/${fileName}`, uploadedFile, { upsert: true });
      if (uploadError) throw uploadError;

      // Log document
      await supabase.from('documents').insert({ user_id: user.id, file_name: fileName, doc_type: 'identity', status: 'pending review' });

      setUploadSuccess(true);
      toast.success("Document uploaded! Gemini AI is analyzing...");

      // Run AI decision engine
      const result = await runAgentDecision({
        name: formData.name, email: formData.email, phone: formData.phone,
        pan: formData.pan, aadhaar: formData.aadhaar, bank: formData.bank, hasDocument: true,
      });
      setAiResult(result);

      // Write AI decision to Supabase - CHECKING IF ROW EXISTS FIRST
      const { data: updatedRows, error: updateError } = await supabase.from('users').update({
        status: result.decision,
        ai_confidence_score: result.confidence,
        kyc_risk_level: result.riskLevel,
        escalation_reason: result.flags.join(", "),
      }).eq('id', user.id).select();

      // THE PHANTOM BUG FIX: If rows is 0, they are a phantom user missing from public.users!
      if (!updatedRows || updatedRows.length === 0) {
        console.warn("Phantom user detected! Forcing manual database injection.");
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          name: formData.name,
          email: formData.email,
          bank: formData.bank,
          account_type: formData.accountType,
          role: "customer",
          status: result.decision,
          ai_confidence_score: result.confidence,
          kyc_risk_level: result.riskLevel,
          escalation_reason: result.flags.join(", "),
        });
        if (insertError) throw new Error("Complete DB failure on Phantom User Insert: " + insertError.message);
      } else if (updateError) {
        console.error("Failed to commit AI decision to DB:", updateError);
        throw new Error("Failed to save AI decision to database: " + updateError.message);
      }

      // Log the orchestration action
      await supabase.from('orchestration_logs').insert([
        { user_id: user.id, action_taken: `Document uploaded (${uploadedFile.name})`, agent_node: "Document Storage", confidence_score: 100 },
        { user_id: user.id, action_taken: `Gemini AI Decision: ${result.decision} — ${result.explanation}`, agent_node: "Gemini 2.0 Flash", confidence_score: result.confidence },
      ]);

      toast.success(`AI Verdict: ${result.decision.replace(/_/g, " ").toUpperCase()}`);
      setTimeout(() => setCurrentStep(4), 800);
    } catch (err: any) {
      toast.error(err.message || "Failed to process document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="onboarding" className="py-24 px-4 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">Intelligent Account Opening</h2>
          <p className="text-muted-foreground mt-2">Powered by Gemini AI Orchestration Agent</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full -z-10 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-in-out" style={{ width: `${(Math.min(currentStep, STEPS.length - 1) / (STEPS.length - 1)) * 100}%` }} />
          </div>
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-lg
                ${i < currentStep ? 'bg-primary text-primary-foreground' : i === currentStep ? 'bg-primary/20 text-primary border-2 border-primary' : 'bg-secondary text-muted-foreground'}`}>
                {i < currentStep ? <Check size={18} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden md:block ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
            </div>
          ))}
        </div>

        <div className="glass-card gradient-border p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl">
          <AnimatePresence mode="wait">

            {/* ── STEP 0: ACCOUNT TYPE ── */}
            {currentStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Select Account Type</h3>
                  <p className="text-sm text-muted-foreground">The AI agent will tailor the workflow for your chosen account type.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACCOUNT_TYPES.map((type) => (
                    <div key={type.id}
                      onClick={() => handleInputChange('accountType', type.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-300
                        ${formData.accountType === type.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' : 'border-border bg-card hover:bg-secondary/50 hover:border-border/80'}`}
                    >
                      <div className={`w-12 h-12 rounded-full ${type.bg} ${type.color} flex items-center justify-center shrink-0`}>
                        <type.icon size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                      </div>
                      {formData.accountType === type.id && <Check className="ml-auto text-primary w-5 h-5 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setCurrentStep(1)} disabled={!formData.accountType} size="lg" className="glow-primary">
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: SELECT BANK ── */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Select a Bank</h3>
                  <p className="text-sm text-muted-foreground">Search and choose the partner bank for your current mandate.</p>
                </div>
                
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                     <span className="text-muted-foreground">🔍</span>
                  </div>
                  <input type="text" placeholder="Search for your bank..." value={bankSearch} onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map((bank) => (
                    <div key={bank.id} onClick={() => handleInputChange('bank', bank.name)}
                      className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300
                        ${formData.bank === bank.name ? 'border-primary bg-primary/5 shadow-md shadow-primary/20 scale-100' : 'border-border bg-card hover:bg-secondary/50 scale-95 hover:scale-100 opacity-80 hover:opacity-100'}`}>
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0">
                        <img 
                          src={(bank as any).logo || `https://logo.clearbit.com/${bank.domain}?size=100`} 
                          alt={bank.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.classList.remove('hidden');
                              e.currentTarget.nextElementSibling.classList.add('flex');
                            }
                          }} 
                        />
                        <div className="hidden w-full h-full items-center justify-center bg-secondary/50 rounded-full text-foreground/50">
                          <Building2 size={20} />
                        </div>
                      </div>
                      <span className="font-semibold text-foreground text-center text-xs px-1 leading-tight">{bank.name}</span>
                    </div>
                  ))}
                  {BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                      No banks found matching "{bankSearch}".
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                  <Button onClick={() => setCurrentStep(2)} disabled={!formData.bank} size="lg" className="glow-primary">
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: APPLICANT DETAILS ── */}
            {currentStep === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleFormSubmit} className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Applicant Details</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    {BANKS.find(b => b.name === formData.bank)?.logo && (
                      <img 
                        src={BANKS.find(b => b.name === formData.bank)?.logo} 
                        alt={formData.bank} 
                        className="w-5 h-5 object-contain rounded-full bg-white p-0.5" 
                      />
                    )}
                    KYC form for {formData.bank} — {ACCOUNT_TYPES.find(a => a.id === formData.accountType)?.label}
                  </p>
                </div>

                {/* Proactive AI tip */}
                {aiTip && <AITip msg={`🤖 AI Agent: ${aiTip}`} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { field: "name",    label: "Full Name",     placeholder: "John Doe",       type: "text" },
                    { field: "email",   label: "Email Address", placeholder: "john@email.com", type: "email" },
                    { field: "phone",   label: "Phone Number",  placeholder: "9876543210",     type: "tel",  maxLength: 10 },
                    { field: "pan",     label: "PAN Number",    placeholder: "ABCDE1234F",     type: "text", maxLength: 10 },
                  ].map(({ field, label, placeholder, type, maxLength }) => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{label}</label>
                      <input id={field} type={type} maxLength={maxLength}
                        value={(formData as any)[field]}
                        onChange={e => handleInputChange(field, field === 'pan' ? e.target.value.toUpperCase() : e.target.value)}
                        className={`w-full bg-background/50 border ${errors[field] ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'} rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all`}
                        placeholder={placeholder}
                      />
                      {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
                    </div>
                  ))}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Aadhaar Number</label>
                    <input id="aadhaar" type="text" maxLength={12}
                      value={formData.aadhaar}
                      onChange={e => handleInputChange('aadhaar', e.target.value)}
                      className={`w-full bg-background/50 border ${errors.aadhaar ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'} rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all`}
                      placeholder="123456789012"
                    />
                    {errors.aadhaar && <p className="text-xs text-destructive mt-1">{errors.aadhaar}</p>}
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} disabled={isSubmitting}>Back</Button>
                  <Button type="submit" size="lg" disabled={isSubmitting} className="glow-primary">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & Continue <ChevronRight className="w-5 h-5 ml-1" /></>}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* ── STEP 3: UPLOAD KYC ── */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 py-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Upload Identity Document</h3>
                  <p className="text-sm text-muted-foreground">Upload a clear copy of your PAN card or Aadhaar. Gemini AI will extract and validate the data.</p>
                </div>

                <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                  className={`border-2 border-dashed ${uploadedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'} rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group`}
                  onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"><FileText size={32} /></div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                        <UploadCloud size={32} />
                      </div>
                      <p className="font-medium">Drag & drop your file here</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG supported</p>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-success/10 text-success p-4 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Uploaded! Gemini AI is analyzing your document...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} disabled={isSubmitting}>Back</Button>
                  <Button onClick={handleUploadSubmit} disabled={!uploadedFile || isSubmitting || uploadSuccess} size="lg" className="glow-primary">
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />AI Analyzing...</> : "Verify Document"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: AI VERDICT ── */}
            {currentStep >= 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className="relative">
                  {!aiResult ? (
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
                      <BrainCircuit size={40} className="animate-pulse" />
                      <span className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping opacity-30" />
                    </div>
                  ) : aiResult.decision === "approved" ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success relative">
                      <ShieldCheck size={48} />
                      <span className="absolute inset-0 rounded-full border-4 border-success animate-ping opacity-20" />
                    </motion.div>
                  ) : aiResult.decision === "retry" ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <RefreshCw size={40} />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <AlertTriangle size={40} />
                    </motion.div>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {!aiResult ? "Gemini AI Orchestrator Running..."
                      : aiResult.decision === "approved"        ? "✅ AI Approved — Account Activated!"
                      : aiResult.decision === "pending_review"  ? "⏳ Queued for Human Review"
                      : aiResult.decision === "retry"           ? "⚠️ Retry Required"
                      : aiResult.decision === "upload_required" ? "📄 Document Required"
                      : "🔍 Escalated to Operations Team"}
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {!aiResult ? "Running KYC, AML, and risk checks across all compliance systems..." : aiResult.explanation}
                  </p>
                </div>

                {aiResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-background border border-border rounded-2xl p-5 text-left space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><BrainCircuit size={16} className="text-indigo-400" /> Gemini AI Verdict</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                        aiResult.riskLevel === "Low" ? "bg-success/10 text-success border-success/20" :
                        aiResult.riskLevel === "Medium" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"}`}>{aiResult.riskLevel} Risk</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>AI Confidence</span>
                        <span className="font-semibold">{aiResult.confidence}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${aiResult.confidence >= 80 ? "bg-success" : aiResult.confidence >= 60 ? "bg-orange-400" : "bg-red-500"}`}
                          initial={{ width: 0 }} animate={{ width: `${aiResult.confidence}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                      </div>
                    </div>
                    {aiResult.flags.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issues Detected</p>
                        {aiResult.flags.map((flag, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-orange-400">
                            <AlertTriangle size={12} /> {flag}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-3"><Check className="text-success w-4 h-4" /><span className="text-sm">KYC document securely stored</span></div>
                      <div className="flex items-center gap-3"><Check className="text-success w-4 h-4" /><span className="text-sm">Gemini AI analysis complete</span></div>
                      <div className="flex items-center gap-3"><Check className="text-success w-4 h-4" /><span className="text-sm">Result logged to Orchestration CRM</span></div>
                    </div>
                  </motion.div>
                )}

                {aiResult?.decision === "retry" && (
                  <Button variant="outline" onClick={() => { setCurrentStep(2); setAiResult(null); setUploadSuccess(false); setUploadedFile(null); }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Fix & Retry
                  </Button>
                )}

                <Button size="lg" className="glow-primary px-8" onClick={() => window.location.reload()}>
                  Go to My Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
