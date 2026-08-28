import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const alt = `${SITE.name} — accompagnement pour étudier en Chine`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#1d3557",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "#e63946",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#e63946",
              color: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            C
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#f8f9fa",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          {SITE.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            color: "#f8f9fa",
            opacity: 0.9,
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          {SITE.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            color: "#e63946",
            fontWeight: 600,
          }}
        >
          chinoisendevenir.com
        </div>
      </div>
    ),
    { ...size },
  );
}
