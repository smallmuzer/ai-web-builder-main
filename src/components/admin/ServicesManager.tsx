import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X, RefreshCw, GripVertical } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none";
const textareaCls = `${inputCls} resize-y min-h-[80px] max-h-52 overflow-y-auto`;

const emptyForm = { title: "", description: "", image_url: "" };

const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ ...emptyForm });
  const [newForm, setNewForm] = useState({ ...emptyForm });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order");
    if (data) setServices(data);
    setLoading(false);
  };

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditData({ title: s.title, description: s.description, image_url: s.image_url || "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from("services").update({
      title: editData.title,
      description: editData.description,
      image_url: editData.image_url || null,
    }).eq("id", editingId);
    if (error) { toast.error("Failed to save."); } else {
      setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...editData, image_url: editData.image_url || null } : s));
      toast.success("Service updated!");
      setEditingId(null);
    }
    setSaving(false);
  };

  const toggleVisible = async (id: string, current: boolean) => {
    await supabase.from("services").update({ is_visible: !current }).eq("id", id);
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_visible: !current } : s));
    toast.success(current ? "Service hidden." : "Service visible.");
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error("Failed to delete."); return; }
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success("Service deleted.");
  };

  const addService = async () => {
    if (!newForm.title || !newForm.description) { toast.error("Title and description required."); return; }
    setSaving(true);
    const maxOrder = services.length > 0 ? Math.max(...services.map(s => s.sort_order)) + 1 : 0;
    const { data, error } = await supabase.from("services").insert({
      title: newForm.title,
      description: newForm.description,
      image_url: newForm.image_url || null,
      sort_order: maxOrder,
    }).select().single();
    if (error) { toast.error("Failed to add."); } else if (data) {
      setServices(prev => [...prev, data]);
      setNewForm({ ...emptyForm });
      setAdding(false);
      toast.success("Service added!");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground text-center py-12">Loading services...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage individual service cards shown on your website</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      {adding && (
        <div className="glass-card p-5 mb-4 border-2 border-secondary/30">
          <h3 className="font-heading font-semibold text-foreground mb-4">New Service</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
              <input value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Web Development" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <textarea value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} placeholder="Service description..." className={textareaCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Image URL (optional)</label>
              <input value={newForm.image_url} onChange={e => setNewForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className={inputCls} />
            </div>
            <div className="flex gap-2">
              <button onClick={addService} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-50">
                <Check size={14} /> {saving ? "Saving..." : "Add Service"}
              </button>
              <button onClick={() => { setAdding(false); setNewForm({ ...emptyForm }); }} className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className={`glass-card p-5 ${!service.is_visible ? "opacity-60" : ""}`}>
            {editingId === service.id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                  <input value={editData.title} onChange={e => setEditData(p => ({ ...p, title: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                  <textarea value={editData.description} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} className={textareaCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Image URL</label>
                  <input value={editData.image_url} onChange={e => setEditData(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className={inputCls} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-50">
                    <Check size={14} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <GripVertical size={18} className="text-muted-foreground shrink-0 mt-1" />
                {service.image_url && (
                  <img src={service.image_url} alt={service.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-foreground">{service.title}</h3>
                    {!service.is_visible && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Hidden</span>}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{service.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(service)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => toggleVisible(service.id, service.is_visible)}
                    className={`p-1.5 rounded-lg hover:bg-muted ${service.is_visible ? "text-secondary" : "text-muted-foreground"}`}
                    title={service.is_visible ? "Hide" : "Show"}>
                    {service.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => deleteService(service.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && <p className="text-muted-foreground text-center py-12">No services yet. Add one above.</p>}
      </div>
    </div>
  );
};

export default ServicesManager;
