// /app/mesa/[mesaId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CartProvider } from "@/app/context/CartContext";

// Importa tu menú original sin SSR
const Inicio = dynamic(() => import("@/app/page"), { ssr: false });

export default function MesaPage() {
  const params = useParams();
  const mesaIdRaw = params.mesaId;
  const mesaId = Array.isArray(mesaIdRaw) ? mesaIdRaw[0] : mesaIdRaw || "";

  const [mesaNombre, setMesaNombre] = useState(`Mesa ${mesaId}`);

  // Traer nombre real de la mesa (opcional)
  useEffect(() => {
    if (!mesaId) return;
    fetch(`/api/Mesa/${mesaId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((m) => setMesaNombre(m.nombre))
      .catch(() => {
        /* Si falla, se queda con "Mesa {id}" */
      });
  }, [mesaId]);

  if (!mesaId) {
    return (
      <div className="p-6 text-center text-red-600">
        ID de mesa inválido
      </div>
    );
  }

  return (
    <CartProvider mesaId={mesaId} mesaNombre={mesaNombre}>
      {/* Título de la mesa */}
      <div className="p-6 text-center bg-white shadow mb-6">
        <h1 className="text-3xl font-bold">Bienvenido a {mesaNombre}</h1>
      </div>
      {/* Aquí va tu menú original */}
      <Inicio />
    </CartProvider>
  );
}
