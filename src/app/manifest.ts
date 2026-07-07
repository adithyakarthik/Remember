import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tag It — you find it, just tag it",
    short_name: "Tag It",
    description: "Tag shops and items you spot so you can find your way back to buy them later.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7f2",
    theme_color: "#ff5e7e",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
