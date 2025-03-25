"use client";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Topping } from "../../../../types/Topping";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

export default function ToppingsPanel() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Búsqueda
  const [searchType, setSearchType] = useState<"id" | "nombre">("id");
  const [searchValue, setSearchValue] = useState<string>("");

  // Modal para agregar y editar
  const [addingTopping, setAddingTopping] = useState<boolean>(false);
  const [newTopping, setNewTopping] = useState<{ nombre: string; precio: number; activo: boolean }>({
    nombre: "",
    precio: 0,
    activo: true,
  });
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchToppings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/toppings`);
      if (!res.ok) throw new Error("Error al obtener los toppings");
      const data: Topping[] = await res.json();
      setToppings(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener los toppings");
    } finally {
      setLoading(false);
    }
  };

  const fetchToppingById = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/toppings/${id}`);
      if (!res.ok) throw new Error("Topping no encontrado");
      const data: Topping = await res.json();
      setToppings([data]);
    } catch (err: any) {
      setError(err.message || "Error al buscar el topping");
      setToppings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchToppingByName = async (nombre: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/toppings?nombre=${encodeURIComponent(nombre)}`);
      if (!res.ok) throw new Error("Topping no encontrado");
      const data: Topping[] = await res.json();
      setToppings(data);
    } catch (err: any) {
      setError(err.message || "Error al buscar el topping");
      setToppings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToppings();
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      if (searchType === "id") {
        fetchToppingById(searchValue.trim());
      } else {
        fetchToppingByName(searchValue.trim());
      }
    } else {
      fetchToppings();
    }
  };

  const updateTopping = async (updated: Topping) => {
    try {
      const res = await fetch(`${apiUrl}/api/toppings/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar el topping");
      setToppings((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTopping(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar el topping");
    }
  };

  const deleteTopping = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este topping?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/toppings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el topping");
      setToppings((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el topping");
    }
  };

  const createTopping = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/toppings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTopping),
      });
      if (!res.ok) throw new Error("Error al crear el topping");
      const created: Topping = await res.json();
      setToppings((prev) => [...prev, created]);
      setNewTopping({ nombre: "", precio: 0, activo: true });
      setAddingTopping(false);
    } catch (err: any) {
      alert(err.message || "Error al crear el topping");
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
          <h1 className="text-4xl font-bold text-white">Gestión de Toppings</h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-6">Toppings</h2>
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
            placeholder={searchType === "id" ? "ID del topping..." : "Nombre del topping..."}
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
              fetchToppings();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Limpiar
          </button>
          <button
            onClick={() => setAddingTopping(true)}
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Agregar Topping
          </button>
        </form>

        {/* Modal para agregar un nuevo topping */}
        {addingTopping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center">Nuevo Topping</h3>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newTopping.nombre}
                  onChange={(e) => setNewTopping({ ...newTopping, nombre: e.target.value })}
                  className="border border-gray-300 p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={newTopping.precio}
                  onChange={(e) =>
                    setNewTopping({ ...newTopping, precio: parseFloat(e.target.value) })
                  }
                  className="border border-gray-300 p-2 rounded"
                />
                <label className="flex items-center space-x-2">
                  <span>Activo:</span>
                  <input
                    type="checkbox"
                    checked={newTopping.activo}
                    onChange={(e) => setNewTopping({ ...newTopping, activo: e.target.checked })}
                  />
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={createTopping}
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setAddingTopping(false)}
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

        {/* Modal para editar topping */}
        {editingTopping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center">Editar Topping</h3>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (editingTopping) updateTopping(editingTopping);
                }}
                className="flex flex-col space-y-4"
              >
                <input
                  type="text"
                  placeholder="Nombre"
                  value={editingTopping.nombre}
                  onChange={(e) =>
                    setEditingTopping({ ...editingTopping, nombre: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={editingTopping.precio}
                  onChange={(e) =>
                    setEditingTopping({
                      ...editingTopping,
                      precio: parseFloat(e.target.value),
                    })
                  }
                  className="border border-gray-300 p-2 rounded"
                  required
                />
                <label className="flex items-center space-x-2">
                  <span>Activo:</span>
                  <input
                    type="checkbox"
                    checked={editingTopping.activo}
                    onChange={(e) =>
                      setEditingTopping({ ...editingTopping, activo: e.target.checked })
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
                    onClick={() => setEditingTopping(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

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
                  <th className="py-2 px-4 border-b">Precio</th>
                  <th className="py-2 px-4 border-b">Activo</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {toppings.map((topping) => (
                  <tr key={topping.id} className="text-center">
                    <td className="py-2 px-4 border-b">{topping.id}</td>
                    <td className="py-2 px-4 border-b">{topping.nombre}</td>
                    <td className="py-2 px-4 border-b">${topping.precio}</td>
                    <td className="py-2 px-4 border-b">{topping.activo ? "Sí" : "No"}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => setEditingTopping(topping)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteTopping(topping.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {toppings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4">
                      No se encontraron toppings.
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
