"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useImage } from "../context/ImageContext";
import { useState, useEffect } from "react";
import ProductCard1 from "../components/ProductCard1"; // Se cambió a ProductCard1
import { getProductos } from "../../../lib/API/api";
import { Producto } from "../../../types/product";

export default function MesaX() {
  const { imagenPortada } = useImage();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [personalizando, setPersonalizando] = useState(false);
  const pathname = usePathname();

  // Extraer el número de la mesa desde la URL
  const numeroMesa = pathname.match(/\/mesa(\d+)/)?.[1] || "1"; // Por defecto, Mesa 1 si no se detecta otra

  useEffect(() => {
    getProductos().then((data) => setProductos(data));
  }, []);

  const categorias = [
    { nombre: "Promociones", key: "promociones", imagen: "https://i.ibb.co/Nd2gTxFr/3.png" },
    { nombre: "Hamburguesas", key: "hamburguesa", imagen: "https://i.ibb.co/TqHL0pP2/Fondo.jpg" },
    { nombre: "Sandwiches", key: "Sandwiches", imagen: "https://i.ibb.co/Ld51tNj4/lomo.jpg" },
    { nombre: "Para acompañar", key: "Para acompañar", imagen: "https://i.ibb.co/Ld51tNj4/lomo.jpg" },
  ];

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter((p) => p.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase())
    : [];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center relative text-center w-full">
      {/* Imagen de encabezado */}
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image 
          src={imagenPortada} 
          alt="Rostisería"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </header>

      {/* Sección de menú */}
      <main className="p-6 max-w-6xl mx-auto flex-grow text-center">
        {categoriaSeleccionada === null ? (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Mesa {numeroMesa}</h1>
            <h1 className="text-4xl font-bold text-center mb-8">Nuestro Menú</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center">
              {categorias.map((cat) => (
                <div 
                  key={cat.key} 
                  className="text-center cursor-pointer w-80 h-80 flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-4"
                  onClick={() => setCategoriaSeleccionada(cat.key)}
                >
                  <Image src={cat.imagen} width={300} height={250} alt={cat.nombre} className="rounded-lg object-cover w-full h-48" />
                  <h2 className="text-3xl font-semibold mt-4">{cat.nombre}</h2>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-center">
              {categorias.find((c) => c.key === categoriaSeleccionada)?.nombre}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
              {productosFiltrados.map((producto) => (
                <ProductCard1 
                  key={producto.id} 
                  producto={producto} 
                  setPersonalizando={setPersonalizando} 
                  numeroMesa={numeroMesa} 
                />
              ))}
            </div>
            <div className="h-24"></div>
            {!personalizando && (
              <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                <button
                  onClick={() => setCategoriaSeleccionada(null)}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 text-lg shadow-lg"
                >
                  Volver atrás
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer solo cuando no hay una categoría seleccionada */}
      {categoriaSeleccionada === null && (
        <footer className="bg-gray-800 text-white text-center p-6 mt-16 text-lg w-full">
          Todos los derechos reservados. <br />
          <a 
            href="https://portafoliowebgonzadev.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline"
          >
            &copy; GonzaDev
          </a> 
          <span className="mx-2">-</span>
          <a 
            href="mailto:gdp43191989@gmail.com" 
            className="text-blue-400 hover:underline"
          >
            gdp43191989@gmail.com
          </a>
        </footer>
      )}
    </div>
  );
}
