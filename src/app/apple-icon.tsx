import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

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
          background: "#1d3557",
          color: "#f8f9fa",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 28,
            background: "#e63946",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 88,
            fontWeight: 700,
            color: "#f8f9fa",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size },
  );
}
