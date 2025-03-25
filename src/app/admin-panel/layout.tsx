// app/admin-panel/layout.tsx
import { ReactNode } from "react";
import NavBarAdmin from "@/app/components/NavBarAdmin"; // Ajusta la ruta según corresponda
import FooterAdmin from "@/app/components/FooterAdmin"; // Ajusta la ruta según corresponda

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <NavBarAdmin /> */}
      <main className="flex-grow">{children}</main>
      {/* <FooterAdmin /> */}
    </div>
  );
}
