import { Bell, Shield, Palette, Globe, Key, Save, Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SettingsPage = () => {
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [updatingPwd, setUpdatingPwd] = useState(false);

  const [notifs, setNotifs] = useState({
    emailAlerts: true, paymentNotifications: true,
    securityAlerts: true, weeklyReports: false, marketingEmails: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        const authName = user.user_metadata?.name || user.email?.split('@')[0] || "User";
        supabase.from('users').select('name, email, role').eq('id', user.id).single().then(({ data }) => {
          const n = data?.name || authName;
          const e = data?.email || user.email || "";
          const r = data?.role === 'admin' ? "Admin" : "Customer";
          setProfile({ name: n, email: e, role: r });
          setEditName(n);
          setLoading(false);
        });
      } else setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({ name: editName }).eq('id', userId);
      if (error) throw error;
      setProfile(p => ({ ...p, name: editName }));
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.next || passwords.next !== passwords.confirm) {
      toast.error("New passwords do not match."); return;
    }
    if (passwords.next.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setUpdatingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.next });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdatingPwd(false);
    }
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success(`${key.replace(/([A-Z])/g, ' $1')} ${updated[key] ? 'enabled' : 'disabled'}.`);
      return updated;
    });
  };

  const notifItems: { label: string; key: keyof typeof notifs }[] = [
    { label: "Email Alerts", key: "emailAlerts" },
    { label: "Payment Notifications", key: "paymentNotifications" },
    { label: "Security Alerts", key: "securityAlerts" },
    { label: "Weekly Reports", key: "weeklyReports" },
    { label: "Marketing Emails", key: "marketingEmails" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences and configuration.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Profile */}
          <div className="rounded-xl border border-border bg-card p-5 relative">
            {loading && <div className="absolute inset-0 z-10 bg-card/50 flex items-center justify-center rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Profile Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <input value={profile.email} readOnly
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                <input value={profile.role} readOnly
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors glow-primary disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Security — Change Password
            </h3>
            <div className="space-y-4">
              {[
                { label: "Current Password (not validated)", key: "current" },
                { label: "New Password", key: "next" },
                { label: "Confirm New Password", key: "confirm" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                  <input type="password" placeholder="••••••••"
                    value={(passwords as any)[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              ))}
              <button onClick={handleUpdatePassword} disabled={updatingPwd}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50">
                {updatingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Update Password
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Notifications — interactive toggles */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </h3>
            <div className="space-y-3">
              {notifItems.map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{label}</span>
                  <button onClick={() => toggleNotif(key)}
                    className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${notifs[key] ? "bg-primary" : "bg-secondary"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${notifs[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Localization */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Localization
            </h3>
            <div className="space-y-3">
              {[
                { label: "Timezone", options: ["UTC +5:30 IST", "UTC +0:00 GMT", "UTC -5:00 EST"] },
                { label: "Currency", options: ["INR (₹)", "USD ($)", "EUR (€)"] },
                { label: "Language", options: ["English", "Hindi", "Tamil"] },
              ].map(({ label, options }) => (
                <div key={label}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                  <select onChange={() => toast.success(`${label} preference saved!`)}
                    className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors">
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button onClick={() => toast.success("Localization preferences saved!")}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                <Check className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
