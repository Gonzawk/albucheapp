"use client";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import { Categoria } from "../../../../types/Categoria";

export default function CategoriasPanel() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoriaKey, setCategoriaKey] = useState("");
  const [imagen, setImagen] = useState("");
  const [searchType, setSearchType] = useState<"id" | "nombre">("id");
  const [searchValue, setSearchValue] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchCategorias = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/categorias`);
      if (!res.ok) {
        throw new Error("Error al obtener las categorías");
      }
      const data: Categoria[] = await res.json();
      let filtered = data;
      if (searchValue.trim()) {
        if (searchType === "id") {
          filtered = data.filter((cat) =>
            cat.id.toString().includes(searchValue.trim())
          );
        } else {
          filtered = data.filter((cat) =>
            cat.nombre.toLowerCase().includes(searchValue.trim().toLowerCase())
          );
        }
      }
      setCategorias(filtered);
    } catch (err: any) {
      setError(err.message || "Error al obtener las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [searchValue, apiUrl]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = selectedCategoria
      ? { id: selectedCategoria.id, nombre, key: categoriaKey, imagen }
      : { nombre, key: categoriaKey, imagen };

    console.log("Payload a enviar:", payload);

    try {
      if (selectedCategoria) {
        const res = await fetch(`${apiUrl}/api/categorias/${selectedCategoria.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error("Error al actualizar la categoría");
        }
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategoria.id ? { ...cat, ...payload } : cat
          )
        );
      } else {
        const res = await fetch(`${apiUrl}/api/categorias`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error("Error al crear la categoría");
        }
        const nuevaCategoria: Categoria = await res.json();
        setCategorias((prev) => [...prev, nuevaCategoria]);
      }
      setMostrarModal(false);
      setNombre("");
      setCategoriaKey("");
      setImagen("");
      setSelectedCategoria(null);
    } catch (err: any) {
      alert(err.message || "Error al guardar la categoría");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de eliminar esta categoría?")) {
      try {
        const res = await fetch(`${apiUrl}/api/categorias/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Error al eliminar la categoría");
        }
        setCategorias((prev) => prev.filter((cat) => cat.id !== id));
      } catch (err: any) {
        alert(err.message || "Error al eliminar la categoría");
      }
    }
  };

  const openModalForEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setNombre(categoria.nombre);
    setCategoriaKey(categoria.key);
    setImagen(categoria.imagen);
    setMostrarModal(true);
  };

  const openModalForCreate = () => {
    setSelectedCategoria(null);
    setNombre("");
    setCategoriaKey("");
    setImagen("");
    setMostrarModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <NavBarAdmin />

      <header className="relative w-full h-40 md:h-56 overflow-hidden">
        <Image
          src="/admin-banner.jpg"
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
            Gestión de Categorías
          </h1>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-6">
        {/* Filtros y botón de agregar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <select
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as "id" | "nombre")
              }
              className="border border-gray-300 p-2 rounded"
            >
              <option value="id">Buscar por ID</option>
              <option value="nombre">Buscar por Nombre</option>
            </select>
            <input
              type="text"
              placeholder={
                searchType === "id"
                  ? "Buscar por ID"
                  : "Buscar por nombre"
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCategorias}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Buscar
            </button>
            <button
              onClick={() => {
                setSearchValue("");
                fetchCategorias();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Limpiar
            </button>
            <button
              onClick={openModalForCreate}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Agregar Categoría
            </button>
          </div>
        </div>

        {/* Lista de Categorías */}
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : categorias.length === 0 ? (
          <p className="text-center">No hay categorías.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Key</th>
                  <th className="py-2 px-4 border-b">Imagen</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.id} className="text-center">
                    <td className="py-2 px-4 border-b">{cat.id}</td>
                    <td className="py-2 px-4 border-b">{cat.nombre}</td>
                    <td className="py-2 px-4 border-b">{cat.key}</td>
                    <td className="py-2 px-4 border-b">
                      <Image
                        src={cat.imagen}
                        alt={cat.nombre}
                        width={50}
                        height={50}
                        className="mx-auto rounded"
                      />
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => openModalForEdit(cat)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-red-600"
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

        {/* Modal para agregar/editar categoría */}
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center">
                {selectedCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Key</label>
                  <input
                    type="text"
                    value={categoriaKey}
                    onChange={(e) => setCategoriaKey(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Imagen (URL)</label>
                  <input
                    type="url"
                    value={imagen}
                    onChange={(e) => setImagen(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    {selectedCategoria ? "Actualizar" : "Crear"}
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
