"use client";

import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDailyReport from "@/views/AdminDailyReport";

export default function AdminRapportPage() {
  return (
    <ProtectedRoute requireFull>
      <Suspense fallback={<div className="p-10 text-center text-slate-300">…</div>}>
        <AdminDailyReport />
      </Suspense>
    </ProtectedRoute>
  );
}
