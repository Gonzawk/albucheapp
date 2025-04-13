"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { DarkModeContext } from "@/app/context/DarkModeContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

export default function AdminPanel() {
  const { token, tokenPayload } = useContext(AuthContext);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Verifica autorización: si el tokenPayload no existe o no es Admin/Superadmin, redirige al login
  useEffect(() => {
    if (!tokenPayload || (tokenPayload.role !== "Admin" && tokenPayload.role !== "Superadmin")) {
      router.push("/login");
    }
  }, [tokenPayload, router]);

  // Consulta la configuración del usuario (UserSettings) solo en /admin-panel
  useEffect(() => {
    if (token && tokenPayload) {
      const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      if (!userId) {
        console.error("No se encontró el ID de usuario en el token.");
        return;
      }
      const endpoint = `${apiUrl}/api/UserSettings/${userId}`;
      console.log("Consultando configuración de usuario en:", endpoint);
      fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          console.log("Respuesta del endpoint UserSettings, estado:", res.status);
          if (!res.ok) throw new Error(`Error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          console.log("Configuración recibida:", data);
          // Se espera que data tenga la propiedad isDarkMode
          setDarkMode(data.isDarkMode);
        })
        .catch((error) => {
          console.error("Error al obtener la configuración del usuario:", error);
          // Si falla, se establece modo claro por defecto
          setDarkMode(false);
        });
    } else {
      console.error("Token no disponible, no se consulta configuración de usuario.");
    }
  }, [token, tokenPayload, apiUrl, setDarkMode]);

  // Aplica la clase "dark" al elemento raíz según el estado del dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (!tokenPayload) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Verificando autorización...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <NavBarAdmin />
      {/* Header con imagen de portada */}
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg" // Asegúrate de que esta imagen esté en public/img
          alt="Panel de Administración"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">Administración</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Gestión de Categorías */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Gestión de Categorías
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Gestiona, crea, edita o elimina categorías.
            </p>
            <Link
              href="/admin-panel/categorias"
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
            >
              Ir a Categorías
            </Link>
          </div>
          {/* Card 2: Gestión de Productos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Gestión de Productos
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Gestiona, crea, edita o elimina productos.
            </p>
            <Link
              href="/admin-panel/productos"
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
            >
              Ir a Productos
            </Link>
          </div>
          {/* Card 3: Gestión de Pedidos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Gestión de Pedidos
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Gestiona, confirma, cancela o elimina pedidos.
            </p>
            <Link
              href="/admin-panel/pedidos"
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
            >
              Ir a Pedidos
            </Link>
          </div>
          {/* Card 4: Configuración General */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Configuración General
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ajusta parámetros y opciones de la aplicación.
            </p>
            <Link
              href="/admin-panel/configuracion"
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
            >
              Ir a Configuración
            </Link>
          </div>
          {/* Card 5: Administracion Deliverys */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Administracion de Repartidores
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Modulo de administracion de los repartidores para envios.
            </p>
            <Link
              href="/admin-panel/deliverys"
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
            >
              Ir a Repartidores
            </Link>
          </div> */}
          {/* Card 6: Información General */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Información General
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Información sobre los distintos módulos de la aplicación.
            </p>
            <Link
              href="/admin-panel/informacion"
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
            >
              Ir a Información
            </Link>
          </div>
        </div>
      </main>
      <FooterAdmin />
    </div>
  );
}
