import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ClientsSection from "@/components/ClientsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CareersSection from "@/components/CareersSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollProgress from "@/components/ScrollProgress";
import CookieConsent from "@/components/CookieConsent";
import GuidedTour from "@/components/GuidedTour";
import WorldMap from "@/components/WorldMap";
import UICustomizer from "@/components/UICustomizer";
import ScrollToTop from "@/components/ScrollToTop";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  useSiteSettings(); // Apply admin settings globally for all visitors

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Header />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ClientsSection />
      <WorldMap />
      <TestimonialsSection />
      <CareersSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
      <UICustomizer />
      <ScrollToTop />
      <CookieConsent />
      <GuidedTour />
    </div>
  );
};

export default Index;
