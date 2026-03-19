import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import heroBgLight from "@/assets/hero-bg-light.jpg";
import heroBgDark from "@/assets/hero-bg-dark.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";

function useCountUp(end: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, end, duration]);
  return count;
}

const HeroSection = () => {
  const content = useSiteContent("hero");
  const [isDark, setIsDark] = useState(false);
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const { ref: statsRef, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const projects = useCountUp(300, 2000, inView);
  const clients = useCountUp(50, 1800, inView);
  const satisfaction = useCountUp(100, 1600, inView);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dynamic theme-based background */}
      <div className="absolute inset-0">
        <img
          src={isDark ? heroBgDark : heroBgLight}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-700"
          key={isDark ? "dark" : "light"}
        />
        <div className="absolute inset-0 hero-bg opacity-70" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 right-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.4), transparent)" }}
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute bottom-32 left-1/3 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(220 60% 50% / 0.3), transparent)" }}
        />
        {/* 3D floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20 - i * 5, 0],
              x: [0, 10 + i * 3, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 4 + i, ease: "easeInOut", delay: i * 0.5 }}
            className="absolute w-2 h-2 rounded-full bg-secondary/30"
            style={{ top: `${20 + i * 12}%`, left: `${10 + i * 15}%` }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(hsl(217 91% 60% / 0.4) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(217 91% 60% / 0.4) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container-wide relative z-10 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-primary-foreground leading-tight mb-6"
          >
            {content.title?.includes("Maldives") ? (
              <>
                {content.title.split("Maldives")[0]}
                <span className="gradient-text">Maldives</span>
              </>
            ) : (
              <span>{content.title}</span>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mb-10 leading-relaxed"
          >
            {content.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => scrollTo("#contact")}
              className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground font-semibold text-sm rounded-lg hover:opacity-90 transition-all glow-effect"
            >
              {content.cta_text || "Get Started"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo("#services")}
              className="inline-flex items-center justify-center px-6 py-2.5 border border-primary-foreground/20 text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary-foreground/10 transition-all backdrop-blur-sm"
            >
              Our Services
            </button>
          </motion.div>
        </div>

        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl"
        >
          {[
            { value: projects, suffix: "+", label: "Projects Completed" },
            { value: clients, suffix: "+", label: "Happy Clients" },
            { value: satisfaction, suffix: "%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="backdrop-blur-md rounded-xl p-3 border border-primary-foreground/10">
              <div className="text-3xl sm:text-4xl font-heading font-bold gradient-text">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-primary-foreground/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
