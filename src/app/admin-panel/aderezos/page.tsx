"use client";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

interface Aderezo {
  id: number;
  nombre: string;
  activo: boolean;
}

export default function AderezosPanel() {
  const [aderezos, setAderezos] = useState<Aderezo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [searchType, setSearchType] = useState<"id" | "nombre">("id");
  const [searchValue, setSearchValue] = useState<string>("");

  // Estados para modal de creación y edición
  const [addingAderezo, setAddingAderezo] = useState<boolean>(false);
  const [newAderezo, setNewAderezo] = useState<{ nombre: string; activo: boolean }>({
    nombre: "",
    activo: true,
  });
  const [editingAderezo, setEditingAderezo] = useState<Aderezo | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchAderezos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/aderezos`);
      if (!res.ok) throw new Error("Error al obtener los aderezos");
      const data: Aderezo[] = await res.json();
      setAderezos(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener los aderezos");
    } finally {
      setLoading(false);
    }
  };

  const fetchAderezoById = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/aderezos/${id}`);
      if (!res.ok) throw new Error("Aderezo no encontrado");
      const data: Aderezo = await res.json();
      setAderezos([data]);
    } catch (err: any) {
      setError(err.message || "Error al buscar el aderezo");
      setAderezos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAderezoByName = async (nombre: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/aderezos?nombre=${encodeURIComponent(nombre)}`);
      if (!res.ok) throw new Error("Aderezo no encontrado");
      const data: Aderezo[] = await res.json();
      setAderezos(data);
    } catch (err: any) {
      setError(err.message || "Error al buscar el aderezo");
      setAderezos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAderezos();
  }, [apiUrl]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      if (searchType === "id") fetchAderezoById(searchValue.trim());
      else fetchAderezoByName(searchValue.trim());
    } else {
      fetchAderezos();
    }
  };

  const updateAderezo = async (updated: Aderezo) => {
    try {
      const res = await fetch(`${apiUrl}/api/aderezos/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar el aderezo");
      setAderezos((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditingAderezo(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar el aderezo");
    }
  };

  const deleteAderezo = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este aderezo?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/aderezos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el aderezo");
      setAderezos((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el aderezo");
    }
  };

  const createAderezo = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/aderezos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAderezo),
      });
      if (!res.ok) throw new Error("Error al crear el aderezo");
      const created: Aderezo = await res.json();
      setAderezos((prev) => [...prev, created]);
      setNewAderezo({ nombre: "", activo: true });
      setAddingAderezo(false);
    } catch (err: any) {
      alert(err.message || "Error al crear el aderezo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
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
          <h1 className="text-4xl font-bold text-white">Gestión de Aderezos</h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-6">Aderezos</h2>
        <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "id" | "nombre")}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="id">Buscar por ID</option>
            <option value="nombre">Buscar por Nombre</option>
          </select>
          <input
            type="text"
            placeholder={searchType === "id" ? "ID del aderezo..." : "Nombre del aderezo..."}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full md:w-auto"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              fetchAderezos();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Limpiar
          </button>
          <button
            onClick={() => setAddingAderezo(true)}
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Agregar Aderezo
          </button>
        </form>

        {/* Modal para agregar Aderezo */}
        {addingAderezo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center">Nuevo Aderezo</h3>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newAderezo.nombre}
                  onChange={(e) => setNewAderezo({ ...newAderezo, nombre: e.target.value })}
                  className="border border-gray-300 p-2 rounded"
                />
                <label className="flex items-center space-x-2">
                  <span>Activo:</span>
                  <input
                    type="checkbox"
                    checked={newAderezo.activo}
                    onChange={(e) => setNewAderezo({ ...newAderezo, activo: e.target.checked })}
                  />
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={createAderezo}
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setAddingAderezo(false)}
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal para editar Aderezo */}
        {editingAderezo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center">Editar Aderezo</h3>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (editingAderezo) updateAderezo(editingAderezo);
                }}
                className="flex flex-col space-y-4"
              >
                <input
                  type="text"
                  placeholder="Nombre"
                  value={editingAderezo.nombre}
                  onChange={(e) =>
                    setEditingAderezo({ ...editingAderezo, nombre: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded"
                  required
                />
                <label className="flex items-center space-x-2">
                  <span>Activo:</span>
                  <input
                    type="checkbox"
                    checked={editingAderezo.activo}
                    onChange={(e) =>
                      setEditingAderezo({ ...editingAderezo, activo: e.target.checked })
                    }
                    className="mx-auto"
                  />
                </label>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingAderezo(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Lista de Aderezos */}
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Activo</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aderezos.map((aderezo) => (
                  <tr key={aderezo.id} className="text-center">
                    <td className="py-2 px-4 border-b">{aderezo.id}</td>
                    <td className="py-2 px-4 border-b">{aderezo.nombre}</td>
                    <td className="py-2 px-4 border-b">{aderezo.activo ? "Sí" : "No"}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => setEditingAderezo(aderezo)}
                        type="button"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteAderezo(aderezo.id)}
                        type="button"
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {aderezos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4">
                      No se encontraron aderezos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <FooterAdmin />
    </div>
  );
}
