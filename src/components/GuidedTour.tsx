import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Navigation, Palette, Layout, Sparkles } from "lucide-react";

const TOUR_KEY = "ss_tour_completed";

const steps = [
  {
    icon: Navigation,
    title: "Easy Navigation",
    description: "Use the top navigation bar to quickly jump between sections. On mobile, tap the menu icon.",
  },
  {
    icon: Palette,
    title: "Customize Your View",
    description: "Click the settings icon in the header to adjust font size, theme, and navigation layout to your preference.",
  },
  {
    icon: Layout,
    title: "Explore Our Services",
    description: "Browse our comprehensive IT services, view client testimonials, and check career opportunities.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Need help? Click the chatbot icon at the bottom right to chat with our virtual assistant anytime.",
  },
];

const GuidedTour = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 3000);
    }
  }, []);

  const close = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else close();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md w-full text-center relative"
        >
          <button onClick={close} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
            <current.icon size={30} className="text-secondary" />
          </div>

          <h3 className="font-heading font-bold text-xl text-foreground mb-2">{current.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{current.description}</p>

          {/* Progress */}
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-secondary" : "bg-border"}`} />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            {step > 0 && (
              <button onClick={prev} className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            {step === 0 && (
              <button onClick={close} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted">
                Skip Tour
              </button>
            )}
            <button onClick={next} className="flex items-center gap-1 px-5 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:opacity-90">
              {step === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuidedTour;
