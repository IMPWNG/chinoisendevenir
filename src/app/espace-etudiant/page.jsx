"use client";

import StudentProtectedRoute from "@/components/StudentProtectedRoute";
import StudentDashboard from "@/views/StudentDashboard";

export default function StudentSpacePage() {
  return (
    <StudentProtectedRoute>
      <StudentDashboard />
    </StudentProtectedRoute>
  );
}
