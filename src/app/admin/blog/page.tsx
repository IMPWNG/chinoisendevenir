"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminBlog from "@/views/AdminBlog";

export default function AdminBlogPage() {
  return (
    <ProtectedRoute requireFull>
      <AdminBlog />
    </ProtectedRoute>
  );
}
