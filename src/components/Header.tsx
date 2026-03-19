import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, ExternalLink, Sun, Moon } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section detection via IntersectionObserver
  useEffect(() => {
    const sectionIds = navItems.map((n) => n.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(`#${id}`);
        },
        { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/90 backdrop-blur-xl shadow-lg border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container-wide flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-20">
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="Systems Solutions" className="h-10 w-10" />
          <span className={`font-heading font-bold text-xl ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
            Systems<span className="gradient-text"> Solutions</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                scrolled
                  ? activeSection === item.href
                    ? "text-secondary bg-secondary/10"
                    : "text-foreground hover:text-secondary hover:bg-muted"
                  : activeSection === item.href
                    ? "text-secondary bg-secondary/20"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {item.label}
              {activeSection === item.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`ml-1 p-2.5 rounded-lg transition-colors ${
              scrolled
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
            }`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <a
            href="https://demo.hrmetrics.in"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-4 py-2.5 border border-secondary text-secondary rounded-lg font-semibold text-sm hover:bg-secondary hover:text-secondary-foreground transition-all flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> Get Access
          </a>
          <a
            href="/admin/login"
            className={`ml-1 p-2.5 rounded-lg transition-colors ${
              scrolled
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
            }`}
            title="Admin Panel"
          >
            <Shield size={18} />
          </a>
          <button
            onClick={() => scrollTo("#contact")}
            className="ml-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-lg ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className={`text-left px-4 py-3 rounded-lg font-medium ${
                    activeSection === item.href
                      ? "text-secondary bg-secondary/10"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href="https://demo.hrmetrics.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-secondary hover:bg-muted font-medium"
              >
                <ExternalLink size={16} /> Get Access
              </a>
              <a
                href="/admin/login"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted font-medium"
              >
                <Shield size={16} /> Admin Panel
              </a>
              <button
                onClick={() => scrollTo("#contact")}
                className="mt-2 px-5 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold"
              >
                Get Started
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
