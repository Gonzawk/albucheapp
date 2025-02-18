"use client";
import { useState } from 'react';
import Image from 'next/image';
import { Producto } from '../../../types/product';
import { motion } from 'framer-motion';

interface ProductCardProps {
  producto: Producto;
  setPersonalizando: (value: boolean) => void;
}

export default function ProductCard({ producto, setPersonalizando }: ProductCardProps) {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [selecciones, setSelecciones] = useState<Record<string, boolean>>(
    producto.ingredientes.reduce((acc: Record<string, boolean>, ing: string) => {
      acc[ing] = true;
      return acc;
    }, {})
  );
  const [delivery, setDelivery] = useState(false);
  const [direccion, setDireccion] = useState("");

  const toggleIngrediente = (ingrediente: string) => {
    setSelecciones(prev => ({
      ...prev,
      [ingrediente]: !prev[ingrediente]
    }));
  };

  const generarPedido = () => {
    const ingredientesSeleccionados = Object.entries(selecciones)
      .filter(([_, incluido]) => incluido)
      .map(([ing]) => ing);
    
    const ingredientesEliminados = Object.entries(selecciones)
      .filter(([_, incluido]) => !incluido)
      .map(([ing]) => ing);
    
    let mensaje = `Hola! Quiero pedir una *${producto.nombre}*`;
    if (ingredientesSeleccionados.length > 0) {
      mensaje += ` con: ${ingredientesSeleccionados.join(", ")}.`;
    }
    if (ingredientesEliminados.length > 0) {
      mensaje += ` Sin: ${ingredientesEliminados.join(", ")}.`;
    }
    if (delivery && direccion.trim() !== "") {
      mensaje += ` Enviar a: ${direccion}.`;
    }
    
    const numeroTelefono = "+543832400230"; // Reemplaza con el número correcto
    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg text-center relative w-80 min-h-[450px] flex flex-col justify-between">
      <div className="w-full h-48 flex justify-center items-center overflow-hidden">
        <Image loader={() => producto.imagen} src={producto.imagen} width={350} height={250} alt={producto.nombre} className="rounded-lg object-cover w-full h-full" unoptimized priority />
      </div>
      <h2 className="text-2xl font-semibold mt-4">{producto.nombre}</h2>
      <p className="text-gray-700 mt-2">{producto.descripcion}</p>
      <span className="text-black-600 font-bold text-xl block mt-4">${producto.precio}</span>
      
      <button
        onClick={() => {
          setMostrarOpciones(true);
          setPersonalizando(true);
        }}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Personalizar
      </button>
      
      {mostrarOpciones && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h3 className="text-2xl font-semibold mb-4">{producto.nombre}</h3>

            <h3 className="text-lg font-semibold mb-4">Personaliza tu pedido:</h3>
            {producto.ingredientes.map(ing => (
              <label key={ing} className="block">
                <input
                  type="checkbox"
                  checked={selecciones[ing]}
                  onChange={() => toggleIngrediente(ing)}
                  className="mr-2"
                />
                {ing}
              </label>
            ))}
            
            <div className="mt-4 text-center">
              <label className="block text-lg font-semibold mb-2">
                <input
                  type="checkbox"
                  checked={delivery}
                  onChange={() => setDelivery(!delivery)}
                  className="mr-2"
                />
                ¿Necesitas delivery?
              </label>
              {delivery && (
                <input
                  type="text"
                  placeholder="Ingresa tu dirección"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-2 border rounded text-gray-900 text-center"
                />
              )}
            </div>
            
            <button onClick={generarPedido} className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full">
              Pedir por WhatsApp
            </button>
            <button onClick={() => {
              setMostrarOpciones(false);
              setPersonalizando(false);
            }} className="mt-2 bg-red-500 text-white px-4 py-2 rounded w-full">
              Volver atrás
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
