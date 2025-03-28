"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../app/components/Navbar";
import { useImage } from "../app/context/ImageContext";
import { useState, useEffect } from "react";
import ProductCard from "../app/components/ProductCard";
import { Producto } from "../../types/Producto";
import { useCart } from "../app/context/CartContext";
import CartModal from "../app/components/CartModal";
import Footer from "../app/components/Footer";
import SocialMedia from "../app/components/SocialMedia";

// Define la interfaz de Categoría
interface Categoria {
  id: number;
  nombre: string;
  key: string;
  imagen: string;
}

// Interfaz para Horario obtenido desde la API
interface Horario {
  HorarioId: number;
  horaApertura: string; // formato "HH:mm" o "HH:mm:ss"
  horaCierre: string;
  fechaActualizacion: string;
}

export default function Inicio() {
  const { imagenPortada } = useImage();
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [personalizando, setPersonalizando] = useState(false);
  const [menuActivo, setMenuActivo] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, clearCart } = useCart();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Estado para el Horario obtenido desde la API
  const [horario, setHorario] = useState<Horario | null>(null);

  // Función que convierte un string "HH:mm" a minutos (0-1440)
  const timeStringToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(":");
    if (parts.length < 2) return 0;
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    return hours * 60 + minutes;
  };

  // Función para actualizar la disponibilidad del menú usando la zona horaria de Argentina
  const updateMenuAvailability = () => {
    if (horario) {
      const apertura = timeStringToMinutes(horario.horaApertura);
      const cierre = timeStringToMinutes(horario.horaCierre);
      // Convertir la hora actual a la zona horaria de Argentina
      const now = new Date();
      const argentinaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
      const currentMinutes = argentinaTime.getHours() * 60 + argentinaTime.getMinutes();
      setMenuActivo(currentMinutes >= apertura && currentMinutes < cierre);
    } else {
      // Si no se obtiene el horario, se activa por defecto
      setMenuActivo(true);
    }
  };

  // Cargar productos desde el endpoint
  useEffect(() => {
    async function fetchProductos() {
      try {
        const res = await fetch(`${apiUrl}/api/Productos`);
        if (!res.ok) {
          throw new Error("Error al obtener los productos");
        }
        const data: Producto[] = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    }
    fetchProductos();
  }, [apiUrl]);

  // Traer las categorías desde la API
  useEffect(() => {
    async function fetchCategorias() {
      try {
        const res = await fetch(`${apiUrl}/api/Categorias`);
        if (res.ok) {
          const data: Categoria[] = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    }
    fetchCategorias();
  }, [apiUrl]);

  // Obtener el horario desde la API
  useEffect(() => {
    async function fetchHorario() {
      try {
        const res = await fetch(`${apiUrl}/api/Horarios`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          throw new Error("Error al obtener el horario");
        }
        const data: Horario = await res.json();
        console.log("Horario obtenido:", data);
        setHorario(data);
      } catch (error) {
        console.error("Error al obtener el horario:", error);
      }
    }
    fetchHorario();
  }, [apiUrl]);

  // Actualiza la disponibilidad del menú cada minuto en base al horario y la hora en Argentina
  useEffect(() => {
    updateMenuAvailability();
    const interval = setInterval(() => {
      updateMenuAvailability();
    }, 60000);
    return () => clearInterval(interval);
  }, [horario]);

  // Filtrar productos según la categoría seleccionada
  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(
        (p) =>
          p.categoria.toLowerCase() ===
          categoriaSeleccionada.toLowerCase()
      )
    : [];

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
            Disfruta de los sabores más irresistibles, con ingredientes frescos y de calidad.
            Pedí tu hamburguesa clásica favorita, o armala a gusto con la gran variedad de toppings
            con los que contamos!
          </p>
          <Image 
            src="https://i.ibb.co/TqHL0pP2/Fondo.jpg" 
            width={500} 
            height={300} 
            alt="Imagen de la Rostisería" 
            className="rounded-lg shadow-lg object-cover w-full max-w-3xl"
          />
          <div className="mt-4 border border-gray-300 rounded p-4 shadow">
            {horario ? (
              <p className="text-xl font-semibold text-gray-800">
                Horario de Atención: Todos los días. {horario.horaApertura}hs a {horario.horaCierre}hs - ¡Te esperamos!
              </p>
            ) : (
              <p className="text-xl font-semibold text-gray-800">
                Horario de Atención: 19:30hs a 23:30hs - ¡Te esperamos!
              </p>
            )}
          </div>
        </div>
      )}

      <main className="p-6 max-w-6xl mx-auto flex-grow text-center">
        {seccionActiva === "menu" && (
          <>
            {categoriaSeleccionada === null ? (
              <>
                {menuActivo ? (
                  <>
                    <h1 className="text-5xl font-bold mb-6">Nuestro Menú</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center">
                      {categorias.map((cat) => (
                        <div 
                          key={cat.key} 
                          className="text-center cursor-pointer w-80 h-80 flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-4" 
                          onClick={() => setCategoriaSeleccionada(cat.key)}
                        >
                          <Image 
                            src={cat.imagen} 
                            width={300} 
                            height={250} 
                            alt={cat.nombre} 
                            className="rounded-lg object-cover w-full h-48" 
                          />
                          <h2 className="text-3xl font-semibold mt-4">{cat.nombre}</h2>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="border border-gray-300 rounded p-4 shadow inline-block text-2xl font-bold text-center">
                    Nuestro menú estará disponible de {horario ? horario.horaApertura : "19:30"}hs a {horario ? horario.horaCierre : "23:30"}hs
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold mb-6 text-center">
                  {categorias.find((c) => c.key === categoriaSeleccionada)?.nombre}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
                  {productosFiltrados.map((producto) => (
                    <ProductCard 
                      key={producto.id} 
                      producto={producto} 
                      setPersonalizando={setPersonalizando} 
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
          </>
        )}

        {seccionActiva === "contacto" && (
          <>
            <h1 className="text-5xl font-bold mb-6">Contáctanos</h1>
            <p className="text-lg text-gray-700 max-w-2xl mb-8 mx-auto">
              ¡Estamos aquí para atenderte! Puedes visitarnos, o escribirnos por WhatsApp para cualquier consulta.
              También podes visitar nuestro perfil de Instagram!
            </p>
            <div className="mb-4">
              <SocialMedia />
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-3xl border border-gray-200 mx-auto">
              <h2 className="text-3xl font-semibold mb-4">Información de Contacto</h2>
              <p className="text-lg text-gray-800 mb-2"><strong>📞 Teléfono:</strong> +54 9 3513 03-0145 </p>
              <p className="text-lg text-gray-800 mb-2"><strong>📧 Email:</strong> albuche@gmail.com</p>
              <p className="text-lg text-gray-800 mb-4"><strong>📍 Dirección:</strong> Bv Pte. Umberto Arturo Illia 499, X5000 Córdoba</p>
              <h2 className="text-3xl font-semibold mt-6 mb-4">Ubicación</h2>
              <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border border-gray-300">
                <iframe
                  className="w-full h-full"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.699285500822!2d-64.18199622355561!3d-31.42241029654411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a367d526401d%3A0x1373c780e9a81e15!2sAl%20Buche!5e0!3m2!1ses!2sar!4v1740557635737!5m2!1ses!2sar"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </>
        )}
      </main>

      {categoriaSeleccionada === null && <Footer />}

      {/* Botón flotante y modal del carrito solo en la sección MENU */}
      {seccionActiva === "menu" && (
        <>
          <button 
            onClick={() => setCartOpen(!cartOpen)}
            className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-xl z-50"
          >
            {cartOpen ? "X" : "Carrito"}
          </button>
          <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
      )}
    </div>
  );
}
