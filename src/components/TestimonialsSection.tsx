import { useState, useEffect } from "react";
import AnimatedSection from "./AnimatedSection";
import ViewToggle from "./ViewToggle";
import { Star, Quote, ChevronLeft, ChevronRight, Grid3X3, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ahmedImg from "@/assets/testimonial-ahmed.jpg";
import fatimaImg from "@/assets/testimonial-fatima.jpg";
import dorjiImg from "@/assets/testimonial-dorji.jpg";

const fallbackTestimonials = [
  { id: "1", name: "Ahmed Rasheed", company: "OBLU Resorts", message: "Systems Solutions delivered an exceptional ERP system that streamlined our resort operations. Their team's expertise and dedication exceeded our expectations.", avatar_url: ahmedImg, rating: 5 },
  { id: "2", name: "Fatima Ibrahim", company: "Maldives Stock Exchange", message: "The web platform they built for us handles high-traffic seamlessly. Professional, responsive, and truly world-class development team.", avatar_url: fatimaImg, rating: 5 },
  { id: "3", name: "Dorji Tshering", company: "RCSC Bhutan", message: "Outstanding HR & Payroll solution that transformed how we manage our workforce. The system is intuitive, reliable, and exactly what we needed.", avatar_url: dorjiImg, rating: 5 },
];

const CARDS_PER_PAGE = 3;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [currentPage, setCurrentPage] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<"grid" | "list">("list");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_visible", true).order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const avatarMap: Record<string, string> = { "Ahmed Rasheed": ahmedImg, "Fatima Ibrahim": fatimaImg, "Dorji Tshering": dorjiImg };
        setTestimonials(data.map((t) => ({
          id: t.id, name: t.name, company: t.company, message: t.message,
          avatar_url: avatarMap[t.name] || t.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`,
          rating: t.rating,
        })));
      }
    };
    load();
  }, []);

  // Preload images to prevent flash
  useEffect(() => {
    testimonials.forEach((t) => {
      const img = new Image();
      img.onload = () => setImagesLoaded((prev) => ({ ...prev, [t.id]: true }));
      img.src = t.avatar_url;
    });
  }, [testimonials]);

  const totalPages = Math.ceil(testimonials.length / CARDS_PER_PAGE);
  const hasSlider = testimonials.length > CARDS_PER_PAGE;
  const currentCards = testimonials.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);

  const goTo = (page: number) => {
    setCurrentPage(((page % totalPages) + totalPages) % totalPages);
  };

  const TestimonialCardVertical = ({ t }: { t: typeof testimonials[0] }) => (
    <div className="glass-card p-6 flex flex-col sm:flex-row gap-5 items-start hover:glow-effect transition-all duration-300">
      <div className="flex flex-col items-center shrink-0 sm:w-24">
        <div className="w-16 h-16 rounded-full border-4 border-secondary/20 shadow-xl overflow-hidden bg-muted">
          {imagesLoaded[t.id] !== false && (
            <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="font-heading font-semibold text-foreground text-sm text-center mt-2">{t.name}</div>
        <div className="text-muted-foreground text-xs text-center">{t.company}</div>
        <div className="flex gap-0.5 mt-1.5">
          {Array.from({ length: t.rating }).map((_, j) => (
            <Star key={j} size={12} className="fill-secondary text-secondary" />
          ))}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <Quote size={18} className="text-secondary/30 mb-2" />
        <p className="text-foreground/80 text-sm leading-relaxed">"{t.message}"</p>
      </div>
    </div>
  );

  const TestimonialCardGrid = ({ t }: { t: typeof testimonials[0] }) => (
    <div className="glass-card p-5 flex flex-col items-center text-center hover:glow-effect transition-all duration-300"
      style={{ minHeight: "220px", maxWidth: "260px", width: "100%" }}
    >
      <div className="w-14 h-14 rounded-full border-3 border-secondary/20 shadow-lg overflow-hidden bg-muted mb-3">
        {imagesLoaded[t.id] !== false && (
          <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="font-heading font-semibold text-foreground text-sm">{t.name}</div>
      <div className="text-muted-foreground text-xs mb-2">{t.company}</div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} size={10} className="fill-secondary text-secondary" />
        ))}
      </div>
      <p className="text-foreground/70 text-xs leading-relaxed line-clamp-4">"{t.message}"</p>
    </div>
  );

  return (
    <section className="section-padding section-alt">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-14">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <div className="flex justify-center mt-4">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </AnimatedSection>

        {view === "list" ? (
          /* Vertical list layout - 3 cards per page */
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-5">
              {currentCards.map((t) => (
                <TestimonialCardVertical key={t.id} t={t} />
              ))}
            </div>

            {hasSlider && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button onClick={() => goTo(currentPage - 1)}
                  className="p-2 rounded-full bg-muted hover:bg-secondary/20 transition-colors text-foreground">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentPage ? "bg-secondary scale-125" : "bg-muted-foreground/30"}`} />
                  ))}
                </div>
                <button onClick={() => goTo(currentPage + 1)}
                  className="p-2 rounded-full bg-muted hover:bg-secondary/20 transition-colors text-foreground">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Grid view - compact ID-card style */
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
              {testimonials.map((t) => (
                <TestimonialCardGrid key={t.id} t={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
