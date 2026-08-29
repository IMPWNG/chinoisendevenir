"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { StudentAuthProvider } from "@/context/AuthContext";

export default function Providers({ children }) {
  return (
    <AdminAuthProvider>
      <StudentAuthProvider>{children}</StudentAuthProvider>
    </AdminAuthProvider>
  );
}
