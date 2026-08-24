import { AdminI18nProvider } from "@/context/AdminI18nContext";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminI18nProvider>{children}</AdminI18nProvider>;
}
