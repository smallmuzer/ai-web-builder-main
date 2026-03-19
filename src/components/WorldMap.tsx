import { useState, useEffect, useRef } from "react";
import AnimatedSection from "./AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createCustomIcon = (isActive: boolean) =>
  L.divIcon({
    className: "custom-map-marker",
    html: `<div style="
      width: ${isActive ? "20px" : "14px"};
      height: ${isActive ? "20px" : "14px"};
      background: hsl(175, 65%, 45%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 20px rgba(45,184,160,0.4);
      transition: all 0.2s;
    "></div>`,
    iconSize: [isActive ? 20 : 14, isActive ? 20 : 14],
    iconAnchor: [isActive ? 10 : 7, isActive ? 10 : 7],
  });

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  clients: string;
  description: string;
  flag: string;
  landmark: string;
}

const DEFAULT_LOCATIONS: LocationData[] = [
  { name: "Malé, Maldives", lat: 4.1755, lng: 73.5093, clients: "HQ — 40+ clients", description: "Our headquarters serving government and private sector clients across the Maldives.", flag: "🇲🇻", landmark: "🏝️ Overwater Villas" },
  { name: "Thimphu, Bhutan", lat: 27.4728, lng: 89.6393, clients: "RCSC Bhutan", description: "Supporting the Royal Civil Service Commission with digital transformation.", flag: "🇧🇹", landmark: "🏯 Tiger's Nest" },
  { name: "Colombo, Sri Lanka", lat: 6.9271, lng: 79.8612, clients: "Regional clients", description: "Expanding our services across the South Asian region.", flag: "🇱🇰", landmark: "🛕 Sigiriya Rock" },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, clients: "Business partners", description: "Strategic partnerships in the Middle East business hub.", flag: "🇦🇪", landmark: "🏗️ Burj Khalifa" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, clients: "Tech partners", description: "Technology partnerships in Southeast Asia's innovation hub.", flag: "🇸🇬", landmark: "🌳 Gardens by the Bay" },
];

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 8, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

const WorldMap = () => {
  const [activeLocation, setActiveLocation] = useState<LocationData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>(DEFAULT_LOCATIONS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "global_presence")
        .maybeSingle();
      if (data?.content) {
        const content = data.content as any;
        if (Array.isArray(content.locations) && content.locations.length > 0) {
          setLocations(content.locations);
        }
      }
    };
    load();

    const channel = supabase
      .channel("global_presence_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content", filter: "section_key=eq.global_presence" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="section-padding overflow-hidden" id="global-reach">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-8">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Global Presence</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            Our <span className="gradient-text">Reach</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Serving clients across Maldives, Bhutan, and beyond.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="flex flex-col lg:flex-row gap-4 max-w-5xl mx-auto">
            <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: "320px", minHeight: "280px" }}>
              <MapContainer
                center={[15, 70]}
                zoom={3}
                minZoom={2}
                maxZoom={18}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <InvalidateSize />
                {activeLocation && <FlyToLocation lat={activeLocation.lat} lng={activeLocation.lng} />}
                {locations.map((loc) => (
                  <Marker
                    key={loc.name}
                    position={[loc.lat, loc.lng]}
                    icon={createCustomIcon(activeLocation?.name === loc.name)}
                    eventHandlers={{ click: () => setActiveLocation(loc) }}
                  >
                    <Popup>
                      <div className="text-sm font-semibold">{loc.flag} {loc.name}</div>
                      <div className="text-xs opacity-70">{loc.clients}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="lg:w-72 grid grid-cols-2 lg:grid-cols-2 gap-2 content-start">
              {locations.map((loc) => (
                <motion.button
                  key={loc.name}
                  onClick={() => setActiveLocation(loc)}
                  whileHover={{ scale: 1.03 }}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border relative overflow-hidden ${
                    activeLocation?.name === loc.name
                      ? "border-secondary shadow-md shadow-secondary/10"
                      : "border-border/40 hover:shadow-md"
                  }`}
                  style={{
                    background: activeLocation?.name === loc.name
                      ? "linear-gradient(135deg, hsl(175 65% 45% / 0.15), hsl(175 65% 45% / 0.05))"
                      : "linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.4))",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{loc.flag}</span>
                      <span className="font-heading font-semibold text-foreground text-xs leading-tight truncate">
                        {loc.name.split(",")[0]}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[10px] leading-snug line-clamp-2">
                      {loc.clients} · {loc.landmark}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {activeLocation && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="mt-4 max-w-5xl mx-auto rounded-xl p-4 border border-border/40"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.5))",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{activeLocation.flag}</div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-foreground text-base flex items-center gap-2">
                      <MapPin size={14} className="text-secondary" />
                      {activeLocation.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={12} /> {activeLocation.clients}</span>
                      <span className="flex items-center gap-1"><Building2 size={12} /> Active Operations</span>
                      <span className="text-secondary/70">{activeLocation.landmark}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{activeLocation.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default WorldMap;
