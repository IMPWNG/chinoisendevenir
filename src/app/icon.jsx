import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

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
          background: "#e63946",
          color: "#f8f9fa",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        C
      </div>
    ),
    { ...size },
  );
}
