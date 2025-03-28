"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TipoProducto, schemas } from "../../config/personalizacionConfig";
import { Producto } from "../../../../types/Producto";
import { useCart } from "../../context/CartContext";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import { Categoria } from "../../../../types/Categoria";

export default function ProductosPanelComponent() {
  // Estados generales
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Estados para búsqueda
  const [searchType, setSearchType] = useState<"id" | "nombre">("id");
  const [searchValue, setSearchValue] = useState<string>("");

  // Estados para edición y creación
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [addingProducto, setAddingProducto] = useState<boolean>(false);
  const [newProducto, setNewProducto] = useState<{
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoria: string;
    tipoProducto: number;
  }>({
    nombre: "",
    descripcion: "",
    precio: 0,
    imagen: "",
    categoria: "",
    tipoProducto: 1,
  });

  // Estados para categorías (dropdown)
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { clearCart } = useCart();

  // Función para obtener productos
  const fetchProductos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Productos`);
      if (!res.ok) throw new Error("Error al obtener los productos");
      const data: Producto[] = await res.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener los productos");
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar producto por ID
  const fetchProductoById = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Productos/${id}`);
      if (!res.ok) throw new Error("Producto no encontrado");
      const data: Producto = await res.json();
      setProductos([data]);
    } catch (err: any) {
      setError(err.message || "Error al buscar el producto");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar producto por nombre
  const fetchProductoByName = async (nombre: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${apiUrl}/api/Productos?nombre=${encodeURIComponent(nombre)}`
      );
      if (!res.ok) throw new Error("Producto no encontrado");
      const data: Producto[] = await res.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || "Error al buscar el producto");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [apiUrl]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      if (searchType === "id") fetchProductoById(searchValue.trim());
      else fetchProductoByName(searchValue.trim());
    } else {
      fetchProductos();
    }
  };

  const updateProducto = async (updated: Producto) => {
    try {
      console.log("Actualizando producto:", JSON.stringify(updated, null, 2));
      const res = await fetch(`${apiUrl}/api/Productos/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar el producto");
      setProductos((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditingProducto(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar el producto");
    }
  };

  const deleteProducto = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/Productos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el producto");
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el producto");
    }
  };

  const createProducto = async () => {
    const productoToSend = {
      id: 0,
      ...newProducto,
      PersonalizacionSchema:
        schemas[newProducto.tipoProducto as TipoProducto].schemaJson,
    };

    console.log("Creando producto con payload:", JSON.stringify(productoToSend, null, 2));

    try {
      const res = await fetch(`${apiUrl}/api/Productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoToSend),
      });
      if (!res.ok) throw new Error("Error al crear el producto");
      const created: Producto = await res.json();
      setProductos((prev) => [...prev, created]);
      alert(`Producto creado correctamente (ID: ${created.id})`);
      setNewProducto({
        nombre: "",
        descripcion: "",
        precio: 0,
        imagen: "",
        categoria: "",
        tipoProducto: 1,
      });
      setAddingProducto(false);
    } catch (err: any) {
      alert(err.message || "Error al crear el producto");
    }
  };

  // Obtener categorías para el dropdown
  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/Categorias`);
      if (!res.ok) throw new Error("Error al obtener las categorías");
      const data: Categoria[] = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [apiUrl]);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter((p) =>
        p.categoria.toLowerCase() ===
        categoriaSeleccionada.toLowerCase()
      )
    : productos;

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
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">Gestión de Productos</h1>
        </div>
      </header>

      <main className="flex-grow p-6 space-y-6">
        <form
          onSubmit={handleSearch}
          className="mb-6 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2"
        >
          <select
            value={searchType}
            onChange={(e) =>
              setSearchType(e.target.value as "id" | "nombre")
            }
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded dark:text-gray-100"
          >
            <option value="id">Buscar por ID</option>
            <option value="nombre">Buscar por Nombre</option>
          </select>
          <input
            type="text"
            placeholder={
              searchType === "id"
                ? "ID del producto..."
                : "Nombre del producto..."
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded w-full md:w-auto dark:text-gray-100"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              fetchProductos();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={() => setAddingProducto(true)}
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Agregar Producto
          </button>
        </form>

        {/* Modal para crear un nuevo producto */}
        {addingProducto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
                Nuevo Producto
              </h3>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newProducto.nombre}
                  onChange={(e) =>
                    setNewProducto({ ...newProducto, nombre: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                />
                <textarea
                  placeholder="Descripción"
                  value={newProducto.descripcion}
                  onChange={(e) =>
                    setNewProducto({ ...newProducto, descripcion: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                ></textarea>
                <input
                  type="number"
                  placeholder="Precio"
                  value={newProducto.precio}
                  onChange={(e) =>
                    setNewProducto({
                      ...newProducto,
                      precio: parseFloat(e.target.value),
                    })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                  type="text"
                  placeholder="Imagen (URL)"
                  value={newProducto.imagen}
                  onChange={(e) =>
                    setNewProducto({ ...newProducto, imagen: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                />
                <select
                  value={newProducto.categoria}
                  onChange={(e) =>
                    setNewProducto({ ...newProducto, categoria: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Selecciona una Categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.key}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={newProducto.tipoProducto}
                  onChange={(e) =>
                    setNewProducto({
                      ...newProducto,
                      tipoProducto: parseInt(e.target.value),
                    })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value={1}>Tipo 1: 1 producto + 2 Toppings</option>
                  <option value={2}>Tipo 2: 2 productos sin toppings</option>
                  <option value={3}>
                    Tipo 3: Hamburguesas (Personalización completa)
                  </option>
                  <option value={4}>Tipo 4: Sandwiches</option>
                  <option value={5}>Tipo 5: Para Acompañar</option>
                  <option value={6}>Tipo 6: Minutas</option>
                </select>
                <div>
                  <p className="text-gray-700 dark:text-gray-200">
                    Esquema:{" "}
                    {schemas[newProducto.tipoProducto as TipoProducto].description}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={createProducto}
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setAddingProducto(false)}
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

        {/* Modal para editar producto */}
        {editingProducto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
                Editar Producto
              </h3>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (editingProducto) updateProducto(editingProducto);
                }}
                className="flex flex-col space-y-4"
              >
                <input
                  type="text"
                  placeholder="Nombre"
                  value={editingProducto.nombre}
                  onChange={(e) =>
                    setEditingProducto({ ...editingProducto, nombre: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={editingProducto.descripcion}
                  onChange={(e) =>
                    setEditingProducto({ ...editingProducto, descripcion: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  required
                ></textarea>
                <input
                  type="number"
                  placeholder="Precio"
                  value={editingProducto.precio}
                  onChange={(e) =>
                    setEditingProducto({
                      ...editingProducto,
                      precio: parseFloat(e.target.value),
                    })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <input
                  type="text"
                  placeholder="Imagen (URL)"
                  value={editingProducto.imagen}
                  onChange={(e) =>
                    setEditingProducto({ ...editingProducto, imagen: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <select
                  value={editingProducto.categoria}
                  onChange={(e) =>
                    setEditingProducto({ ...editingProducto, categoria: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Selecciona una Categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.key}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={editingProducto.tipoProducto}
                  onChange={(e) =>
                    setEditingProducto({
                      ...editingProducto,
                      tipoProducto: parseInt(e.target.value),
                    })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value={1}>Tipo 1: 1 producto + 2 Toppings</option>
                  <option value={2}>Tipo 2: 2 productos sin toppings</option>
                  <option value={3}>
                    Tipo 3: Hamburguesas (Personalización completa)
                  </option>
                  <option value={4}>Tipo 4: Sandwiches</option>
                  <option value={5}>Tipo 5: Para Acompañar</option>
                  <option value={6}>Tipo 6: Minutas</option>
                </select>
                <div>
                  <p className="text-gray-700 dark:text-gray-200">
                    Esquema:{" "}
                    {schemas[editingProducto.tipoProducto as TipoProducto].description}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProducto(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Lista de productos */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Imagen</th>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Precio</th>
                <th className="py-2 px-4 border-b">Categoría</th>
                <th className="py-2 px-4 border-b">Tipo</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} className="text-center">
                  <td className="py-2 px-4 border-b">{prod.id}</td>
                  <td className="py-2 px-4 border-b">
                    <Image
                      src={prod.imagen}
                      alt={prod.nombre}
                      width={50}
                      height={50}
                      className="mx-auto rounded"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{prod.nombre}</td>
                  <td className="py-2 px-4 border-b">${prod.precio}</td>
                  <td className="py-2 px-4 border-b">{prod.categoria}</td>
                  <td className="py-2 px-4 border-b">{prod.tipoProducto}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button
                      onClick={() => setEditingProducto(prod)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteProducto(prod.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <FooterAdmin />
    </div>
  );
}
