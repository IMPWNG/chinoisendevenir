"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminEmailsWeek from "@/views/AdminEmailsWeek";

export default function AdminEmailsPage() {
  return (
    <ProtectedRoute>
      <AdminEmailsWeek />
    </ProtectedRoute>
  );
}
