import { Facebook, Twitter, Linkedin, Instagram, Building2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSiteContent } from "@/hooks/useSiteContent";

const Footer = () => {
  const content = useSiteContent("footer");

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Associated Companies */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="font-heading font-semibold text-lg text-center mb-8 text-primary-foreground/70">
            Associated Companies
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a
              href="https://bsyssolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl border border-primary-foreground/10 hover:border-secondary/40 transition-all group text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 size={18} className="text-secondary" />
                <h4 className="font-heading font-bold text-lg group-hover:text-secondary transition-colors">
                  Brilliant Systems Solutions
                </h4>
              </div>
              <p className="text-primary-foreground/50 text-sm mt-2">
                Private Limited — Our sister company delivering innovative IT solutions.
              </p>
            </a>
            <a
              href="#"
              className="p-6 rounded-xl border border-primary-foreground/10 hover:border-secondary/40 transition-all group text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 size={18} className="text-secondary" />
                <h4 className="font-heading font-bold text-lg group-hover:text-secondary transition-colors">
                  Our Bhutan Company
                </h4>
              </div>
              <p className="text-primary-foreground/50 text-sm mt-2">
                Expanding our reach with world-class solutions in Bhutan.
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Systems Solutions" className="h-8 w-8" />
              <span className="font-heading font-bold text-lg">Systems Solutions</span>
            </div>
            <p className="text-primary-foreground/50 text-sm leading-relaxed">
              {content.tagline || "Leading IT consulting and software development company delivering cutting-edge technology solutions."}
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/50">
              {["Software Development", "Web Development", "Mobile Apps", "ERP Systems", "IT Consulting"].map((s) => (
                <li key={s}><a href="#services" className="hover:text-secondary transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/50">
              {["About Us", "Careers", "Portfolio", "Contact"].map((s) => (
                <li key={s}><a href={`#${s.toLowerCase().replace(/\s/g, "")}`} className="hover:text-secondary transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/50">
              <li>Alia Building, 7th Floor</li>
              <li>Gandhakoalhi Magu, Malé</li>
              <li className="text-secondary">info@solutions.com.mv</li>
              <li>+960 301-1355</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-sm text-primary-foreground/40">
          {content.copyright || `© ${new Date().getFullYear()} Systems Solutions Pvt Ltd. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
