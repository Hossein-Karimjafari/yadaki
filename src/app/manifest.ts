import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "یدکی | فروشگاه لوازم یدکی خودرو",
    short_name: "یدکی",
    description: "خرید آنلاین لوازم یدکی خودرو با تضمین اصالت",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
