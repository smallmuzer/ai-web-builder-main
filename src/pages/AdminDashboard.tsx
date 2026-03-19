import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, MessageSquare, FileText, Shield, Globe, LogOut, Eye, EyeOff, Trash2, ChevronLeft, Menu, X, PanelLeftClose, PanelLeft, Settings, RefreshCw, Mail,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SEOManager from "@/components/admin/SEOManager";
import SecurityPanel from "@/components/admin/SecurityPanel";
import PageEditor from "@/components/admin/PageEditor";
import { useUndoAction } from "@/hooks/useUndoAction";
import LoadingSpinner from "@/components/LoadingSpinner";

type Tab = "dashboard" | "submissions" | "website" | "seo" | "security" | "settings";

// Only fonts available via Google Fonts import
const AVAILABLE_FONTS = [
  "DM Sans", "Space Grotesk",
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [submissions, setSubmissions] = useState<Tables<"contact_submissions">[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { executeWithUndo } = useUndoAction();

  const [siteSettings, setSiteSettings] = useState({
    site_name: "Systems Solutions",
    whatsapp_number: "9603011355",
    contact_email: "info@solutions.com.mv",
    font_size: "medium",
    theme: "light",
    font_style: "DM Sans",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const switchTab = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/login", { replace: true }); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin");
    if (!roles || roles.length === 0) { navigate("/admin/login", { replace: true }); return; }
    setAuthChecking(false);
    loadData();
    loadSettings();
  };

  const loadData = async () => {
    setLoading(true);
    const { data: subData } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (subData) setSubmissions(subData);
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("site_content").select("*").eq("section_key", "settings").maybeSingle();
    if (data?.content) {
      setSiteSettings((prev) => ({ ...prev, ...(data.content as Record<string, any>) }));
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const existing = await supabase.from("site_content").select("id").eq("section_key", "settings").maybeSingle();
    if (existing.data) {
      await supabase.from("site_content").update({ content: siteSettings as any }).eq("section_key", "settings");
    } else {
      await supabase.from("site_content").insert({ section_key: "settings", content: siteSettings as any });
    }
    setSavingSettings(false);
    toast.success("Settings saved! Changes are now live.");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("contact_submissions").update({ is_read: !current }).eq("id", id);
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, is_read: !current } : s));
  };

  const deleteSubmission = async (id: string) => {
    const item = submissions.find((s) => s.id === id);
    if (!item) return;
    executeWithUndo({
      id: `del-sub-${id}`,
      label: "Submission deleted",
      action: async () => {
        await supabase.from("contact_submissions").delete().eq("id", id);
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      },
      undoFn: async () => {
        const { data } = await supabase.from("contact_submissions").insert({
          id: item.id, full_name: item.full_name, email: item.email, message: item.message,
          company_name: item.company_name, phone: item.phone, is_read: item.is_read,
        }).select().single();
        if (data) setSubmissions((prev) => [data, ...prev]);
      },
    });
  };

  const sideItems: { key: Tab; icon: any; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "submissions", icon: MessageSquare, label: "Submissions" },
    { key: "website", icon: FileText, label: "Edit Website" },
    { key: "seo", icon: Globe, label: "SEO" },
    { key: "security", icon: Shield, label: "Security" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  if (authChecking || loggingOut) return <LoadingSpinner message={loggingOut ? "Signing out..." : "Verifying access..."} />;

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "lg:w-16" : "lg:w-64"} w-64`}>
        <div className={`border-b border-border flex items-center ${collapsed ? "lg:justify-center lg:p-3 p-5" : "justify-between p-5"}`}>
          {!collapsed && <h2 className="font-heading font-bold text-foreground text-lg">Admin Panel</h2>}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg text-muted-foreground hover:bg-muted"><X size={20} /></button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <nav className={`flex-1 space-y-1 overflow-y-auto ${collapsed ? "lg:p-1.5 p-3" : "p-3"}`}>
          {sideItems.map((item) => (
            <button key={item.key} onClick={() => switchTab(item.key)} title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-colors ${
                collapsed ? "lg:justify-center lg:px-0 lg:py-3 gap-3 px-4 py-3" : "gap-3 px-4 py-3"
              } ${tab === item.key ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <item.icon size={18} className="shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              {item.key === "submissions" && unreadCount > 0 && !collapsed && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className={`border-t border-border space-y-1 ${collapsed ? "lg:p-1.5 p-3" : "p-3"}`}>
          <a href="/" title={collapsed ? "Back to site" : undefined} className={`flex items-center rounded-xl text-sm text-muted-foreground hover:bg-muted ${
            collapsed ? "lg:justify-center lg:px-0 lg:py-3 gap-3 px-4 py-3" : "gap-3 px-4 py-3"
          }`}>
            <ChevronLeft size={18} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Back to site</span>
          </a>
          <button onClick={handleLogout} title={collapsed ? "Logout" : undefined} className={`w-full flex items-center rounded-xl text-sm text-destructive hover:bg-destructive/10 ${
            collapsed ? "lg:justify-center lg:px-0 lg:py-3 gap-3 px-4 py-3" : "gap-3 px-4 py-3"
          }`}>
            <LogOut size={18} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-foreground hover:bg-muted"><Menu size={20} /></button>
          <h2 className="font-heading font-semibold text-foreground text-sm capitalize">{tab === "seo" ? "SEO" : tab.replace("_", " ")}</h2>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {loading && tab !== "website" && tab !== "seo" && tab !== "security" && tab !== "settings" ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {tab === "dashboard" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-heading font-bold text-2xl text-foreground">Dashboard</h1>
                  <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Total Submissions", value: submissions.length, color: "text-secondary" },
                    { label: "Unread", value: unreadCount, color: "text-destructive" },
                  ].map((s) => (
                    <div key={s.label} className="glass-card p-6">
                      <div className={`text-3xl font-heading font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-muted-foreground text-sm mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-5 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">Live Website Preview</h3>
                      <p className="text-muted-foreground text-sm mt-1">View your website as visitors see it</p>
                    </div>
                    <a href="/" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                      <Eye size={14} /> View Live Site
                    </a>
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-3">Recent Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.slice(0, 5).map((s) => (
                      <div key={s.id} className={`glass-card p-4 ${!s.is_read ? "border-l-4 border-l-secondary" : ""}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-foreground text-sm">{s.full_name}</span>
                            <span className="text-muted-foreground text-xs ml-2">{s.email}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{s.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "submissions" && (
              <div>
                <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Contact Submissions</h1>
                <div className="space-y-3">
                  {submissions.map((s) => (
                    <div key={s.id} className={`glass-card p-5 ${!s.is_read ? "border-l-4 border-l-secondary" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-foreground">{s.full_name}</span>
                          {s.company_name && <span className="text-muted-foreground text-sm ml-2">({s.company_name})</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleRead(s.id, s.is_read)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title={s.is_read ? "Mark unread" : "Mark read"}>
                            {s.is_read ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button onClick={() => deleteSubmission(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>
                        {s.phone && <span>• {s.phone}</span>}
                      </div>
                      <p className="text-foreground text-sm">{s.message}</p>
                      <div className="text-xs text-muted-foreground mt-2">{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  {submissions.length === 0 && <p className="text-muted-foreground text-center py-12">No submissions yet.</p>}
                </div>
              </div>
            )}

            {tab === "website" && <PageEditor key="page-editor" />}
            {tab === "seo" && <SEOManager key="seo-manager" />}
            {tab === "security" && <SecurityPanel key="security-panel" />}

            {tab === "settings" && (
              <div className="flex justify-center">
                <div className="w-full max-w-lg">
                  <h1 className="font-heading font-bold text-2xl text-foreground mb-2 text-center">Site Settings</h1>
                  <p className="text-muted-foreground text-sm mb-6 text-center">These settings affect the live website for all visitors in real-time.</p>
                  <div className="glass-card p-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Site Name</label>
                      <input value={siteSettings.site_name}
                        onChange={(e) => setSiteSettings(p => ({ ...p, site_name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">WhatsApp Number</label>
                        <input value={siteSettings.whatsapp_number}
                          onChange={(e) => setSiteSettings(p => ({ ...p, whatsapp_number: e.target.value }))}
                          placeholder="e.g. 9603011355"
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Contact Email</label>
                        <input type="email" value={siteSettings.contact_email}
                          onChange={(e) => setSiteSettings(p => ({ ...p, contact_email: e.target.value }))}
                          placeholder="info@solutions.com.mv"
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Font Style</label>
                        <select value={siteSettings.font_style}
                          onChange={(e) => setSiteSettings(p => ({ ...p, font_style: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                          style={{ fontFamily: siteSettings.font_style }}>
                          {AVAILABLE_FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Font Size</label>
                        <select value={siteSettings.font_size}
                          onChange={(e) => setSiteSettings(p => ({ ...p, font_size: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm">
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="x-large">X-Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Theme</label>
                        <select value={siteSettings.theme}
                          onChange={(e) => setSiteSettings(p => ({ ...p, theme: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm">
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={saveSettings} disabled={savingSettings}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 mt-2">
                      <Settings size={14} /> {savingSettings ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
