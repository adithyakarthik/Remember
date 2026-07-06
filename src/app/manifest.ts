import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Remember — shops & finds",
    short_name: "Remember",
    description: "Tag shops and items you spot so you can find your way back to buy them later.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#d97706",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
