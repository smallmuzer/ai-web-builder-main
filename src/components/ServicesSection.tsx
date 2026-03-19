import { useState, useEffect } from "react";
import AnimatedSection from "./AnimatedSection";
import ViewToggle from "./ViewToggle";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import servicesIllustration from "@/assets/services-illustration.png";

type Service = Tables<"services">;

const TEXT_LIMIT = 120;

const ServiceCard = ({ service, onClick }: { service: Service; onClick: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const needsReadMore = service.description.length > TEXT_LIMIT;
  const displayText = expanded ? service.description : service.description.slice(0, TEXT_LIMIT);

  return (
    <div
      className="glass-card p-6 flex flex-col group hover:glow-effect transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3D illustration bg */}
      <div className="absolute -bottom-6 -right-6 w-28 h-28 opacity-[0.06] pointer-events-none rotate-12 group-hover:opacity-[0.1] transition-opacity">
        <img src={servicesIllustration} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.03] to-transparent group-hover:from-secondary/[0.08] transition-all pointer-events-none rounded-xl" />
      <div className="relative z-10 flex flex-col flex-1">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
          <img src={servicesIllustration} alt="" className="w-6 h-6 object-contain opacity-70" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{service.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
          {displayText}{!expanded && needsReadMore && "..."}
        </p>
        {needsReadMore && !expanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            className="text-secondary text-xs font-medium mt-2 hover:underline self-start"
          >
            Read More
          </button>
        )}
        {expanded && needsReadMore && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="text-secondary text-xs font-medium mt-2 hover:underline self-start"
          >
            Show Less
          </button>
        )}
        {/* Hover: show learn more icon */}
        <div className={`mt-3 flex items-center justify-end transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all"
            title="Learn More"
          >
            <ArrowRight size={14} className="text-secondary group-hover:text-inherit" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [services, setServices] = useState<Service[]>([]);
  const content = useSiteContent("services");
  const scrollTo = () => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (data) setServices(data);
    };
    load();

    const channel = supabase
      .channel("services_section")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section id="services" className="section-padding section-alt relative overflow-hidden">
      {/* Background illustration */}
      <div className="absolute top-10 left-0 w-64 h-64 opacity-[0.04] pointer-events-none">
        <img src={servicesIllustration} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container-wide relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Our Services</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            {content.title?.includes("&") ? (
              <>
                {content.title.split("&")[0]}& <span className="gradient-text">{content.title.split("& ")[1]}</span>
              </>
            ) : (
              content.title
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            {content.subtitle}
          </p>
          <div className="flex justify-center">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </AnimatedSection>

        {view === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <AnimatedSection key={service.id} delay={i * 0.05}>
                <ServiceCard service={service} onClick={scrollTo} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service, i) => (
              <AnimatedSection key={service.id} delay={i * 0.03}>
                <div className="glass-card p-5 flex items-center gap-5 group hover:glow-effect transition-all duration-300 cursor-pointer relative overflow-hidden" onClick={scrollTo}>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/[0.03] to-transparent group-hover:from-secondary/[0.08] transition-all pointer-events-none rounded-xl" />
                  <div className="relative z-10 w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <img src={servicesIllustration} alt="" className="w-5 h-5 object-contain opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <h3 className="font-heading font-semibold text-base text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed truncate">{service.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-secondary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
