"use client";
import { useDarkMode } from "@/app/context/DarkModeContext";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Image from "next/image";

export default function ConfiguracionPanel() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/admin-banner.jpg"
          alt="Panel de Administración"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">Configuración General</h1>
        </div>
      </header>
      <div className="flex flex-1 p-6">
        <main className="flex-grow">
          <h2 className="text-2xl font-bold mb-6">Configuración General</h2>
          <p>Aquí puedes ajustar las opciones de la aplicación.</p>
          <button
            onClick={toggleDarkMode}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
          </button>
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}
