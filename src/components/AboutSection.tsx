import AnimatedSection from "./AnimatedSection";
import { useSiteContent } from "@/hooks/useSiteContent";
import aboutIllustration from "@/assets/about-illustration.png";

const cardData = [
  { title: "Our Mission", key: "card_mission" },
  { title: "Our Team", key: "card_team" },
  { title: "Quality First", key: "card_quality" },
  { title: "Global Reach", key: "card_global" },
];

const AboutSection = () => {
  const content = useSiteContent("about");

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Background illustration */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.06] pointer-events-none">
        <img src={aboutIllustration} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <AnimatedSection>
              <span className="text-secondary font-semibold text-sm uppercase tracking-widest">
                About Us
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-6">
                {content.title?.includes("Digital") ? (
                  <>
                    {content.title.split("Digital")[0]}
                    <span className="gradient-text">Digital</span>
                    {content.title.split("Digital")[1]}
                  </>
                ) : (
                  content.title
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {content.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {content.vision}
              </p>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cardData.map((card, i) => (
                <div
                  key={card.title}
                  className="glass-card p-6 hover:glow-effect transition-all duration-300 group relative overflow-hidden"
                >
                  {/* 3D illustration background */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.08] pointer-events-none">
                    <img src={aboutIllustration} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.03] to-transparent group-hover:from-secondary/[0.08] transition-all pointer-events-none rounded-xl" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                      <span className="text-secondary font-bold text-sm">{(i + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {content[card.key] || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
