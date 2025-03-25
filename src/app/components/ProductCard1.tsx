"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Producto } from "../../../types/Producto";
import { motion } from "framer-motion";
import toppingsData from "../../../public/data/toppings.json";

interface ProductCard1Props {
  producto: Producto;
  setPersonalizando: (value: boolean) => void;
  numeroMesa: string; // Se recibe el número de mesa como prop
}

export default function ProductCard1({ producto, setPersonalizando, numeroMesa }: ProductCard1Props) {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [toppingsGlobales, setToppingsGlobales] = useState<Record<string, number>>({});
  const [precioTotal, setPrecioTotal] = useState(producto.precio);

  useEffect(() => {
    setToppingsGlobales(toppingsData);
  }, []);

  const aderezos = producto.aderezos || [];

  const [seleccionesAderezos, setSeleccionesAderezos] = useState<Record<string, boolean>>(
    aderezos.reduce((acc: Record<string, boolean>, aderezo: string) => {
      acc[aderezo] = true;
      return acc;
    }, {})
  );

  const [seleccionesToppings, setSeleccionesToppings] = useState<Record<string, boolean>>({});

  const toggleTopping = (topping: string) => {
    setSeleccionesToppings((prev) => {
      const nuevoEstado = { ...prev, [topping]: !prev[topping] };
      actualizarPrecioTotal(nuevoEstado);
      return nuevoEstado;
    });
  };

  const actualizarPrecioTotal = (toppingsSeleccionados: Record<string, boolean>) => {
    const precioToppings = Object.entries(toppingsSeleccionados)
      .filter(([_, incluido]) => incluido)
      .reduce((total, [topping]) => total + (toppingsGlobales[topping] || 0), 0);

    setPrecioTotal(producto.precio + precioToppings);
  };

  const toggleAderezo = (aderezo: string) => {
    setSeleccionesAderezos((prev) => ({
      ...prev,
      [aderezo]: !prev[aderezo],
    }));
  };

  const generarPedido = () => {
    const aderezosSeleccionados = Object.entries(seleccionesAderezos)
      .filter(([_, incluido]) => incluido)
      .map(([aderezo]) => aderezo);

    const toppingsSeleccionados = Object.entries(seleccionesToppings)
      .filter(([_, incluido]) => incluido)
      .map(([topping]) => topping);

    let mensaje = `📌 *PEDIDO EN EL LOCAL - MESA ${numeroMesa}*\n\n`;
    mensaje += `🍔 *Pedido de ${producto.nombre}* 🍔\n\n`;
    mensaje += `💰 *Precio Total:* $${precioTotal}\n\n`;

    if (aderezosSeleccionados.length > 0) {
      mensaje += `🧂 *Aderezos:* ${aderezosSeleccionados.join(", ")}\n`;
    }
    if (toppingsSeleccionados.length > 0) {
      mensaje += `🧀 *Toppings (extra):* ${toppingsSeleccionados.join(", ")}\n`;
    }

    mensaje += "\n✅ *Por favor, confirma mi pedido. ¡Gracias!*";

    const numeroTelefono = "+543513030145";
    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg text-center relative w-80 min-h-[450px] flex flex-col justify-between">
      <div className="w-full h-48 flex justify-center items-center overflow-hidden">
        <Image loader={() => producto.imagen} src={producto.imagen} width={350} height={250} alt={producto.nombre} className="rounded-lg object-cover w-full h-full" unoptimized priority />
      </div>
      <h2 className="text-2xl font-semibold mt-4">{producto.nombre}</h2>
      <p className="text-gray-700 mt-2">{producto.descripcion}</p>
      <span className="text-black-600 font-bold text-xl block mt-4">Precio Base: ${producto.precio}</span>

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

            {/* Aderezos */}
            <h3 className="text-lg font-semibold mb-4">Elige tus Aderezos:</h3>
            {aderezos.map((aderezo) => (
              <label key={aderezo} className="block">
                <input
                  type="checkbox"
                  checked={seleccionesAderezos[aderezo]}
                  onChange={() => toggleAderezo(aderezo)}
                  className="mr-2"
                />
                {aderezo}
              </label>
            ))}

            {/* Toppings */}
            <h3 className="text-lg font-semibold mt-4 mb-4">Agrega Toppings (con costo adicional):</h3>
            {Object.keys(toppingsGlobales).map((topping) => (
              <label key={topping} className="block">
                <input
                  type="checkbox"
                  checked={seleccionesToppings[topping] || false}
                  onChange={() => toggleTopping(topping)}
                  className="mr-2"
                />
                {topping} (+${toppingsGlobales[topping]})
              </label>
            ))}

            <p className="text-lg font-bold mt-4">Total: ${precioTotal}</p>

            <button onClick={generarPedido} className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full">
              Realizar Pedido
            </button>
            <button
              onClick={() => {
                setMostrarOpciones(false);
                setPersonalizando(false);
              }}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Volver atrás
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
