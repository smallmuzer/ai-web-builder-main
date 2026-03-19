import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Globe, Search, Plus } from "lucide-react";

interface SEOEntry {
  id: string;
  page_key: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
}

const DEFAULT_SEO: Omit<SEOEntry, "id">[] = [
  { page_key: "home", title: "Systems Solutions - Leading IT Company in Maldives", description: "Transform your business with cutting-edge technology solutions. Software development, ERP, mobile apps, and IT consulting.", keywords: "IT solutions, Maldives, software development, ERP, web development", og_image: "" },
];

const SEOManager = () => {
  const [entries, setEntries] = useState<SEOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    setLoading(true);
    const { data } = await supabase.from("seo_settings").select("*");
    if (data && data.length > 0) {
      setEntries(data.map((d: any) => ({ ...d, og_image: d.og_image || "" })));
    } else {
      // Seed default SEO entry
      for (const def of DEFAULT_SEO) {
        const { data: inserted } = await supabase.from("seo_settings").insert(def).select().single();
        if (inserted) setEntries((prev) => [...prev, { ...inserted, og_image: inserted.og_image || "" }]);
      }
    }
    setLoading(false);
  };

  const addPage = async () => {
    const pageKey = prompt("Enter page key (e.g. 'about', 'services'):");
    if (!pageKey) return;
    const { data } = await supabase.from("seo_settings").insert({
      page_key: pageKey,
      title: `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} - Systems Solutions`,
      description: "",
      keywords: "",
    }).select().single();
    if (data) {
      setEntries((prev) => [...prev, { ...data, og_image: data.og_image || "" }]);
      toast.success("Page added!");
    }
  };

  const saveSEO = async (entry: SEOEntry) => {
    setSaving(entry.id);
    const { error } = await supabase.from("seo_settings").update({
      title: entry.title,
      description: entry.description,
      keywords: entry.keywords,
      og_image: entry.og_image,
    }).eq("id", entry.id);
    setSaving(null);
    if (error) { toast.error("Failed to save."); return; }
    toast.success("SEO settings saved!");
    if (entry.page_key === "home") {
      document.title = entry.title;
      document.querySelector('meta[name="description"]')?.setAttribute("content", entry.description);
      document.querySelector('meta[name="keywords"]')?.setAttribute("content", entry.keywords);
    }
  };

  const updateEntry = (id: string, field: string, value: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));
  };

  if (loading) return <div className="text-muted-foreground text-center py-12">Loading SEO settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground mb-1">SEO Management</h1>
          <p className="text-muted-foreground text-sm">Manage meta tags, titles, and descriptions for search engine optimization.</p>
        </div>
        <button onClick={addPage}
          className="flex items-center gap-1.5 px-4 py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-medium hover:bg-secondary/20">
          <Plus size={14} /> Add Page
        </button>
      </div>
      
      <div className="space-y-6">
        {entries.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Globe size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No SEO entries found. Click "Add Page" to create one.</p>
          </div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-secondary" />
                <h3 className="font-heading font-semibold text-foreground capitalize">{entry.page_key} Page</h3>
              </div>
              <button
                onClick={() => saveSEO(entry)}
                disabled={saving === entry.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Save size={14} /> {saving === entry.id ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="mb-5 p-4 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Search size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Search Preview</span>
              </div>
              <div className="text-secondary text-base font-medium truncate">{entry.title || "Page Title"}</div>
              <div className="text-xs text-secondary mt-0.5">solutions.com.mv/{entry.page_key === "home" ? "" : entry.page_key}</div>
              <div className="text-muted-foreground text-sm mt-1 line-clamp-2">{entry.description || "Page description..."}</div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Title <span className="text-muted-foreground font-normal">({entry.title.length}/60)</span>
                </label>
                <input value={entry.title} onChange={(e) => updateEntry(entry.id, "title", e.target.value)}
                  maxLength={60} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Meta Description <span className="text-muted-foreground font-normal">({entry.description.length}/160)</span>
                </label>
                <textarea value={entry.description} onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
                  maxLength={160} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-none focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Keywords (comma-separated)</label>
                <input value={entry.keywords} onChange={(e) => updateEntry(entry.id, "keywords", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder="keyword1, keyword2, keyword3" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">OG Image URL</label>
                <input value={entry.og_image} onChange={(e) => updateEntry(entry.id, "og_image", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder="https://..." />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOManager;
