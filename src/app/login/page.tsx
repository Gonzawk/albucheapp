"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSession, setKeepSession] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí implementas la lógica de autenticación.
    // Por ejemplo, puedes llamar a tu API de login.
    try {
      // Ejemplo: await login({ email, password, keepSession });
      // Si es exitoso, redirige a /admin-panel
      console.log("Iniciando sesión con:", { email, password, keepSession });
      // Resetea el error
      setError("");
      // Redireccionar o actualizar el estado según corresponda
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
   
      {/* Imagen superior igual a la de /inicio */}
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/admin-banner.jpg" // O la URL de la imagen de portada
          alt="Imagen de Portada"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </header>

      {/* Formulario de login */}
      <div className="flex flex-grow items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Iniciar Sesión
          </h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-black font-medium mb-2">
                Correo electrónico
              </label>
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-black font-medium mb-2">
                Contraseña
              </label>
              <input 
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="keepSession"
                checked={keepSession}
                onChange={(e) => setKeepSession(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="keepSession" className="text-black text-sm">
                Mantener Sesión Iniciada
              </label>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
          
        </div>
      </div>

    </div>
  );
}
