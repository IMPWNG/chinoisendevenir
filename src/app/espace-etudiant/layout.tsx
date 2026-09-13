import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Espace étudiant",
  robots: { index: false, follow: false },
};

export default function StudentSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
