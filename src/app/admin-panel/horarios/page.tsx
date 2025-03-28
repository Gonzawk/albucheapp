"use client";
import { useEffect, useState, FormEvent } from "react";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Image from "next/image";
import { motion } from "framer-motion";

interface Horario {
  // Se utiliza "HorarioId" en mayúscula para normalizarlo en el frontend
  HorarioId: number;
  HoraApertura: string; // formato "HH:mm" (o "HH:mm:ss" si se requiere)
  HoraCierre: string;
  FechaActualizacion: string;
}

export default function HorariosPanel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [horario, setHorario] = useState<Horario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [horaApertura, setHoraApertura] = useState<string>("");
  const [horaCierre, setHoraCierre] = useState<string>("");

  // Función para obtener el token desde localStorage o cookies
  const getToken = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
      token = match ? match[2] : "";
    }
    console.log("Token obtenido:", token);
    return token;
  };

  // Función que retorna los headers con autorización
  const getAuthHeaders = (isJson: boolean = true) => {
    const token = getToken();
    const headers = {
      ...(isJson && { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
    };
    console.log("Headers enviados:", headers);
    return headers;
  };

  // Función para obtener el horario (se asume que el SP retorna el único registro)
  const fetchHorario = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Horarios`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener el horario");
      const data = await res.json();
      // Normalizamos: se espera que el SP retorne las propiedades con mayúscula, pero controlamos ambas
      const id = data.HorarioId || data.horarioId;
      if (!data || !id) {
        throw new Error("No se encontró el horario con el ID esperado");
      }
      const horarioObtenido: Horario = {
        HorarioId: id,
        HoraApertura: data.HoraApertura || data.horaApertura,
        HoraCierre: data.HoraCierre || data.horaCierre,
        FechaActualizacion: data.FechaActualizacion || data.fechaActualizacion,
      };
      console.log("Horario obtenido:", horarioObtenido);
      setHorario(horarioObtenido);
      setHoraApertura(horarioObtenido.HoraApertura);
      setHoraCierre(horarioObtenido.HoraCierre);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al obtener el horario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorario();
  }, [apiUrl]);

  // Función para actualizar el horario (PUT)
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!horario) return;
    try {
      // Se construye el objeto con las propiedades exactas que espera el DTO:
      const updatedHorario = {
        HorarioId: horario.HorarioId, // Nota: propiedad con mayúscula
        HoraApertura: horaApertura,
        HoraCierre: horaCierre
        // Se omite FechaActualizacion ya que el SP la establece internamente
      };
      console.log("Enviando actualización:", updatedHorario);
      const res = await fetch(`${apiUrl}/api/Horarios/${horario.HorarioId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedHorario),
      });
      if (!res.ok) throw new Error("Error al actualizar el horario");
      const msg = await res.text();
      console.log("Respuesta del update:", msg);
      alert(msg);
      // Vuelve a obtener el horario actualizado
      fetchHorario();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al actualizar el horario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />
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
          <h1 className="text-4xl font-bold text-white">Configuración de Horarios</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-6">
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : horario ? (
          <form onSubmit={handleUpdate} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Hora de Apertura</label>
              <input
                type="time"
                value={horaApertura}
                onChange={(e) => setHoraApertura(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Hora de Cierre</label>
              <input
                type="time"
                value={horaCierre}
                onChange={(e) => setHoraCierre(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg shadow-lg transition-colors"
            >
              Guardar cambios
            </motion.button>
          </form>
        ) : (
          <p className="text-center">No se encontró el horario.</p>
        )}
      </main>
      <FooterAdmin />
    </div>
  );
}
