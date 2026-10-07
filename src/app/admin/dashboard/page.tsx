"use client";

import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/views/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-10 text-center text-slate-300">…</div>}>
        <AdminDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
