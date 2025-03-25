"use client";
import Link from "next/link";
import Image from "next/image";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

export default function AdminPanel() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBarAdmin />
      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Bienvenido, Administrador
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Gestión de Categorías
            </h3>
            <p className="text-gray-600 mb-4">
              Gestiona, crea, edita o elimina categorías.
            </p>
            <Link
              href="/admin-panel/categorias"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Categorías
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Gestión de Productos
            </h3>
            <p className="text-gray-600 mb-4">
              Gestiona, crea, edita o elimina productos.
            </p>
            <Link
              href="/admin-panel/productos"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Productos
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Gestión de Pedidos
            </h3>
            <p className="text-gray-600 mb-4">
              Gestiona, confirma, cancela o elimina pedidos.
            </p>
            <Link
              href="/admin-panel/pedidos"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Pedidos
            </Link>
          </div>
           {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
             <h3 className="text-xl font-bold text-gray-700 mb-2">
              Gestión de Toppings
            </h3>
            <p className="text-gray-600 mb-4">
              Controla la disponibilidad y precios de los distintos toppings.
            </p>
            <Link
              href="/admin-panel/toppings"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Toppings
            </Link>  */}

          {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Gestión de Extras
            </h3>
            <p className="text-gray-600 mb-4">
              Controla la disponibilidad y precios de los distintos extras.
            </p>
            <Link
              href="/admin-panel/extras"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Extras
            </Link> 
          </div> */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Configuración General
            </h3>
            <p className="text-gray-600 mb-4">
              Ajusta parámetros y opciones de la aplicación.
            </p>
            <Link
              href="/admin-panel/configuracion"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Configuración
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Informacion General
            </h3>
            <p className="text-gray-600 mb-4">
              Informacion sobre los distintos modulos de la aplicación.
            </p>
            <Link
              href="/admin-panel/informacion"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ir a Informacion
            </Link>
          </div>
        </div>
      </main>
      <FooterAdmin />
    </div>
  );
}
