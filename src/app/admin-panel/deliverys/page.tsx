"use client";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

// Definición del tipo Repartidor
export interface Repartidor {
  id: number;
  nombre: string;
  celular: string;
  fechaRegistro: string;
  estado: boolean;
}

export default function DeliverysPanel() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [selectedRepartidor, setSelectedRepartidor] = useState<Repartidor | null>(null);
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [estado, setEstado] = useState(true);
  const [searchType, setSearchType] = useState<"id" | "nombre">("id");
  const [searchValue, setSearchValue] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchRepartidores = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Repartidores`);
      if (!res.ok) {
        throw new Error("Error al obtener los repartidores");
      }
      const data: Repartidor[] = await res.json();
      let filtered = data;
      if (searchValue.trim()) {
        if (searchType === "id") {
          filtered = data.filter((r) =>
            r.id.toString().includes(searchValue.trim())
          );
        } else {
          filtered = data.filter((r) =>
            r.nombre.toLowerCase().includes(searchValue.trim().toLowerCase())
          );
        }
      }
      setRepartidores(filtered);
    } catch (err: any) {
      setError(err.message || "Error al obtener los repartidores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepartidores();
  }, [searchValue, apiUrl, searchType]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = selectedRepartidor
      ? { id: selectedRepartidor.id, nombre, celular, estado }
      : { nombre, celular, estado };
    try {
      if (selectedRepartidor) {
        const res = await fetch(`${apiUrl}/api/Repartidores/${selectedRepartidor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error("Error al actualizar el repartidor");
        }
        setRepartidores((prev) =>
          prev.map((r) =>
            r.id === selectedRepartidor.id ? { ...r, ...payload } : r
          )
        );
      } else {
        const res = await fetch(`${apiUrl}/api/Repartidores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error("Error al crear el repartidor");
        }
        const nuevoRepartidor: Repartidor = await res.json();
        setRepartidores((prev) => [...prev, nuevoRepartidor]);
      }
      setMostrarModal(false);
      setNombre("");
      setCelular("");
      setEstado(true);
      setSelectedRepartidor(null);
    } catch (err: any) {
      alert(err.message || "Error al guardar el repartidor");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de eliminar este repartidor?")) {
      try {
        const res = await fetch(`${apiUrl}/api/Repartidores/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Error al eliminar el repartidor");
        }
        setRepartidores((prev) => prev.filter((r) => r.id !== id));
      } catch (err: any) {
        alert(err.message || "Error al eliminar el repartidor");
      }
    }
  };

  const openModalForEdit = (repartidor: Repartidor) => {
    setSelectedRepartidor(repartidor);
    setNombre(repartidor.nombre);
    setCelular(repartidor.celular);
    setEstado(repartidor.estado);
    setMostrarModal(true);
  };

  const openModalForCreate = () => {
    setSelectedRepartidor(null);
    setNombre("");
    setCelular("");
    setEstado(true);
    setMostrarModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />

      {/* Cabecera con imagen de portada */}
      <header className="relative w-full h-40 md:h-56 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg"
          alt="Panel de Administración"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            Gestión de Repartidores
          </h1>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-6">
        {/* Filtros y botones */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as "id" | "nombre")}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
            >
              <option value="id">Buscar por ID</option>
              <option value="nombre">Buscar por Nombre</option>
            </select>
            <input
              type="text"
              placeholder={searchType === "id" ? "Buscar por ID" : "Buscar por nombre"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchRepartidores}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Buscar
            </button>
            <button
              onClick={() => {
                setSearchValue("");
                fetchRepartidores();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={openModalForCreate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Agregar Repartidor
            </button>
          </div>
        </div>

        {/* Lista de repartidores */}
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : repartidores.length === 0 ? (
          <p className="text-center">No hay repartidores.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Celular</th>
                  <th className="py-2 px-4 border-b">Fecha Registro</th>
                  <th className="py-2 px-4 border-b">Estado</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {repartidores.map((r) => (
                  <tr key={r.id} className="text-center">
                    <td className="py-2 px-4 border-b">{r.id}</td>
                    <td className="py-2 px-4 border-b">{r.nombre}</td>
                    <td className="py-2 px-4 border-b">{r.celular}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(r.fechaRegistro).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {r.estado ? "Activo" : "Inactivo"}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => openModalForEdit(r)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs md:text-sm transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs md:text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para agregar/editar repartidor */}
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
                {selectedRepartidor ? "Editar Repartidor" : "Nuevo Repartidor"}
              </h2>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
                    Celular
                  </label>
                  <input
                    type="text"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
                    Estado
                  </label>
                  <select
                    value={estado ? "activo" : "inactivo"}
                    onChange={(e) => setEstado(e.target.value === "activo")}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    {selectedRepartidor ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </main>

      <FooterAdmin />
    </div>
  );
}
