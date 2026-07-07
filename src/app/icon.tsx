import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Tag It app icon: white tilted price-tag on the "Sunset Pop" gradient.
// Built from divs (not inline SVG) so it renders reliably in Satori.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF9F45, #FF5E7E 55%, #E23670)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 250,
            height: 250,
            borderRadius: 66,
            background: "#fff",
            transform: "rotate(45deg)",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 52,
              top: 52,
              width: 46,
              height: 46,
              borderRadius: 999,
              background: "rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
