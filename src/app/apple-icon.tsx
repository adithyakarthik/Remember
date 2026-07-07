import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Tag It home-screen icon for iOS.
export default function AppleIcon() {
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
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "#fff",
            transform: "rotate(45deg)",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              width: 17,
              height: 17,
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
