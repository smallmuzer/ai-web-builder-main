import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Edit2, Trash2, Plus, Check, X } from "lucide-react";

const SECTION_KEYS = [
  {
    key: "hero",
    label: "Hero Section",
    fields: [
      { name: "title", label: "Page Title", long: false },
      { name: "subtitle", label: "Subtitle / Description", long: true },
      { name: "cta_text", label: "Button Text", long: false },
    ],
  },
  {
    key: "about",
    label: "About Section",
    fields: [
      { name: "title", label: "Section Title", long: false },
      { name: "description", label: "Main Description", long: true },
      { name: "vision", label: "Vision / Second Paragraph", long: true },
      { name: "card_mission", label: "Card: Our Mission", long: true },
      { name: "card_team", label: "Card: Our Team", long: true },
      { name: "card_quality", label: "Card: Quality First", long: true },
      { name: "card_global", label: "Card: Global Reach", long: true },
    ],
  },
  {
    key: "services",
    label: "Services Section",
    fields: [
      { name: "title", label: "Section Title", long: false },
      { name: "subtitle", label: "Section Subtitle", long: true },
    ],
  },
  {
    key: "contact",
    label: "Contact Section",
    fields: [
      { name: "title", label: "Section Title", long: false },
      { name: "subtitle", label: "Section Subtitle", long: true },
      { name: "address", label: "Office Address", long: true },
      { name: "email", label: "Email Address", long: false },
      { name: "phone", label: "Phone Number", long: false },
      { name: "hours", label: "Business Hours", long: true },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      { name: "copyright", label: "Copyright Text", long: false },
      { name: "tagline", label: "Tagline / Description", long: true },
    ],
  },
];

const DEFAULT_CONTENT: Record<string, Record<string, string>> = {
  hero: {
    title: "Leading IT Solutions Company in Maldives",
    subtitle: "Transform your business with cutting-edge technology solutions. We help entrepreneurs turn their dreams into profitable ventures with robust, user-friendly applications.",
    cta_text: "Get Started",
  },
  about: {
    title: "Driving Digital Transformation",
    description: "Systems Solutions Pvt Ltd is a tech-leading IT consulting and software development company in the Digital Era! We have provisioned our esteemed clients with the Best-Suite Software Solutions. We mainly focus on ERP Development, Implementation, and integration.",
    vision: "Our journey began out of the passion for a unique position in the industry. To save time and money and to free up platform owners to concentrate on their main offering.",
    card_mission: "Deliver innovative technology solutions that transform businesses and drive measurable growth.",
    card_team: "Expert developers, designers, and consultants dedicated to your success.",
    card_quality: "Every solution we build meets the highest standards of performance and reliability.",
    card_global: "Serving clients across Maldives, Bhutan, and beyond with world-class solutions.",
  },
  services: {
    title: "Services & Solutions",
    subtitle: "Team up with the perfect digital partner for all your technical needs to achieve your business goals, reduce costs and accelerate growth.",
  },
  contact: {
    title: "Get In Touch",
    subtitle: "Ready to transform your business with cutting-edge technology? Contact us today for a free consultation.",
    address: "Alia Building, 7th Floor\nGandhakoalhi Magu\nMalé, Maldives",
    email: "info@solutions.com.mv",
    phone: "+960 301-1355",
    hours: "Sun–Thu: 9AM–6PM\nSat: 9AM–1PM",
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Systems Solutions Pvt Ltd. All rights reserved.`,
    tagline: "Leading IT consulting and software development company delivering cutting-edge technology solutions.",
  },
};

const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none";
const textareaCls = `${inputCls} resize-y min-h-[80px] max-h-52 overflow-y-auto`;

const ContentEditor = () => {
  const [contents, setContents] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_content").select("*");
    const map: Record<string, Record<string, string>> = {};
    if (data) {
      data.forEach((row) => {
        if (row.section_key !== "settings") {
          map[row.section_key] = (row.content as Record<string, string>) || {};
        }
      });
    }
    // Fill in defaults for any missing section or field
    SECTION_KEYS.forEach((s) => {
      const base = { ...(DEFAULT_CONTENT[s.key] || {}) };
      if (map[s.key]) {
        map[s.key] = { ...base, ...map[s.key] };
      } else {
        map[s.key] = base;
      }
    });
    setContents(map);
    setLoading(false);
  };

  const saveSection = async (sectionKey: string) => {
    setSaving(sectionKey);
    const existing = await supabase.from("site_content").select("id").eq("section_key", sectionKey).maybeSingle();
    if (existing.data) {
      await supabase.from("site_content").update({ content: contents[sectionKey] as any }).eq("section_key", sectionKey);
    } else {
      await supabase.from("site_content").insert({ section_key: sectionKey, content: contents[sectionKey] as any });
    }
    setSaving(null);
    setEditingSection(null);
    toast.success(`${sectionKey} content saved! Live website updated.`);
  };

  const updateField = (section: string, field: string, value: string) => {
    setContents((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const resetToDefault = (sectionKey: string) => {
    setContents((prev) => ({
      ...prev,
      [sectionKey]: { ...DEFAULT_CONTENT[sectionKey] },
    }));
    toast.info("Reset to default values (not saved yet)");
  };

  if (loading) return <div className="text-muted-foreground text-center py-12">Loading content...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Site Content</h1>
          <p className="text-muted-foreground text-sm mt-1">Edit website content — changes go live instantly when saved</p>
        </div>
        <button onClick={loadContent} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="space-y-6">
        {SECTION_KEYS.map((section) => (
          <div key={section.key} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{section.label}</h3>
                <p className="text-muted-foreground text-xs mt-0.5">{section.key}</p>
              </div>
              <div className="flex gap-2">
                {editingSection === section.key ? (
                  <>
                    <button onClick={() => saveSection(section.key)} disabled={saving === section.key}
                      className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                      <Check size={14} /> {saving === section.key ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditingSection(null); loadContent(); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:opacity-90">
                      <X size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingSection(section.key)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:opacity-90">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => resetToDefault(section.key)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Reset to defaults">
                      <RefreshCw size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="grid gap-4">
              {section.fields.map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {field.label}
                  </label>
                  {editingSection === section.key ? (
                    field.long ? (
                      <textarea
                        value={contents[section.key]?.[field.name] || ""}
                        onChange={(e) => updateField(section.key, field.name, e.target.value)}
                        className={textareaCls}
                      />
                    ) : (
                      <input
                        value={contents[section.key]?.[field.name] || ""}
                        onChange={(e) => updateField(section.key, field.name, e.target.value)}
                        className={inputCls}
                      />
                    )
                  ) : (
                    <div className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm whitespace-pre-wrap break-words max-h-28 overflow-y-auto">
                      {contents[section.key]?.[field.name] || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentEditor;
