"use client";
import { useEffect, useState } from 'react';
import { Producto } from '../../../types/product';
import { getProductos } from '../../../lib/API/api';
import ProductCard from '../components/ProductCard';
import Image from 'next/image';
import Navbar from '../components/Navbar';

export default function Menu() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [personalizando, setPersonalizando] = useState(false);
  const [imagenPortada, setImagenPortada] = useState("https://i.ibb.co/q3BRdshT/Albucheportada.jpg");

  useEffect(() => {
    getProductos().then(setProductos);
  }, []);

  useEffect(() => {
    const actualizarImagen = () => {
      if (window.innerWidth >= 768) {
        setImagenPortada("https://i.ibb.co/RkrHd3dS/Albucheportadaweb.jpg");
      } else {
        setImagenPortada("https://i.ibb.co/q3BRdshT/Albucheportada.jpg");
      }
    };
    actualizarImagen();
    window.addEventListener("resize", actualizarImagen);
    return () => window.removeEventListener("resize", actualizarImagen);
  }, []);

  const categorias = [
    { nombre: "Hamburguesas", key: "hamburguesa", imagen: "https://i.ibb.co/yn9pnZFM/Hamburguesa.jpg" },
    { nombre: "Sandwiches", key: "Sandwiches", imagen: "https://i.ibb.co/Ld51tNj4/lomo.jpg" }
  ];

  const productosFiltrados = categoriaSeleccionada ? productos.filter(p => p.categoria === categoriaSeleccionada) : [];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col relative">
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image 
          src={imagenPortada} 
          alt="Rostisería"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </header>
      
   {/* Navbar pegado debajo de la imagen en móviles, oculto cuando se selecciona una categoría */}
   {categoriaSeleccionada === null && (
        <div className="sticky top-0 z-50 md:relative md:top-auto">
          <Navbar />
        </div>
      )}
      <main className="p-6 max-w-6xl mx-auto flex-grow">
        <h1 className="text-4xl font-bold text-center mb-8">Nuestro Menú</h1>
        
        
        {/* Selección de Categorías */}
        {categoriaSeleccionada === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categorias.map((cat) => (
              <div key={cat.key} className="text-center cursor-pointer" onClick={() => setCategoriaSeleccionada(cat.key)}>
                <Image src={cat.imagen} width={400} height={300} alt={cat.nombre} className="rounded-lg shadow-lg mx-auto object-cover" />
                <h2 className="text-3xl font-semibold mt-4">{cat.nombre}</h2>
              </div>
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-center">{categorias.find(c => c.key === categoriaSeleccionada)?.nombre}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productosFiltrados.map(producto => (
                <ProductCard key={producto.id} producto={producto} setPersonalizando={setPersonalizando} />
              ))}
            </div>
            {/* Espaciador dinámico para evitar superposición con el botón */}
            <div className="h-15"></div>
            {/* Botón flotante y fijado al final del scroll, oculto cuando se está personalizando */}
            {!personalizando && (
              <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                <button onClick={() => setCategoriaSeleccionada(null)} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 text-lg shadow-lg">
                  Volver atrás..
                </button>
              </div>
            )}
          </>
        )}
      </main>
      {/* Ocultar footer cuando se seleccione una categoría, agregar margen extra */}
      {categoriaSeleccionada === null ? (
       <footer className="bg-gray-800 text-white text-center p-6 mt-16 text-lg">
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
      ) : (
        <div className="h-20"></div>
      )}
    </div>
  );
}
