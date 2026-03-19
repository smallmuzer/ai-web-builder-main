import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecuritySetting {
  key: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
}

const DEFAULT_SETTINGS: SecuritySetting[] = [
  { key: "anti_scraping", label: "Anti-Scraping Protection", description: "Block automated bots and web scrapers from copying your content.", icon: ShieldAlert, enabled: true },
  { key: "right_click", label: "Disable Right-Click", description: "Prevent users from right-clicking to copy images and text.", icon: Lock, enabled: false },
  { key: "rate_limiting", label: "Rate Limiting", description: "Limit API requests to prevent abuse (already enabled for contact form).", icon: Shield, enabled: true },
  { key: "content_security", label: "Content Security Headers", description: "Add security headers to prevent XSS and clickjacking attacks.", icon: ShieldCheck, enabled: true },
  { key: "ip_logging", label: "IP Activity Logging", description: "Log IP addresses for suspicious activity monitoring.", icon: Eye, enabled: false },
  { key: "cors_protection", label: "CORS Protection", description: "Restrict which domains can access your API endpoints.", icon: Globe, enabled: true },
];

const SecurityPanel = () => {
  const [settings, setSettings] = useState<SecuritySetting[]>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved security settings from site_content
    const load = async () => {
      const { data } = await supabase.from("site_content").select("content").eq("section_key", "security").maybeSingle();
      if (data?.content) {
        const saved = data.content as Record<string, boolean>;
        setSettings((prev) =>
          prev.map((s) => ({ ...s, enabled: saved[s.key] !== undefined ? saved[s.key] : s.enabled }))
        );
      }
    };
    load();
  }, []);

  const toggle = async (key: string) => {
    const updated = settings.map((s) => {
      if (s.key === key) {
        const newVal = !s.enabled;
        if (key === "right_click") {
          if (newVal) document.addEventListener("contextmenu", preventContext);
          else document.removeEventListener("contextmenu", preventContext);
        }
        return { ...s, enabled: newVal };
      }
      return s;
    });
    setSettings(updated);

    // Persist
    const secObj: Record<string, boolean> = {};
    updated.forEach((s) => { secObj[s.key] = s.enabled; });
    const existing = await supabase.from("site_content").select("id").eq("section_key", "security").maybeSingle();
    if (existing.data) {
      await supabase.from("site_content").update({ content: secObj as any }).eq("section_key", "security");
    } else {
      await supabase.from("site_content").insert({ section_key: "security", content: secObj as any });
    }
  };

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Security Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage security features to protect your website and data.</p>

      <div className="grid gap-4">
        {settings.map((setting) => (
          <div key={setting.key} className="glass-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${setting.enabled ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                <setting.icon size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground text-sm">{setting.label}</h3>
                <p className="text-muted-foreground text-xs mt-0.5">{setting.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(setting.key)}
              className={`relative w-12 h-6 rounded-full transition-colors ${setting.enabled ? "bg-secondary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${setting.enabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 mt-6">
        <h3 className="font-heading font-semibold text-foreground mb-3">Security Score</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-heading font-bold text-secondary">
            {Math.round((settings.filter((s) => s.enabled).length / settings.length) * 100)}%
          </div>
          <div className="flex-1">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all"
                style={{ width: `${(settings.filter((s) => s.enabled).length / settings.length) * 100}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              {settings.filter((s) => s.enabled).length} of {settings.length} security features enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const preventContext = (e: MouseEvent) => e.preventDefault();

export default SecurityPanel;
