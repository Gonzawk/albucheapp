"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Producto } from "../../../types/product";
import { motion } from "framer-motion";
import toppingsData from "../../../public/data/toppings.json";

interface ProductCardProps {
  producto: Producto;
  setPersonalizando: (value: boolean) => void;
}

export default function ProductCard({ producto, setPersonalizando }: ProductCardProps) {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [toppingsGlobales, setToppingsGlobales] = useState<Record<string, number>>({});
  const [precioTotal, setPrecioTotal] = useState(producto.precio);
  const [metodoEntrega, setMetodoEntrega] = useState<"retiro" | "delivery" | null>(null);
  
  // Personalización: Mayonesa y Queso
  const [conMayonesa, setConMayonesa] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [tipoQueso, setTipoQueso] = useState("");
  const cheeseTypes = ["Cheddar", "Mozzarella", "Parmesano"];

  // Método de Pago
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | null>(null);

  // Extras (con sus valores)
  const extrasOptions = ["Medallón de Carne", "Dips de Aderezo"];
  const extrasPrecios: Record<string, number> = {
    "Medallón de Carne": 50,
    "Dips de Aderezo": 20,
  };
  const [seleccionesExtras, setSeleccionesExtras] = useState<Record<string, boolean>>(
    extrasOptions.reduce((acc: Record<string, boolean>, extra) => {
      acc[extra] = false;
      return acc;
    }, {})
  );

  // Observaciones
  const [observaciones, setObservaciones] = useState("");

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

  // Datos para dirección en caso de Delivery
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [piso, setPiso] = useState("");
  const [departamento, setDepartamento] = useState("");

  const toggleTopping = (topping: string) => {
    setSeleccionesToppings((prev) => ({
      ...prev,
      [topping]: !prev[topping],
    }));
  };

  const toggleAderezo = (aderezo: string) => {
    setSeleccionesAderezos((prev) => ({
      ...prev,
      [aderezo]: !prev[aderezo],
    }));
  };

  const toggleExtra = (extra: string) => {
    setSeleccionesExtras((prev) => ({
      ...prev,
      [extra]: !prev[extra],
    }));
  };

  // Actualiza el precio total sumando base + costo de toppings + costo de extras
  useEffect(() => {
    const costoToppings = Object.entries(seleccionesToppings)
      .filter(([_, incluido]) => incluido)
      .reduce((total, [topping]) => total + (toppingsGlobales[topping] || 0), 0);
    const costoExtras = Object.entries(seleccionesExtras)
      .filter(([_, incluido]) => incluido)
      .reduce((total, [extra]) => total + (extrasPrecios[extra] || 0), 0);
    setPrecioTotal(producto.precio + costoToppings + costoExtras);
  }, [seleccionesToppings, seleccionesExtras, toppingsGlobales, producto.precio, extrasPrecios]);

  const generarPedido = () => {
    const aderezosSeleccionados = Object.entries(seleccionesAderezos)
      .filter(([_, incluido]) => incluido)
      .map(([aderezo]) => aderezo);

    const toppingsSeleccionados = Object.entries(seleccionesToppings)
      .filter(([_, incluido]) => incluido)
      .map(([topping]) => topping);

    const extrasSeleccionados = Object.entries(seleccionesExtras)
      .filter(([_, incluido]) => incluido)
      .map(([extra]) => extra);

    let mensaje = `🍔 *Pedido de ${producto.nombre}* 🍔\n\n`;
    mensaje += `💰 *Precio Total:* $${precioTotal}\n\n`;
    mensaje += `🥫 *Mayonesa casera:* ${conMayonesa ? "Sí" : "No"}\n`;
    mensaje += `🧀 *Con queso:* ${conQueso ? "Sí" : "No"}\n`;
    if (conQueso && tipoQueso) {
      mensaje += `🧀 *Tipo de queso:* ${tipoQueso}\n`;
    }
    mensaje += "\n";

    if (aderezosSeleccionados.length > 0) {
      mensaje += `🧂 *Aderezos:* ${aderezosSeleccionados.join(", ")}\n`;
    }
    if (toppingsSeleccionados.length > 0) {
      mensaje += `🧀 *Toppings (extra):* ${toppingsSeleccionados.join(", ")}\n`;
    }
    if (extrasSeleccionados.length > 0) {
      mensaje += `✨ *Extras:* ${extrasSeleccionados.join(", ")}\n`;
    }
    if (observaciones.trim()) {
      mensaje += `📝 *Observaciones:* ${observaciones}\n`;
    }

    // Entrega
    mensaje += `🚚 *Entrega:* ${metodoEntrega === "delivery" ? "Delivery" : "Retiro en el Local"}\n`;

    if (metodoEntrega === "delivery") {
      mensaje += `📍 *Dirección:*\n`;
      mensaje += `🏠 Calle: ${calle}\n`;
      mensaje += `🔢 Número: ${numero}\n`;
      if (piso.trim()) mensaje += `📏 Piso: ${piso}\n`;
      if (departamento.trim()) mensaje += `🚪 Departamento: ${departamento}\n`;
    }
    
    // Método de Pago
    mensaje += `💳 *Método de Pago:* ${
      metodoPago ? (metodoPago === "transferencia" ? "Transferencia" : "Efectivo") : "No seleccionado"
    }\n`;

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
          {/* Se agregó max-h-[90vh] y overflow-y-auto para permitir scroll */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4">{producto.nombre}</h3>

            {/* Personalización: Mayonesa y Queso */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Personalización</h3>
              <label className="block">
                <input
                  type="checkbox"
                  checked={conMayonesa}
                  onChange={() => setConMayonesa(!conMayonesa)}
                  className="mr-2"
                />
                Mayonesa casera
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  checked={conQueso}
                  onChange={() => setConQueso(!conQueso)}
                  className="mr-2"
                />
                Con queso
              </label>
              {conQueso && (
                <select
                  value={tipoQueso}
                  onChange={(e) => setTipoQueso(e.target.value)}
                  className="mt-2 p-2 border rounded"
                >
                  <option value="">Selecciona el tipo de queso</option>
                  {cheeseTypes.map((cheese) => (
                    <option key={cheese} value={cheese}>
                      {cheese}
                    </option>
                  ))}
                </select>
              )}
            </div>

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

            {/* Extras */}
            <h3 className="text-lg font-semibold mt-4 mb-4">Extras:</h3>
            {extrasOptions.map((extra) => (
              <label key={extra} className="block">
                <input
                  type="checkbox"
                  checked={seleccionesExtras[extra]}
                  onChange={() => toggleExtra(extra)}
                  className="mr-2"
                />
                {extra} (+${extrasPrecios[extra]})
              </label>
            ))}

            {/* Observaciones */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Observaciones:</h3>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese alguna observación..."
                className="w-full p-2 border rounded"
                rows={3}
              ></textarea>
            </div>

            <p className="text-lg font-bold mt-4">Total: ${precioTotal}</p>

            {/* Método de Entrega */}
            <div className="mt-4 flex justify-center gap-4">
              <button className={`px-4 py-2 rounded ${metodoEntrega === "retiro" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`} onClick={() => setMetodoEntrega("retiro")}>
                Retiro en el Local
              </button>
              <button className={`px-4 py-2 rounded ${metodoEntrega === "delivery" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`} onClick={() => setMetodoEntrega("delivery")}>
                Delivery
              </button>
            </div>

            {metodoEntrega === "delivery" && (
              <>
                <input type="text" placeholder="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} className="w-full p-2 border rounded mt-2" />
                <input type="text" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full p-2 border rounded mt-2" />
                <input type="text" placeholder="Piso" value={piso} onChange={(e) => setPiso(e.target.value)} className="w-full p-2 border rounded mt-2" />
                <input type="text" placeholder="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="w-full p-2 border rounded mt-2" />
              </>
            )}

            {/* Método de Pago */}
            <h3 className="text-lg font-semibold mt-4 mb-4">Elige tu método de Pago:</h3>
            <div className="mt-4 flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded ${metodoPago === "efectivo" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                onClick={() => setMetodoPago("efectivo")}
              >
                Efectivo
              </button>
              <button
                className={`px-4 py-2 rounded ${metodoPago === "transferencia" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                onClick={() => setMetodoPago("transferencia")}
              >
                Transferencia
              </button>
            </div>
            {metodoPago === "transferencia" && (
              <p className="mt-2 text-sm text-gray-700">
                Realiza la transferencia a: Banco XYZ, Cuenta: 123456789, CBU: 000000000
              </p>
            )}

            <button onClick={generarPedido} className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full">
              Pedir por WhatsApp
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
