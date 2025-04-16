"use client";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Image from "next/image";

// Interfaz según el modelo (sp_GetCajas)
interface Caja {
  id: number;
  pedidoID: number;
  metodoPago: string;
  monto: number;
  fechaRegistro: string;
}

// DTO para POST (sp_AgregarACaja)
interface CajaDto {
  pedidoID: number;
  metodoPago: string;
  monto: number;
}

// Interfaz para totales (sp_GetTotalesCaja)
interface Totales {
  MetodoPago: string;
  TotalMonto: number;
}

export default function CajaPanel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Estados generales
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Estados para búsqueda por ID
  const [searchValue, setSearchValue] = useState<string>("");

  // Estados para filtro por fechas
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  // Estado para la visualización del modal de filtros
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  // Estado para creación (modal "Agregar Registro")
  const [addingCaja, setAddingCaja] = useState<boolean>(false);
  const [newCaja, setNewCaja] = useState<CajaDto>({ pedidoID: 0, metodoPago: "", monto: 0 });

  // Estado para edición (si se necesita editar registros)
  const [editingCaja, setEditingCaja] = useState<Caja | null>(null);

  // Estado para el modal de resumen (Cerrar Caja)
  const [showResumenModal, setShowResumenModal] = useState<boolean>(false);

  // ==========================================================
  // Funciones para obtener token y headers de autorización
  // ==========================================================
  const getToken = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
      token = match ? match[2] : "";
    }
    return token;
  };

  const getAuthHeaders = (isJson: boolean = true) => {
    const token = getToken();
    return {
      ...(isJson && { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
    };
  };

  // ==========================================================
  // Funciones para obtener registros de caja mediante SPs
  // ==========================================================
  const fetchCajas = async (inicio?: string, fin?: string) => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (inicio) queryParams.append("inicio", inicio);
      if (fin) queryParams.append("fin", fin);
      const url = `${apiUrl}/api/Caja?${queryParams.toString()}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error al obtener las cajas");
      const data: Caja[] = await res.json();
      setCajas(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener las cajas");
      setCajas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCajaById = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Caja/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Caja no encontrada");
      const data: Caja = await res.json();
      setCajas([data]);
    } catch (err: any) {
      setError(err.message || "Error al buscar la caja");
      setCajas([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Funciones de búsqueda y filtrado
  // ==========================================================
  const handleSearchById = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      fetchCajaById(searchValue.trim());
    } else {
      fetchCajas();
    }
  };

  const handleFilterByDate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fechaInicio && !fechaFin) {
      fetchCajas();
    } else {
      fetchCajas(fechaInicio, fechaFin);
    }
    // Se cierra el modal de filtros al aplicar
    setShowFiltersModal(false);
  };

  // ==========================================================
  // Funciones de creación, eliminación y actualización
  // ==========================================================
  const createCaja = async () => {
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Caja`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newCaja),
      });
      if (!res.ok) throw new Error("Error al crear la caja");
      const createdId = await res.json();
      alert(`Se creó la caja con ID: ${createdId}`);
      setAddingCaja(false);
      fetchCajas();
      setNewCaja({ pedidoID: 0, metodoPago: "", monto: 0 });
    } catch (err: any) {
      setError(err.message || "Error al crear la caja");
    }
  };

  const deleteCaja = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta caja?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/Caja/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });
      if (!res.ok) throw new Error("Error al eliminar la caja");
      setCajas((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar la caja");
    }
  };

  const updateCaja = async (updated: Caja) => {
    try {
      const res = await fetch(`${apiUrl}/api/Caja/${updated.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar la caja");
      setCajas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCaja(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar la caja");
    }
  };

  // ==========================================================
  // Funciones para el modal de resumen (Cerrar Caja)
  // ==========================================================
  const openResumenModal = async () => {
    await fetchCajas(fechaInicio, fechaFin);
    setShowResumenModal(true);
  };

  const closeResumenModal = () => {
    setShowResumenModal(false);
  };

  // Funciones para imprimir y descargar el resumen (los botones no se incluirán en el PDF)
  const imprimirResumen = () => {
    const resumenContent = document.getElementById("resumenCajaContent");
    if (resumenContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Resumen de Caja</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
                @media print {
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${resumenContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };
  

  const descargarResumen = () => {
    const resumenContent = document.getElementById("resumenCajaContent");
    if (resumenContent) {
      const blob = new Blob([resumenContent.innerHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resumen_caja.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // ==========================================================
  // Cálculo de totales a partir del arreglo de cajas
  // ==========================================================
  const efectivoTotal = cajas.reduce((acc, caja) => {
    return acc + (String(caja.metodoPago).toLowerCase() === "efectivo" ? caja.monto : 0);
  }, 0);
  const transferenciaTotal = cajas.reduce((acc, caja) => {
    return acc + (String(caja.metodoPago).toLowerCase() === "transferencia" ? caja.monto : 0);
  }, 0);
  const totalGlobal = efectivoTotal + transferenciaTotal;

  // Cargar cajas inicialmente
  useEffect(() => {
    fetchCajas();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />

      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg"
          alt="Panel de Administración - Caja"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">Gestión de Caja</h1>
        </div>
      </header>

      <main className="flex-grow p-6 space-y-6">
        {/* Búsqueda por ID */}
        <form onSubmit={handleSearchById} className="mb-6 flex flex-row items-center space-x-2">
          <input
            type="text"
            placeholder="Buscar por ID de registro..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded w-full md:w-auto dark:text-gray-100"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              fetchCajas();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Limpiar
          </button>
          {/* Botón para abrir el modal de filtros */}
          <button
            type="button"
            onClick={() => setShowFiltersModal(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
          >
            Filtros
          </button>
        </form>

        {/* Botón para abrir modal de resumen (Cerrar Caja) */}
        <button
          onClick={openResumenModal}
          type="button"
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
        >
          Cerrar Caja (Generar Resumen)
        </button>

        {/* Tabla de cajas */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">PedidoID</th>
                <th className="py-2 px-4 border-b">Método Pago</th>
                <th className="py-2 px-4 border-b">Monto</th>
                <th className="py-2 px-4 border-b">Fecha Registro</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cajas.map((caja) => (
                <tr key={caja.id} className="text-center">
                  <td className="py-2 px-4 border-b">{caja.id}</td>
                  <td className="py-2 px-4 border-b">{caja.pedidoID}</td>
                  <td className="py-2 px-4 border-b">{caja.metodoPago}</td>
                  <td className="py-2 px-4 border-b">
                    ${typeof caja.monto === "number" ? caja.monto.toFixed(2) : "0.00"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(caja.fechaRegistro).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b space-x-2">
                    {/* <button
                      onClick={() => setEditingCaja(caja)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Editar
                    </button> */}
                    <button
                      onClick={() => deleteCaja(caja.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && cajas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4">
                    No se encontraron cajas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="text-center text-blue-500 font-semibold">Cargando...</p>
        )}
        {error && (
          <p className="text-center text-red-500 font-semibold">{error}</p>
        )}
      </main>

      {/* Modal de filtros */}
      {showFiltersModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Filtros de Búsqueda</h2>
            <form onSubmit={handleFilterByDate} className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm">Fecha y Hora Inicio:</label>
                <input
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded dark:text-gray-100"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm">Fecha y Hora Fin:</label>
                <input
                  type="datetime-local"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded dark:text-gray-100"
                />
              </div>
              <div className="flex justify-around mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Filtrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFechaInicio("");
                    setFechaFin("");
                    fetchCajas();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Limpiar Filtro
                </button>
              </div>
            </form>
            <button
              onClick={() => setShowFiltersModal(false)}
              className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Cerrar Modal
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de previsualización del resumen de caja */}
      {showResumenModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            id="resumenCajaContent"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-2xl overflow-auto"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Resumen de Caja</h2>
            {/* Sección de totales */}
            <section className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Totales</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Efectivo:</span>
                  <span>${efectivoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Transferencias:</span>
                  <span>${transferenciaTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${totalGlobal.toFixed(2)}</span>
                </div>
              </div>
            </section>
            {/* Detalle de Registros */}
            <section className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Detalle de Registros</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr>
                      <th className="py-1 px-2 border">PedidoID</th>
                      <th className="py-1 px-2 border">Método de Pago</th>
                      <th className="py-1 px-2 border">Monto</th>
                      <th className="py-1 px-2 border">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cajas.length > 0 ? (
                      cajas.map((record) => (
                        <tr key={record.id} className="text-center">
                          <td className="py-1 px-2 border">{record.pedidoID}</td>
                          <td className="py-1 px-2 border">{record.metodoPago}</td>
                          <td className="py-1 px-2 border">
                            ${typeof record.monto === "number" ? record.monto.toFixed(2) : "0.00"}
                          </td>
                          <td className="py-1 px-2 border">{new Date(record.fechaRegistro).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-2 px-2 text-center">
                          No hay registros en la caja para este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            {/* Botones de acción para imprimir y descargar (no se incluyen en el PDF) */}
            <div className="flex justify-center space-x-4 mt-4 no-print">
              <button
                onClick={imprimirResumen}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Imprimir Resumen
              </button>
              <button
                onClick={descargarResumen}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Descargar Resumen
              </button>
              <button
                onClick={closeResumenModal}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Cerrar Modal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <FooterAdmin />
    </div>
  );
}
