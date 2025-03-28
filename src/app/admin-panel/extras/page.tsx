"use client";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Link from "next/link";
import { Extra } from "../../../../types/Extra";
import { Dip } from "../../../../types/Dip";

export default function ExtrasPanel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  /* --- Estados para Extras --- */
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loadingExtras, setLoadingExtras] = useState<boolean>(false);
  const [errorExtras, setErrorExtras] = useState<string>("");

  const [searchTypeExtra, setSearchTypeExtra] = useState<"id" | "nombre">("id");
  const [searchValueExtra, setSearchValueExtra] = useState<string>("");

  const [addingExtra, setAddingExtra] = useState<boolean>(false);
  const [newExtra, setNewExtra] = useState<{ nombre: string; precio: number; activo: boolean }>({
    nombre: "",
    precio: 0,
    activo: true,
  });
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);

  /* --- Estados para Dips --- */
  const [dips, setDips] = useState<Dip[]>([]);
  const [loadingDips, setLoadingDips] = useState<boolean>(false);
  const [errorDips, setErrorDips] = useState<string>("");

  const [searchTypeDip, setSearchTypeDip] = useState<"id" | "nombre">("id");
  const [searchValueDip, setSearchValueDip] = useState<string>("");

  const [addingDip, setAddingDip] = useState<boolean>(false);
  const [newDip, setNewDip] = useState<{ nombre: string; precio: number; activo: boolean }>({
    nombre: "",
    precio: 0,
    activo: true,
  });
  const [editingDip, setEditingDip] = useState<Dip | null>(null);

  /* --- Funciones para Extras --- */
  const fetchExtras = async () => {
    setLoadingExtras(true);
    setErrorExtras("");
    try {
      const res = await fetch(`${apiUrl}/api/extras`);
      if (!res.ok) throw new Error("Error al obtener los extras");
      const data: Extra[] = await res.json();
      setExtras(data);
    } catch (err: any) {
      setErrorExtras(err.message || "Error al obtener los extras");
    } finally {
      setLoadingExtras(false);
    }
  };

  const fetchExtraById = async (id: string) => {
    setLoadingExtras(true);
    setErrorExtras("");
    try {
      const res = await fetch(`${apiUrl}/api/extras/${id}`);
      if (!res.ok) throw new Error("Extra no encontrado");
      const data: Extra = await res.json();
      setExtras([data]);
    } catch (err: any) {
      setErrorExtras(err.message || "Error al buscar el extra");
      setExtras([]);
    } finally {
      setLoadingExtras(false);
    }
  };

  const fetchExtraByName = async (nombre: string) => {
    setLoadingExtras(true);
    setErrorExtras("");
    try {
      const res = await fetch(`${apiUrl}/api/extras?nombre=${encodeURIComponent(nombre)}`);
      if (!res.ok) throw new Error("Extra no encontrado");
      const data: Extra[] = await res.json();
      setExtras(data);
    } catch (err: any) {
      setErrorExtras(err.message || "Error al buscar el extra");
      setExtras([]);
    } finally {
      setLoadingExtras(false);
    }
  };

  const updateExtra = async (updated: Extra) => {
    try {
      const res = await fetch(`${apiUrl}/api/extras/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar el extra");
      setExtras((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setEditingExtra(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar el extra");
    }
  };

  const deleteExtra = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este extra?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/extras/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el extra");
      setExtras((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el extra");
    }
  };

  const createExtra = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/extras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExtra),
      });
      if (!res.ok) throw new Error("Error al crear el extra");
      const created: Extra = await res.json();
      setExtras((prev) => [...prev, created]);
      setNewExtra({ nombre: "", precio: 0, activo: true });
      setAddingExtra(false);
    } catch (err: any) {
      alert(err.message || "Error al crear el extra");
    }
  };

  /* --- Funciones para Dips --- */
  const fetchDips = async () => {
    setLoadingDips(true);
    setErrorDips("");
    try {
      const res = await fetch(`${apiUrl}/api/dips`);
      if (!res.ok) throw new Error("Error al obtener los dips");
      const data: Dip[] = await res.json();
      setDips(data);
    } catch (err: any) {
      setErrorDips(err.message || "Error al obtener los dips");
    } finally {
      setLoadingDips(false);
    }
  };

  const fetchDipById = async (id: string) => {
    setLoadingDips(true);
    setErrorDips("");
    try {
      const res = await fetch(`${apiUrl}/api/dips/${id}`);
      if (!res.ok) throw new Error("Dip no encontrado");
      const data: Dip = await res.json();
      setDips([data]);
    } catch (err: any) {
      setErrorDips(err.message || "Error al buscar el dip");
      setDips([]);
    } finally {
      setLoadingDips(false);
    }
  };

  const fetchDipByName = async (nombre: string) => {
    setLoadingDips(true);
    setErrorDips("");
    try {
      const res = await fetch(`${apiUrl}/api/dips?nombre=${encodeURIComponent(nombre)}`);
      if (!res.ok) throw new Error("Dip no encontrado");
      const data: Dip[] = await res.json();
      setDips(data);
    } catch (err: any) {
      setErrorDips(err.message || "Error al buscar el dip");
      setDips([]);
    } finally {
      setLoadingDips(false);
    }
  };

  const updateDip = async (updated: Dip) => {
    try {
      const res = await fetch(`${apiUrl}/api/dips/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar el dip");
      setDips((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDip(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar el dip");
    }
  };

  const deleteDip = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este dip?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/dips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el dip");
      setDips((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el dip");
    }
  };

  const createDip = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/dips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDip),
      });
      if (!res.ok) throw new Error("Error al crear el dip");
      const created: Dip = await res.json();
      setDips((prev) => [...prev, created]);
      setNewDip({ nombre: "", precio: 0, activo: true });
      setAddingDip(false);
    } catch (err: any) {
      alert(err.message || "Error al crear el dip");
    }
  };

  /* --- Carga inicial --- */
  useEffect(() => {
    fetchExtras();
    fetchDips();
  }, [apiUrl]);

  const handleSearchExtra = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValueExtra.trim() !== "") {
      if (searchTypeExtra === "id") fetchExtraById(searchValueExtra.trim());
      else fetchExtraByName(searchValueExtra.trim());
    } else {
      fetchExtras();
    }
  };

  const handleSearchDip = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValueDip.trim() !== "") {
      if (searchTypeDip === "id") fetchDipById(searchValueDip.trim());
      else fetchDipByName(searchValueDip.trim());
    } else {
      fetchDips();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />

      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg" // Se carga la imagen desde public/img
          alt="Panel de Administración"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">Gestión de Extras y Dips</h1>
        </div>
      </header>

      <main className="flex-grow p-6 space-y-12">
        {/* Sección de Extras */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Extras</h2>
          <form onSubmit={handleSearchExtra} className="mb-6 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <select
              value={searchTypeExtra}
              onChange={(e) => setSearchTypeExtra(e.target.value as "id" | "nombre")}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
            >
              <option value="id">Buscar por ID</option>
              <option value="nombre">Buscar por Nombre</option>
            </select>
            <input
              type="text"
              placeholder={searchTypeExtra === "id" ? "ID del extra..." : "Nombre del extra..."}
              value={searchValueExtra}
              onChange={(e) => setSearchValueExtra(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded w-full md:w-auto text-gray-900 dark:text-gray-100"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchValueExtra("");
                fetchExtras();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => setAddingExtra(true)}
              type="button"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Agregar Extra
            </button>
          </form>

          {/* Modal para agregar Extra */}
          {addingExtra && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Nuevo Extra</h3>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newExtra.nombre}
                    onChange={(e) => setNewExtra({ ...newExtra, nombre: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newExtra.precio}
                    onChange={(e) => setNewExtra({ ...newExtra, precio: parseFloat(e.target.value) })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                  />
                  <label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <span>Activo:</span>
                    <input
                      type="checkbox"
                      checked={newExtra.activo}
                      onChange={(e) => setNewExtra({ ...newExtra, activo: e.target.checked })}
                    />
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={createExtra}
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setAddingExtra(false)}
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Modal para editar Extra */}
          {editingExtra && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Editar Extra</h3>
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    if (editingExtra) updateExtra(editingExtra);
                  }}
                  className="flex flex-col space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={editingExtra.nombre}
                    onChange={(e) => setEditingExtra({ ...editingExtra, nombre: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={editingExtra.precio}
                    onChange={(e) =>
                      setEditingExtra({ ...editingExtra, precio: parseFloat(e.target.value) })
                    }
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                    required
                  />
                  <label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <span>Activo:</span>
                    <input
                      type="checkbox"
                      checked={editingExtra.activo}
                      onChange={(e) =>
                        setEditingExtra({ ...editingExtra, activo: e.target.checked })
                      }
                      className="mx-auto"
                    />
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDip(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Lista de Extras */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Precio</th>
                  <th className="py-2 px-4 border-b">Activo</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {extras.map((extra) => (
                  <tr key={extra.id} className="text-center">
                    <td className="py-2 px-4 border-b">{extra.id}</td>
                    <td className="py-2 px-4 border-b">{extra.nombre}</td>
                    <td className="py-2 px-4 border-b">${extra.precio}</td>
                    <td className="py-2 px-4 border-b">{extra.activo ? "Sí" : "No"}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => setEditingExtra(extra)}
                        type="button"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteExtra(extra.id)}
                        type="button"
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {extras.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4">
                      No se encontraron extras.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        {/* Sección de Dips */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Dips</h2>
          <form onSubmit={handleSearchDip} className="mb-6 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <select
              value={searchTypeDip}
              onChange={(e) => setSearchTypeDip(e.target.value as "id" | "nombre")}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100"
            >
              <option value="id">Buscar por ID</option>
              <option value="nombre">Buscar por Nombre</option>
            </select>
            <input
              type="text"
              placeholder={searchTypeDip === "id" ? "ID del dip..." : "Nombre del dip..."}
              value={searchValueDip}
              onChange={(e) => setSearchValueDip(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded w-full md:w-auto text-gray-900 dark:text-gray-100"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchValueDip("");
                fetchDips();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => setAddingDip(true)}
              type="button"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Agregar Dip
            </button>
          </form>

          {/* Modal para agregar Dip */}
          {addingDip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Nuevo Dip</h3>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newDip.nombre}
                    onChange={(e) => setNewDip({ ...newDip, nombre: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newDip.precio}
                    onChange={(e) => setNewDip({ ...newDip, precio: parseFloat(e.target.value) })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                  />
                  <label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <span>Activo:</span>
                    <input
                      type="checkbox"
                      checked={newDip.activo}
                      onChange={(e) => setNewDip({ ...newDip, activo: e.target.checked })}
                    />
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={createDip}
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setAddingDip(false)}
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Modal para editar Dip */}
          {editingDip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Editar Dip</h3>
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    if (editingDip) updateDip(editingDip);
                  }}
                  className="flex flex-col space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={editingDip.nombre}
                    onChange={(e) => setEditingDip({ ...editingDip, nombre: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={editingDip.precio}
                    onChange={(e) =>
                      setEditingDip({ ...editingDip, precio: parseFloat(e.target.value) })
                    }
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                    required
                  />
                  <label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <span>Activo:</span>
                    <input
                      type="checkbox"
                      checked={editingDip.activo}
                      onChange={(e) =>
                        setEditingDip({ ...editingDip, activo: e.target.checked })
                      }
                      className="mx-auto"
                    />
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDip(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Lista de Dips */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Precio</th>
                  <th className="py-2 px-4 border-b">Activo</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dips.map((dip) => (
                  <tr key={dip.id} className="text-center">
                    <td className="py-2 px-4 border-b">{dip.id}</td>
                    <td className="py-2 px-4 border-b">{dip.nombre}</td>
                    <td className="py-2 px-4 border-b">${dip.precio}</td>
                    <td className="py-2 px-4 border-b">{dip.activo ? "Sí" : "No"}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => setEditingDip(dip)}
                        type="button"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteDip(dip.id)}
                        type="button"
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {dips.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4">
                      No se encontraron dips.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <FooterAdmin />
    </div>
  );
}
