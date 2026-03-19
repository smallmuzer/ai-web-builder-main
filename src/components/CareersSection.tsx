import { useState, useEffect } from "react";
import AnimatedSection from "./AnimatedSection";
import ViewToggle from "./ViewToggle";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import careersIllustration from "@/assets/careers-illustration.png";

const FALLBACK_JOBS = [
  { id: "1", title: "Senior Full Stack Developer", location: "Malé, Maldives", job_type: "Full-time", description: "Build enterprise-grade web applications using modern technologies.", is_visible: true, sort_order: 0, created_at: "", updated_at: "" },
  { id: "2", title: "Mobile App Developer", location: "Remote", job_type: "Full-time", description: "Create cross-platform mobile solutions for our global clients.", is_visible: true, sort_order: 1, created_at: "", updated_at: "" },
  { id: "3", title: "UI/UX Designer", location: "Malé, Maldives", job_type: "Full-time", description: "Design intuitive and beautiful user experiences for enterprise products.", is_visible: true, sort_order: 2, created_at: "", updated_at: "" },
];

const TEXT_LIMIT = 100;

type CareerJob = Tables<"career_jobs">;

const JobCard = ({ job, onClick }: { job: CareerJob; onClick: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const needsReadMore = job.description.length > TEXT_LIMIT;
  const displayText = expanded ? job.description : job.description.slice(0, TEXT_LIMIT);

  return (
    <div className="glass-card p-6 flex flex-col group hover:glow-effect transition-all duration-300 cursor-pointer relative overflow-hidden h-full" onClick={onClick}>
      {/* 3D illustration bg */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-[0.06] pointer-events-none">
        <img src={careersIllustration} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.03] to-transparent group-hover:from-secondary/[0.08] transition-all pointer-events-none rounded-xl" />
      <div className="relative z-10 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-foreground text-base mb-2">{job.title}</h3>
        <p className="text-muted-foreground text-sm flex-1">
          {displayText}{!expanded && needsReadMore && "..."}
        </p>
        {needsReadMore && !expanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            className="text-secondary text-xs font-medium mt-1 hover:underline self-start"
          >
            Read More
          </button>
        )}
        {expanded && needsReadMore && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="text-secondary text-xs font-medium mt-1 hover:underline self-start"
          >
            Show Less
          </button>
        )}
        <div className="flex gap-4 mt-3 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={14} /> {job.location}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={14} /> {job.job_type}
          </span>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity w-full mt-auto">
          <Briefcase size={16} /> Apply Now
        </button>
      </div>
    </div>
  );
};

const CareersSection = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const scrollTo = () => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("career_jobs")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (data && data.length > 0) {
        setJobs(data);
      } else {
        setJobs(FALLBACK_JOBS as CareerJob[]);
      }
    };
    load();

    const channel = supabase
      .channel("careers_section")
      .on("postgres_changes", { event: "*", schema: "public", table: "career_jobs" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (jobs.length === 0) return null;

  return (
    <section id="careers" className="section-padding relative overflow-hidden">
      {/* Background illustration */}
      <div className="absolute bottom-0 right-0 w-72 h-72 opacity-[0.04] pointer-events-none">
        <img src={careersIllustration} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container-wide relative z-10">
        <AnimatedSection className="text-center mb-14">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Careers</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            Join Our <span className="gradient-text">Team</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Be part of a dynamic team building cutting-edge technology solutions for clients worldwide.
          </p>
          <div className="flex justify-center">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </AnimatedSection>

        {view === "grid" ? (
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <AnimatedSection key={job.id} delay={i * 0.1}>
                <JobCard job={job} onClick={scrollTo} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {jobs.map((job, i) => (
              <AnimatedSection key={job.id} delay={i * 0.1}>
                <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:glow-effect transition-all duration-300 group cursor-pointer relative overflow-hidden" onClick={scrollTo}>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/[0.03] to-transparent group-hover:from-secondary/[0.08] transition-all pointer-events-none rounded-xl" />
                  <div className="flex-1 relative z-10">
                    <h3 className="font-heading font-semibold text-foreground text-lg">{job.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{job.description}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={14} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={14} /> {job.job_type}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shrink-0 relative z-10">
                    <Briefcase size={16} /> Apply Now
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CareersSection;
