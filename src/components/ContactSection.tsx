import { useState } from "react";
import AnimatedSection from "./AnimatedSection";
import { MapPin, Mail, Phone, Clock, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import contactIllustration from "@/assets/contact-illustration.png";

const ContactSection = () => {
  const content = useSiteContent("contact");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert({
      full_name: form.name,
      company_name: form.company || null,
      email: form.email,
      phone: form.phone || null,
      message: form.message,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("Rate limit")
        ? "Too many submissions. Please try again later."
        : "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Message sent successfully! We'll get back to you shortly.");
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const contactItems = [
    { icon: MapPin, label: "Office Address", value: content.address || "Alia Building, 7th Floor\nGandhakoalhi Magu\nMalé, Maldives" },
    { icon: Mail, label: "Email", value: content.email || "info@solutions.com.mv" },
    { icon: Phone, label: "Phone", value: content.phone || "+960 301-1355" },
    { icon: Clock, label: "Business Hours", value: content.hours || "Sun–Thu: 9AM–6PM\nSat: 9AM–1PM" },
  ];

  return (
    <section id="contact" className="section-padding section-alt relative overflow-hidden">
      {/* 3D illustration background */}
      <div className="absolute top-10 right-0 w-80 h-80 opacity-[0.05] pointer-events-none">
        <img src={contactIllustration} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container-wide relative z-10">
        <AnimatedSection className="text-center mb-14">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">
            Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            {content.title?.includes("Touch") ? (
              <>Get In <span className="gradient-text">Touch</span></>
            ) : (
              content.title
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </AnimatedSection>

        {/* Equal height side-by-side layout */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Left: Office Info */}
          <AnimatedSection className="h-full">
            <div className="glass-card p-8 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.06] pointer-events-none">
                <img src={contactIllustration} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="relative z-10">
                <h3 className="font-heading font-semibold text-foreground text-lg mb-6">Office Information</h3>
                <div className="space-y-5">
                  {contactItems.map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                        <item.icon size={18} className="text-secondary" />
                      </div>
                      <div>
                        <div className="font-heading font-semibold text-foreground text-sm">{item.label}</div>
                        <div className="text-muted-foreground text-sm whitespace-pre-line mt-0.5">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-border/50 relative z-10">
                <p className="text-muted-foreground text-xs">
                  We respond within 24 hours on business days.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Contact Form */}
          <AnimatedSection delay={0.2} className="h-full">
            {submitted ? (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
                <CheckCircle size={48} className="text-secondary mx-auto mb-4" />
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">Thank You!</h3>
                <p className="text-muted-foreground">We've received your message and will get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", company: "", email: "", phone: "", message: "" }); }} className="mt-6 text-secondary font-medium text-sm hover:underline">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-8 h-full flex flex-col">
                <h3 className="font-heading font-semibold text-foreground text-lg mb-5">Send a Message</h3>
                <div className="space-y-4 flex-1">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="Your name" maxLength={100} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Company</label>
                      <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="Your company" maxLength={100} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Email *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="you@email.com" maxLength={255} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                        placeholder="+960 XXX-XXXX" maxLength={20} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Message *</label>
                    <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={3}
                      className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Tell us about your project..." maxLength={1000} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity glow-effect disabled:opacity-50 mt-4">
                  <Send size={16} /> {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
