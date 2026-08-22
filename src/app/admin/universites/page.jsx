"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminUniversities from "@/views/AdminUniversities";

export default function AdminUniversitiesPage() {
  return (
    <ProtectedRoute>
      <AdminUniversities />
    </ProtectedRoute>
  );
}
