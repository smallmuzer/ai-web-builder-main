import { useEffect, useState, useRef, useCallback } from "react";
import AnimatedSection from "./AnimatedSection";
import ViewToggle from "./ViewToggle";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const FALLBACK_CLIENTS = [
  { id: "1", name: "OBLU Resorts", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/OBLU-1-1-300x142.jpeg", is_visible: true, sort_order: 0 },
  { id: "2", name: "OZEN Life", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/Ozen-1-300x156.png", is_visible: true, sort_order: 1 },
  { id: "3", name: "You & Me Maldives", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/You-Me-Maldives-300x258.png", is_visible: true, sort_order: 2 },
  { id: "4", name: "Cocoon Maldives", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/Cocoon-300x140.jpg", is_visible: true, sort_order: 3 },
  { id: "5", name: "Fushifaru", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/Fushifaru.png", is_visible: true, sort_order: 4 },
  { id: "6", name: "Fun Island", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/Fun-Island.png", is_visible: true, sort_order: 5 },
  { id: "7", name: "HDFC Bank", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/HDFC.png", is_visible: true, sort_order: 6 },
  { id: "8", name: "Maldives Stock Exchange", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/Maldives-Stock-Exchange-300x67.jpg", is_visible: true, sort_order: 7 },
  { id: "9", name: "Villa Group", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/Villagrouplogo-1-300x290.png", is_visible: true, sort_order: 8 },
  { id: "10", name: "Alia", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/Alia.png", is_visible: true, sort_order: 9 },
  { id: "11", name: "Mifco", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/Mifco.png", is_visible: true, sort_order: 10 },
  { id: "12", name: "Medianet", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/Medianet.png", is_visible: true, sort_order: 11 },
  { id: "13", name: "ECM", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/ECM.png", is_visible: true, sort_order: 12 },
  { id: "14", name: "RCSC Bhutan", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/03/RCSC-Bhutan.png", is_visible: true, sort_order: 13 },
  { id: "15", name: "FSM", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/FSM-1-300x181.png", is_visible: true, sort_order: 14 },
  { id: "16", name: "Flyme", logo_url: "https://bsyssolutions.com/wp-content/uploads/2023/01/Flyme-1-300x104.png", is_visible: true, sort_order: 15 },
];

type ClientLogo = Tables<"client_logos">;

const SLIDE_INTERVAL = 3000;
const PAUSE_DURATION = 5 * 60 * 1000;

const ClientsSection = () => {
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [paused, setPaused] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("client_logos")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (data && data.length > 0) {
        setClients(data);
      } else {
        setClients(FALLBACK_CLIENTS as ClientLogo[]);
      }
    };
    load();

    const channel = supabase
      .channel("clients_section")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_logos" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // For list view: handle pause on click, resume on focus out
  const handleListClick = useCallback(() => {
    setPaused(true);
    clearTimeout(pauseTimeoutRef.current);
  }, []);

  // Resume when user leaves section
  useEffect(() => {
    if (view !== "list" || !paused) return;
    const section = sectionRef.current;
    if (!section) return;

    const handleLeave = () => {
      setPaused(false);
    };
    section.addEventListener("mouseleave", handleLeave);
    return () => section.removeEventListener("mouseleave", handleLeave);
  }, [view, paused]);

  const doubled = [...clients, ...clients];

  return (
    <section id="portfolio" className="section-padding overflow-hidden" ref={sectionRef}>
      <div className="container-wide">
        <AnimatedSection className="text-center mb-14">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Our Clients</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            Trusted by <span className="gradient-text">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            We're proud to have served over 300+ successful projects for leading companies across the Maldives and beyond.
          </p>
          <div className="flex justify-center">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </AnimatedSection>
      </div>

      {view === "grid" ? (
        /* Grid View — vertical scrollable grid cards */
        <div className="container-wide">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="glass-card p-5 flex flex-col items-center justify-center gap-3 hover:glow-effect hover:scale-105 transition-all duration-300 cursor-pointer aspect-square"
              >
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="max-h-16 max-w-full object-contain"
                  loading="lazy"
                />
                <span className="text-xs text-muted-foreground text-center font-medium leading-tight">{client.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View — horizontal sliding carousel */
        <div className="relative" onClick={handleListClick}>
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div
            className="flex"
            style={{
              animation: paused ? "none" : "marquee 30s linear infinite",
            }}
          >
            {doubled.map((client, i) => (
              <div
                key={`${client.id}-${i}`}
                className="flex-shrink-0 mx-4 w-44 h-24 flex items-center justify-center p-5 rounded-xl border border-border/40 hover:shadow-lg hover:scale-105 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.5))",
                  backdropFilter: "blur(16px)",
                }}
              >
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientsSection;
