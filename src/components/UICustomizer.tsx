import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Type, Palette, Sun, Moon, Save, GripHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

const COOKIE_KEY = "ss_ui_prefs";

interface UIPrefs {
  fontSize: number;
  fontFamily: string;
  darkMode: boolean;
  accentColor: string;
}

const defaultPrefs: UIPrefs = {
  fontSize: 0,
  fontFamily: "Arial, Helvetica, sans-serif",
  darkMode: false,
  accentColor: "#2db8a0",
};

const fonts = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
];

const accentColors = [
  { label: "Teal", value: "#2db8a0" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
];

function setCookie(name: string, value: string, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function hexToHSL(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const applyPrefs = (prefs: UIPrefs) => {
  document.documentElement.style.fontSize = `${16 + prefs.fontSize}px`;
  document.body.style.fontFamily = prefs.fontFamily;
  document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((el) => {
    (el as HTMLElement).style.fontFamily = prefs.fontFamily;
  });
  if (prefs.darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  const hsl = hexToHSL(prefs.accentColor);
  document.documentElement.style.setProperty("--secondary", hsl);
  document.documentElement.style.setProperty("--accent", hsl);
  document.documentElement.style.setProperty("--ring", hsl);
  document.documentElement.style.setProperty("--glow-color", hsl);
};

const UICustomizer = () => {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<UIPrefs>(() => {
    try {
      const stored = getCookie(COOKIE_KEY);
      return stored ? JSON.parse(stored) : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });
  const [draft, setDraft] = useState<UIPrefs>(prefs);

  // Drag state using pointer events for reliable dragging
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    setPos({
      x: dragOrigin.current.px + (e.clientX - dragOrigin.current.x),
      y: dragOrigin.current.py + (e.clientY - dragOrigin.current.y),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => { applyPrefs(prefs); }, []);
  useEffect(() => { if (open) applyPrefs(draft); }, [draft]);

  const updateDraft = (partial: Partial<UIPrefs>) => setDraft((p) => ({ ...p, ...partial }));

  const save = () => {
    setPrefs(draft);
    setCookie(COOKIE_KEY, JSON.stringify(draft));
    applyPrefs(draft);
    toast.success("Settings saved!");
    setOpen(false);
  };

  const reset = () => {
    setDraft(defaultPrefs);
    setPrefs(defaultPrefs);
    setCookie(COOKIE_KEY, JSON.stringify(defaultPrefs));
    applyPrefs(defaultPrefs);
    toast.success("Reset to defaults!");
  };

  const cancel = () => {
    setDraft(prefs);
    applyPrefs(prefs);
    setOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ rotate: 90 }}
        transition={{ duration: 0.2 }}
        onClick={() => { setOpen(!open); setPos({ x: 0, y: 0 }); }}
        className="fixed top-20 right-4 z-50 w-9 h-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="UI Settings"
      >
        <Settings size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ left: `calc(100% - 18rem - 1rem + ${pos.x}px)`, top: `calc(7rem + ${pos.y}px)` }}
            className="fixed z-50 w-72 glass-card shadow-2xl overflow-hidden"
          >
            {/* Drag Handle — uses pointer events */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-grab active:cursor-grabbing border-b border-border/50 touch-none select-none"
            >
              <div className="flex items-center gap-1.5">
                <GripHorizontal size={14} className="text-muted-foreground" />
                <span className="font-heading font-semibold text-foreground text-xs">Customize</span>
              </div>
              <button onClick={cancel} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>

            <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
              {/* Font Size Slider */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Type size={10} /> Font Size ({draft.fontSize > 0 ? "+" : ""}{draft.fontSize}px)
                </label>
                <Slider
                  value={[draft.fontSize]}
                  onValueChange={([v]) => updateDraft({ fontSize: v })}
                  min={-5}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                  <span>-5px</span><span>0</span><span>+5px</span>
                </div>
              </div>

              {/* Font Family — 2-column grid */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1.5 block">Font Family</label>
                <div className="grid grid-cols-2 gap-1">
                  {fonts.map((f) => (
                    <button
                      key={f.label}
                      onClick={() => updateDraft({ fontFamily: f.value })}
                      className={`px-2 py-1.5 rounded text-[10px] border transition-all text-center ${
                        draft.fontFamily === f.value
                          ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                          : "bg-muted text-muted-foreground border-transparent hover:border-border"
                      }`}
                      style={{ fontFamily: f.value }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Palette size={10} /> Theme
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateDraft({ darkMode: false })}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium border transition-all ${
                      !draft.darkMode ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted text-muted-foreground border-transparent"
                    }`}
                  >
                    <Sun size={12} /> Light
                  </button>
                  <button
                    onClick={() => updateDraft({ darkMode: true })}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium border transition-all ${
                      draft.darkMode ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted text-muted-foreground border-transparent"
                    }`}
                  >
                    <Moon size={12} /> Dark
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Palette size={10} /> Accent
                </label>
                <div className="flex gap-1.5 mb-1.5 flex-wrap">
                  {accentColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateDraft({ accentColor: c.value })}
                      title={c.label}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        draft.accentColor === c.value ? "border-foreground scale-110 shadow-md" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={draft.accentColor}
                    onChange={(e) => updateDraft({ accentColor: e.target.value })}
                    className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-[9px] text-muted-foreground font-mono">{draft.accentColor}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 p-3 border-t border-border/50 bg-muted/30">
              <button
                onClick={reset}
                className="flex-1 px-2 py-2 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground bg-muted border border-transparent hover:border-border transition-all"
              >
                Reset
              </button>
              <button
                onClick={save}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                <Save size={12} /> Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UICustomizer;
