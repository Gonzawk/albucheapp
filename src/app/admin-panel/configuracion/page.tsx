"use client";
import { useDarkMode } from "@/app/context/DarkModeContext";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Image from "next/image";
import Link from "next/link";

export default function ConfiguracionPanel() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Maneja el toggle y registra en consola el estado antes y después de la actualización
  const handleToggle = async () => {
    console.log("Toggle dark mode, valor actual:", darkMode);
    try {
      await toggleDarkMode();
      console.log("Modo actualizado en DB. Nuevo valor:", !darkMode);
    } catch (error) {
      console.error("Error al togglear dark mode:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />
      {/* Cabecera con imagen */}
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg"
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
      {/* Contenido principal */}
      <div className="flex flex-1 p-6">
        <main className="flex-grow container mx-auto">
          <h2 className="text-2xl font-bold mb-6">Opciones de Configuración</h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Modo Oscuro */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Modo Oscuro</h3>
              <p className="mb-4">
                Activa o desactiva el modo oscuro en la aplicación y guarda el cambio en la base de datos.
              </p>
              {/* Toggle slider personalizado */}
              <div className="flex items-center">
                <span className="mr-3 text-gray-700 dark:text-gray-200">Claro</span>
                <label htmlFor="toggleDarkMode" className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggleDarkMode"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={handleToggle}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-300 
                    peer-checked:bg-blue-600
                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
                <span className="ml-3 text-gray-700 dark:text-gray-200">Oscuro</span>
              </div>
            </div>
            {/* Card 2: Gestión de Usuarios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Gestión de Usuarios</h3>
              <p className="mb-4">
                Administra y configura los usuarios de la aplicación.
              </p>
              <Link
                href="/admin-panel/usuarios"
                className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded transition-colors"
              >
                Administrar Usuarios
              </Link>
            </div>
            {/* Card 3: Horarios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Horarios</h3>
              <p className="mb-4">
                Gestiona el horario de apertura y cierre del menú.
              </p>
              <Link
                href="/admin-panel/horarios"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white text-center py-2 rounded transition-colors"
              >
                Configurar Horarios
              </Link>
            </div>
          </div>
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}
