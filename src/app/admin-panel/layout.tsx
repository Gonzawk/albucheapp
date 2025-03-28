"use client";

import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tokenPayload } = useContext(AuthContext);
  const router = useRouter();
  const userRole = tokenPayload?.role;

  useEffect(() => {
    if (!tokenPayload || (userRole !== "Admin" && userRole !== "Superadmin")) {
      router.push("/login");
    }
  }, [tokenPayload, userRole, router]);

  if (!tokenPayload) {
    return <p>Validando acceso...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    {/*   <NavBarAdmin /> */}
      <main className="flex-grow">{children}</main>
     {/*  <FooterAdmin /> */}
    </div>
  );
}
