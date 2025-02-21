"use client";
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../app/components/Navbar';
import { useImage } from '../app/context/ImageContext';
import { useState, useEffect } from 'react';
import ProductCard from '../app/components/ProductCard';
import { getProductos } from '../../lib/API/api';
import { Producto } from '../../types/product';

export default function Inicio() {
  const { imagenPortada } = useImage();
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [personalizando, setPersonalizando] = useState(false);

  useEffect(() => {
    getProductos().then((data) => setProductos(data));
  }, []);

  const categorias = [
    { nombre: "Promociones", key: "promociones", imagen: "https://i.ibb.co/Nd2gTxFr/3.png" },
    { nombre: "Hamburguesas", key: "hamburguesa", imagen: "https://i.ibb.co/TqHL0pP2/Fondo.jpg" },
    { nombre: "Sandwiches", key: "Sandwiches", imagen: "https://i.ibb.co/Ld51tNj4/lomo.jpg" },
    { nombre: "Para acompañar", key: "Para acompañar", imagen: "https://i.ibb.co/Ld51tNj4/lomo.jpg" },
    
  ];

  const productosFiltrados = categoriaSeleccionada ? productos.filter(p => p.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()) : [];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center relative text-center w-full">
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image 
          src={imagenPortada} 
          alt="Rostisería"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </header>
      
      <div className="sticky top-0 z-50 md:relative md:top-auto w-full">
        <Navbar cambiarSeccion={setSeccionActiva} />
      </div>

      {seccionActiva === "inicio" && (
        <div className="flex flex-col items-center text-center p-6">
          <h1 className="text-5xl font-bold mb-6">Bienvenidos</h1>
          <p className="text-lg text-gray-700 max-w-2xl mb-8">
            Disfruta de los sabores más irresistibles, con ingredientes frescos y de calidad. Pide tu hamburguesa favorita ahora!.
          </p>
          <Image 
            src="https://i.ibb.co/TqHL0pP2/Fondo.jpg" 
            width={500} 
            height={300} 
            alt="Imagen de la Rostisería" 
            className="rounded-lg shadow-lg  object-cover w-full max-w-3xl"
          />
        </div>
      )}

      <main className="p-6 max-w-6xl mx-auto flex-grow text-center">
        {seccionActiva === "menu" && (
          <>
            {categoriaSeleccionada === null ? (
              <>
                <h1 className="text-4xl font-bold text-center mb-8">Nuestro Menú</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center">
                  {categorias.map((cat) => (
                    <div key={cat.key} className="text-center cursor-pointer w-80 h-80 flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-4" onClick={() => setCategoriaSeleccionada(cat.key)}>
                      <Image src={cat.imagen} width={300} height={250} alt={cat.nombre} className="rounded-lg object-cover w-full h-48" />
                      <h2 className="text-3xl font-semibold mt-4">{cat.nombre}</h2>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold mb-6 text-center">{categorias.find(c => c.key === categoriaSeleccionada)?.nombre}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
                  {productosFiltrados.map(producto => (
                    <ProductCard key={producto.id} producto={producto} setPersonalizando={setPersonalizando} />
                  ))}
                </div>
                <div className="h-24"></div>
                {!personalizando && (
                  <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                    <button onClick={() => setCategoriaSeleccionada(null)} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 text-lg shadow-lg">
                      Volver atrás
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}


{seccionActiva === "contacto" && (
          <>
            <h1 className="text-5xl font-bold mb-6">Contáctanos</h1>
            <p className="text-lg text-gray-700 max-w-2xl mb-8 mx-auto">
              ¡Estamos aquí para atenderte! Puedes visitarnos, llamarnos o escribirnos por WhatsApp.
            </p>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-3xl border border-gray-200 mx-auto">
              <h2 className="text-3xl font-semibold mb-4">Información de Contacto</h2>
              <p className="text-lg text-gray-800 mb-2"><strong>📞 Teléfono:</strong> +54 351 </p>
              <p className="text-lg text-gray-800 mb-2"><strong>📧 Email:</strong> contacto@rostiseria.com</p>
              <p className="text-lg text-gray-800 mb-4"><strong>📍 Dirección:</strong> Bv Pte. Umberto Arturo Illia 499, X5000 Córdoba</p>
              <h2 className="text-3xl font-semibold mt-6 mb-4">Ubicación</h2>
              <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border border-gray-300">
                <iframe
                  className="w-full h-full"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3111.8534012422075!2d-64.188775!3d-31.4173395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432999999999999%3A0x9999999999999999!2sRostiser%C3%ADa!5e0!3m2!1ses-419!2sar!4v1610000000000"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </>
        )}

      </main>
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
