import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, EyeOff, Trash2, Plus, Edit2, Check, X, Save, GripVertical,
  MapPin, Star, Briefcase, Users, FileText, Phone, Mail, Globe, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, Upload,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import RichTextEditor from "./RichTextEditor";

type Service = Tables<"services">;
type ClientLogo = Tables<"client_logos">;
type Testimonial = Tables<"testimonials">;
type CareerJob = Tables<"career_jobs">;

interface LocationData {
  name: string; lat: number; lng: number; clients: string;
  description: string; flag: string; landmark: string;
}

const DEFAULT_CONTENT: Record<string, Record<string, string>> = {
  hero: {
    title: "Leading IT Solutions Company in Maldives",
    subtitle: "Transform your business with cutting-edge technology solutions.",
    cta_text: "Get Started",
  },
  about: {
    title: "Driving Digital Transformation",
    description: "Systems Solutions Pvt Ltd is a tech-leading IT consulting and software development company.",
    vision: "Our journey began out of the passion for a unique position in the industry.",
    card_mission: "Deliver innovative technology solutions that transform businesses.",
    card_team: "Expert developers, designers, and consultants dedicated to your success.",
    card_quality: "Every solution we build meets the highest standards of performance.",
    card_global: "Serving clients across Maldives, Bhutan, and beyond.",
  },
  contact: {
    title: "Get In Touch",
    subtitle: "Ready to transform your business? Contact us today.",
    address: "Alia Building, 7th Floor\nGandhakoalhi Magu\nMalé, Maldives",
    email: "info@solutions.com.mv",
    phone: "+960 301-1355",
    hours: "Sun–Thu: 9AM–6PM\nSat: 9AM–1PM",
  },
  footer: {
    copyright: "© 2025 Systems Solutions Pvt Ltd. All rights reserved.",
    tagline: "Leading IT consulting and software development company.",
  },
  services: {
    title: "Services & Solutions",
    subtitle: "Team up with the perfect digital partner for all your technical needs.",
  },
};

// ─── Section Wrapper ────────────────────────────────────────
const SectionBlock = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon size={18} className="text-secondary shrink-0" />
        <span className="font-heading font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border/50">{children}</div>}
    </div>
  );
};

const InlineField = ({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
    {multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-y" />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
    )}
  </div>
);

const RichField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
    <RichTextEditor value={value} onChange={onChange} />
  </div>
);

const PageEditor = () => {
  const [siteContent, setSiteContent] = useState<Record<string, Record<string, string>>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [careers, setCareers] = useState<CareerJob[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [editingCareer, setEditingCareer] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<number | null>(null);

  const [tempService, setTempService] = useState<Partial<Service>>({});
  const [tempClient, setTempClient] = useState<Partial<ClientLogo>>({});
  const [tempTestimonial, setTempTestimonial] = useState<Partial<Testimonial>>({});
  const [tempCareer, setTempCareer] = useState<Partial<CareerJob>>({});
  const [tempLocation, setTempLocation] = useState<Partial<LocationData>>({});

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [contentRes, servicesRes, clientsRes, testimonialsRes, careersRes] = await Promise.all([
      supabase.from("site_content").select("section_key,content"),
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("client_logos").select("*").order("sort_order"),
      supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
      supabase.from("career_jobs").select("*").order("sort_order"),
    ]);
    if (contentRes.data) {
      const map: Record<string, Record<string, string>> = {};
      contentRes.data.forEach((row) => {
        if (row.section_key === "global_presence") {
          const c = row.content as any;
          if (Array.isArray(c.locations)) setLocations(c.locations);
        } else if (row.section_key !== "settings" && row.section_key !== "security") {
          map[row.section_key] = row.content as Record<string, string>;
        }
      });
      // Merge defaults for sections that have no DB data
      for (const [key, defaults] of Object.entries(DEFAULT_CONTENT)) {
        if (!map[key]) {
          map[key] = { ...defaults };
        } else {
          // Fill in missing fields from defaults
          for (const [field, val] of Object.entries(defaults)) {
            if (!map[key][field]) map[key][field] = val;
          }
        }
      }
      setSiteContent(map);
    } else {
      setSiteContent({ ...DEFAULT_CONTENT });
    }
    if (servicesRes.data) setServices(servicesRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    if (careersRes.data) setCareers(careersRes.data);
  };

  const saveSection = async (key: string) => {
    setSaving(key);
    const existing = await supabase.from("site_content").select("id").eq("section_key", key).maybeSingle();
    if (existing.data) {
      await supabase.from("site_content").update({ content: siteContent[key] as any }).eq("section_key", key);
    } else {
      await supabase.from("site_content").insert({ section_key: key, content: siteContent[key] as any });
    }
    setSaving(null);
    toast.success(`${key} section saved!`);
  };

  const updateContent = (section: string, field: string, value: string) => {
    setSiteContent((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const saveLocations = async () => {
    setSaving("locations");
    const existing = await supabase.from("site_content").select("id").eq("section_key", "global_presence").maybeSingle();
    const content = { locations } as any;
    if (existing.data) {
      await supabase.from("site_content").update({ content }).eq("section_key", "global_presence");
    } else {
      await supabase.from("site_content").insert({ section_key: "global_presence", content });
    }
    setSaving(null);
    toast.success("Global presence saved!");
  };

  const addLocation = () => {
    setLocations([...locations, { name: "New Location", lat: 0, lng: 0, clients: "", description: "", flag: "🏳️", landmark: "" }]);
    setEditingLocation(locations.length);
    setTempLocation({ name: "New Location", lat: 0, lng: 0, clients: "", description: "", flag: "🏳️", landmark: "" });
  };

  const deleteLocation = (idx: number) => setLocations(locations.filter((_, i) => i !== idx));

  const toggleVisibility = async (table: string, id: string, current: boolean, setter: Function) => {
    await supabase.from(table as any).update({ is_visible: !current } as any).eq("id", id);
    setter((prev: any[]) => prev.map((item: any) => item.id === id ? { ...item, is_visible: !current } : item));
  };

  const deleteItem = async (table: string, id: string, setter: Function) => {
    await supabase.from(table as any).delete().eq("id", id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== id));
    toast.success("Deleted!");
  };

  const moveClient = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= clients.length) return;
    const updated = [...clients];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((c, i) => { c.sort_order = i; });
    setClients(updated);
    // Persist order
    for (const c of updated) {
      await supabase.from("client_logos").update({ sort_order: c.sort_order } as any).eq("id", c.id);
    }
  };

  const addService = async () => {
    const { data } = await supabase.from("services").insert({ title: "New Service", description: "Description here", sort_order: services.length }).select().single();
    if (data) { setServices([...services, data]); setEditingService(data.id); setTempService(data); }
  };

  const addClient = async () => {
    const { data } = await supabase.from("client_logos").insert({ name: "New Client", logo_url: "", sort_order: clients.length }).select().single();
    if (data) { setClients([...clients, data]); setEditingClient(data.id); setTempClient(data); }
  };

  const addTestimonial = async () => {
    const { data } = await supabase.from("testimonials").insert({
      name: "New Person", company: "Company", message: "Great service!", rating: 5,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=new${Date.now()}`,
    }).select().single();
    if (data) { setTestimonials([data, ...testimonials]); setEditingTestimonial(data.id); setTempTestimonial(data); }
  };

  const addCareer = async () => {
    const { data } = await supabase.from("career_jobs").insert({ title: "New Position", description: "", location: "Malé", job_type: "Full-time", sort_order: careers.length }).select().single();
    if (data) { setCareers([...careers, data]); setEditingCareer(data.id); setTempCareer(data); }
  };

  const saveService = async () => {
    if (!editingService) return;
    await supabase.from("services").update({ title: tempService.title, description: tempService.description, image_url: tempService.image_url } as any).eq("id", editingService);
    setServices((prev) => prev.map((s) => s.id === editingService ? { ...s, ...tempService } : s));
    setEditingService(null);
    toast.success("Service updated!");
  };

  const saveClient = async () => {
    if (!editingClient) return;
    await supabase.from("client_logos").update({ name: tempClient.name, logo_url: tempClient.logo_url } as any).eq("id", editingClient);
    setClients((prev) => prev.map((c) => c.id === editingClient ? { ...c, ...tempClient } : c));
    setEditingClient(null);
    toast.success("Client updated!");
  };

  const saveTestimonial = async () => {
    if (!editingTestimonial) return;
    await supabase.from("testimonials").update({
      name: tempTestimonial.name, company: tempTestimonial.company,
      message: tempTestimonial.message, rating: tempTestimonial.rating,
      avatar_url: tempTestimonial.avatar_url,
    } as any).eq("id", editingTestimonial);
    setTestimonials((prev) => prev.map((t) => t.id === editingTestimonial ? { ...t, ...tempTestimonial } : t));
    setEditingTestimonial(null);
    toast.success("Testimonial updated!");
  };

  const saveCareer = async () => {
    if (!editingCareer) return;
    await supabase.from("career_jobs").update({
      title: tempCareer.title, description: tempCareer.description,
      location: tempCareer.location, job_type: tempCareer.job_type,
    } as any).eq("id", editingCareer);
    setCareers((prev) => prev.map((c) => c.id === editingCareer ? { ...c, ...tempCareer } : c));
    setEditingCareer(null);
    toast.success("Job updated!");
  };

  const saveLocationEdit = () => {
    if (editingLocation === null) return;
    const updated = [...locations];
    updated[editingLocation] = tempLocation as LocationData;
    setLocations(updated);
    setEditingLocation(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading font-bold text-2xl text-foreground">Edit Website</h1>
        <p className="text-muted-foreground text-sm">Click any section to expand & edit</p>
      </div>

      {/* ─── HERO ─── */}
      <SectionBlock title="Hero Section" icon={FileText} defaultOpen>
        <div className="space-y-3 pt-4">
          <InlineField label="Title" value={siteContent.hero?.title || ""} onChange={(v) => updateContent("hero", "title", v)} />
          <RichField label="Subtitle" value={siteContent.hero?.subtitle || ""} onChange={(v) => updateContent("hero", "subtitle", v)} />
          <InlineField label="CTA Button Text" value={siteContent.hero?.cta_text || ""} onChange={(v) => updateContent("hero", "cta_text", v)} />
          <button onClick={() => saveSection("hero")} disabled={saving === "hero"}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Save size={14} /> {saving === "hero" ? "Saving..." : "Save Hero"}
          </button>
        </div>
      </SectionBlock>

      {/* ─── ABOUT ─── */}
      <SectionBlock title="About Section" icon={FileText}>
        <div className="space-y-3 pt-4">
          <InlineField label="Title" value={siteContent.about?.title || ""} onChange={(v) => updateContent("about", "title", v)} />
          <RichField label="Description" value={siteContent.about?.description || ""} onChange={(v) => updateContent("about", "description", v)} />
          <RichField label="Vision" value={siteContent.about?.vision || ""} onChange={(v) => updateContent("about", "vision", v)} />
          <div className="grid sm:grid-cols-2 gap-3">
            {["card_mission", "card_team", "card_quality", "card_global"].map((key) => (
              <RichField key={key} label={key.replace("card_", "Card: ")} value={siteContent.about?.[key] || ""} onChange={(v) => updateContent("about", key, v)} />
            ))}
          </div>
          <button onClick={() => saveSection("about")} disabled={saving === "about"}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Save size={14} /> {saving === "about" ? "Saving..." : "Save About"}
          </button>
        </div>
      </SectionBlock>

      {/* ─── SERVICES ─── */}
      <SectionBlock title="Services & Solutions" icon={Briefcase}>
        <div className="space-y-3 pt-4">
          <InlineField label="Section Title" value={siteContent.services?.title || ""} onChange={(v) => updateContent("services", "title", v)} />
          <RichField label="Section Subtitle" value={siteContent.services?.subtitle || ""} onChange={(v) => updateContent("services", "subtitle", v)} />
          <button onClick={() => saveSection("services")} disabled={saving === "services"}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
            <Save size={12} /> Save Header
          </button>

          <div className="border-t border-border/50 pt-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Services ({services.length})</span>
              <button onClick={addService} className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium hover:bg-secondary/20">
                <Plus size={12} /> Add Service
              </button>
            </div>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="border border-border/50 rounded-lg p-3 bg-background/50">
                  {editingService === s.id ? (
                    <div className="space-y-2">
                      <InlineField label="Title" value={tempService.title || ""} onChange={(v) => setTempService({ ...tempService, title: v })} />
                      <RichField label="Description" value={tempService.description || ""} onChange={(v) => setTempService({ ...tempService, description: v })} />
                      <div className="flex gap-2">
                        <button onClick={saveService} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs"><Check size={12} /> Save</button>
                        <button onClick={() => setEditingService(null)} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{s.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.description}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingService(s.id); setTempService(s); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                        <button onClick={() => toggleVisibility("services", s.id, s.is_visible, setServices)}
                          className={`p-1.5 rounded hover:bg-muted ${s.is_visible ? "text-secondary" : "text-muted-foreground"}`}>
                          {s.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => deleteItem("services", s.id, setServices)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* ─── CLIENTS ─── */}
      <SectionBlock title="Client Logos" icon={Users}>
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Clients ({clients.length})</span>
            <button onClick={addClient} className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium hover:bg-secondary/20">
              <Plus size={12} /> Add Client
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {clients.map((c, idx) => (
              <div key={c.id} className="border border-border/50 rounded-lg p-3 bg-background/50">
                {editingClient === c.id ? (
                  <div className="space-y-2">
                    <InlineField label="Name" value={tempClient.name || ""} onChange={(v) => setTempClient({ ...tempClient, name: v })} />
                    <InlineField label="Logo URL" value={tempClient.logo_url || ""} onChange={(v) => setTempClient({ ...tempClient, logo_url: v })} />
                    <div className="flex gap-2">
                      <button onClick={saveClient} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs"><Check size={12} /> Save</button>
                      <button onClick={() => setEditingClient(null)} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {c.logo_url && <img src={c.logo_url} alt={c.name} className="w-8 h-8 object-contain rounded" />}
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{c.name}</span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => moveClient(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"><ArrowUp size={12} /></button>
                      <button onClick={() => moveClient(idx, 1)} disabled={idx === clients.length - 1} className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"><ArrowDown size={12} /></button>
                      <button onClick={() => { setEditingClient(c.id); setTempClient(c); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                      <button onClick={() => toggleVisibility("client_logos", c.id, c.is_visible, setClients)}
                        className={`p-1.5 rounded hover:bg-muted ${c.is_visible ? "text-secondary" : "text-muted-foreground"}`}>
                        {c.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => deleteItem("client_logos", c.id, setClients)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* ─── GLOBAL PRESENCE ─── */}
      <SectionBlock title="Global Presence (World Map)" icon={Globe}>
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Locations ({locations.length})</span>
            <button onClick={addLocation} className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium hover:bg-secondary/20">
              <Plus size={12} /> Add Location
            </button>
          </div>
          <div className="space-y-2">
            {locations.map((loc, idx) => (
              <div key={idx} className="border border-border/50 rounded-lg p-3 bg-background/50">
                {editingLocation === idx ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <InlineField label="Name" value={tempLocation.name || ""} onChange={(v) => setTempLocation({ ...tempLocation, name: v })} />
                      <InlineField label="Flag Emoji" value={tempLocation.flag || ""} onChange={(v) => setTempLocation({ ...tempLocation, flag: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InlineField label="Latitude" value={String(tempLocation.lat || 0)} onChange={(v) => setTempLocation({ ...tempLocation, lat: parseFloat(v) || 0 })} />
                      <InlineField label="Longitude" value={String(tempLocation.lng || 0)} onChange={(v) => setTempLocation({ ...tempLocation, lng: parseFloat(v) || 0 })} />
                    </div>
                    <InlineField label="Clients" value={tempLocation.clients || ""} onChange={(v) => setTempLocation({ ...tempLocation, clients: v })} />
                    <InlineField label="Landmark" value={tempLocation.landmark || ""} onChange={(v) => setTempLocation({ ...tempLocation, landmark: v })} />
                    <RichField label="Description" value={tempLocation.description || ""} onChange={(v) => setTempLocation({ ...tempLocation, description: v })} />
                    <div className="flex gap-2">
                      <button onClick={saveLocationEdit} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs"><Check size={12} /> Done</button>
                      <button onClick={() => setEditingLocation(null)} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{loc.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">{loc.clients}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingLocation(idx); setTempLocation(loc); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                      <button onClick={() => deleteLocation(idx)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={saveLocations} disabled={saving === "locations"}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 mt-3">
            <Save size={14} /> {saving === "locations" ? "Saving..." : "Save Locations"}
          </button>
        </div>
      </SectionBlock>

      {/* ─── TESTIMONIALS ─── */}
      <SectionBlock title="Testimonials" icon={Star}>
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Testimonials ({testimonials.length})</span>
            <button onClick={addTestimonial} className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium hover:bg-secondary/20">
              <Plus size={12} /> Add Testimonial
            </button>
          </div>
          <div className="space-y-2">
            {testimonials.map((t) => (
              <div key={t.id} className="border border-border/50 rounded-lg p-3 bg-background/50">
                {editingTestimonial === t.id ? (
                  <div className="space-y-2">
                    <div className="grid sm:grid-cols-3 gap-2">
                      <InlineField label="Name" value={tempTestimonial.name || ""} onChange={(v) => setTempTestimonial({ ...tempTestimonial, name: v })} />
                      <InlineField label="Company" value={tempTestimonial.company || ""} onChange={(v) => setTempTestimonial({ ...tempTestimonial, company: v })} />
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</label>
                        <select value={tempTestimonial.rating || 5} onChange={(e) => setTempTestimonial({ ...tempTestimonial, rating: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm">
                          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                      </div>
                    </div>
                    <InlineField label="Avatar URL" value={tempTestimonial.avatar_url || ""} onChange={(v) => setTempTestimonial({ ...tempTestimonial, avatar_url: v })} />
                    <RichField label="Message" value={tempTestimonial.message || ""} onChange={(v) => setTempTestimonial({ ...tempTestimonial, message: v })} />
                    <div className="flex gap-2">
                      <button onClick={saveTestimonial} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs"><Check size={12} /> Save</button>
                      <button onClick={() => setEditingTestimonial(null)} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <img src={t.avatar_url || ""} alt={t.name} className="w-10 h-10 rounded-full bg-muted shrink-0 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{t.name} <span className="text-muted-foreground font-normal">— {t.company}</span></div>
                      <div className="text-xs text-muted-foreground truncate">{t.message}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingTestimonial(t.id); setTempTestimonial(t); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                      <button onClick={() => toggleVisibility("testimonials", t.id, t.is_visible, setTestimonials)}
                        className={`p-1.5 rounded hover:bg-muted ${t.is_visible ? "text-secondary" : "text-muted-foreground"}`}>
                        {t.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => deleteItem("testimonials", t.id, setTestimonials)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* ─── CAREERS ─── */}
      <SectionBlock title="Career Openings" icon={Briefcase}>
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Jobs ({careers.length})</span>
            <button onClick={addCareer} className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium hover:bg-secondary/20">
              <Plus size={12} /> Add Job
            </button>
          </div>
          <div className="space-y-2">
            {careers.map((j) => (
              <div key={j.id} className="border border-border/50 rounded-lg p-3 bg-background/50">
                {editingCareer === j.id ? (
                  <div className="space-y-2">
                    <div className="grid sm:grid-cols-3 gap-2">
                      <InlineField label="Title" value={tempCareer.title || ""} onChange={(v) => setTempCareer({ ...tempCareer, title: v })} />
                      <InlineField label="Location" value={tempCareer.location || ""} onChange={(v) => setTempCareer({ ...tempCareer, location: v })} />
                      <InlineField label="Job Type" value={tempCareer.job_type || ""} onChange={(v) => setTempCareer({ ...tempCareer, job_type: v })} />
                    </div>
                    <RichField label="Description" value={tempCareer.description || ""} onChange={(v) => setTempCareer({ ...tempCareer, description: v })} />
                    <div className="flex gap-2">
                      <button onClick={saveCareer} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs"><Check size={12} /> Save</button>
                      <button onClick={() => setEditingCareer(null)} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{j.title}</div>
                      <div className="text-xs text-muted-foreground">{j.location} · {j.job_type}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingCareer(j.id); setTempCareer(j); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Edit2 size={14} /></button>
                      <button onClick={() => toggleVisibility("career_jobs", j.id, j.is_visible, setCareers)}
                        className={`p-1.5 rounded hover:bg-muted ${j.is_visible ? "text-secondary" : "text-muted-foreground"}`}>
                        {j.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => deleteItem("career_jobs", j.id, setCareers)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* ─── CONTACT ─── */}
      <SectionBlock title="Contact Information" icon={Phone}>
        <div className="space-y-3 pt-4">
          <InlineField label="Section Title" value={siteContent.contact?.title || ""} onChange={(v) => updateContent("contact", "title", v)} />
          <RichField label="Subtitle" value={siteContent.contact?.subtitle || ""} onChange={(v) => updateContent("contact", "subtitle", v)} />
          <div className="grid sm:grid-cols-2 gap-3">
            <InlineField label="Address" value={siteContent.contact?.address || ""} onChange={(v) => updateContent("contact", "address", v)} multiline />
            <InlineField label="Email" value={siteContent.contact?.email || ""} onChange={(v) => updateContent("contact", "email", v)} />
            <InlineField label="Phone" value={siteContent.contact?.phone || ""} onChange={(v) => updateContent("contact", "phone", v)} />
            <InlineField label="Hours" value={siteContent.contact?.hours || ""} onChange={(v) => updateContent("contact", "hours", v)} multiline />
          </div>
          <button onClick={() => saveSection("contact")} disabled={saving === "contact"}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Save size={14} /> {saving === "contact" ? "Saving..." : "Save Contact"}
          </button>
        </div>
      </SectionBlock>

      {/* ─── FOOTER ─── */}
      <SectionBlock title="Footer" icon={FileText}>
        <div className="space-y-3 pt-4">
          <InlineField label="Copyright Text" value={siteContent.footer?.copyright || ""} onChange={(v) => updateContent("footer", "copyright", v)} />
          <RichField label="Tagline" value={siteContent.footer?.tagline || ""} onChange={(v) => updateContent("footer", "tagline", v)} />
          <button onClick={() => saveSection("footer")} disabled={saving === "footer"}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Save size={14} /> {saving === "footer" ? "Saving..." : "Save Footer"}
          </button>
        </div>
      </SectionBlock>
    </div>
  );
};

export default PageEditor;
