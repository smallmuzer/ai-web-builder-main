import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const FONT_MAP: Record<string, string> = {
  "Inter": "'Inter', sans-serif",
  "DM Sans": "'DM Sans', sans-serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
  "Outfit": "'Outfit', sans-serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', sans-serif",
  "Roboto": "'Roboto', sans-serif",
  "Open Sans": "'Open Sans', sans-serif",
  "Montserrat": "'Montserrat', sans-serif",
  "Lato": "'Lato', sans-serif",
  "Poppins": "'Poppins', sans-serif",
  "Nunito": "'Nunito', sans-serif",
  "Raleway": "'Raleway', sans-serif",
};

const FONT_SIZE_MAP: Record<string, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
  "x-large": "20px",
};

function applySettings(settings: Record<string, string>) {
  const theme = settings.theme || "light";
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // auto — follow system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  const fontSize = FONT_SIZE_MAP[settings.font_size || "medium"] || "16px";
  document.documentElement.style.fontSize = fontSize;

  const fontFamily = FONT_MAP[settings.font_style] || FONT_MAP[settings.default_font] || "";
  if (fontFamily) {
    document.documentElement.style.setProperty("--font-body", fontFamily);
    document.body.style.fontFamily = fontFamily;
  }
}

export function useSiteSettings() {
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "settings")
        .maybeSingle();
      if (data?.content) {
        applySettings(data.content as Record<string, string>);
      }
    };
    load();

    const channel = supabase
      .channel("site_settings_global")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, (payload: any) => {
        if (payload.new?.section_key === "settings") {
          applySettings((payload.new.content || {}) as Record<string, string>);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
