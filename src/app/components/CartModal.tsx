"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { Pedido } from "../../../types/Pedido";
import { TipoProducto } from "../config/personalizacionConfig";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeItem, clearCart } = useCart();
  const [metodoEntrega, setMetodoEntrega] = useState<"retiro" | "delivery" | null>(null);
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [piso, setPiso] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [metodoPago, setMetodoPago] = useState<"Efectivo" | "Transferencia" | null>(null);
  const [nombreCliente, setNombreCliente] = useState("");

  const [mostrarConfirmacionPedido, setMostrarConfirmacionPedido] = useState(false);
  const [mostrarVaciarCarrito, setMostrarVaciarCarrito] = useState(false);

  // Si se utiliza la ubicación actual, se autocompletan calle y número (no editables)
  const [usarUbicacionActual, setUsarUbicacionActual] = useState(false);
  // Controla si se muestran los campos extras para piso y depto cuando se usa geolocalización
  const [mostrarCamposExtras, setMostrarCamposExtras] = useState(false);

  const totalCarrito = items.reduce((sum, item) => sum + item.precio, 0);

  // Obtiene la ubicación con alta precisión y autocompleta Calle y Número
  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Se guardan las coordenadas con prefijos para identificar que se usó geolocalización
          setCalle(`Lat: ${lat.toFixed(6)}`);
          setNumero(`Lng: ${lng.toFixed(6)}`);
          setUsarUbicacionActual(true);
        },
        (error) => {
          alert("No se pudo obtener la ubicación: " + error.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("La geolocalización no es soportada por su navegador.");
    }
  };

  const generarPedido = async () => {
    let mensaje = "NUEVO PEDIDO!\n\n";
    if (nombreCliente.trim()) {
      mensaje += `Nombre del Cliente: ${nombreCliente}\n\n`;
    }
    items.forEach((item) => {
      switch (item.personalizacion.tipo) {
        case TipoProducto.Tipo1: {
          const p = item.personalizacion as {
            tipo: TipoProducto.Tipo1;
            personalizacion: { conMayonesa: boolean; conQueso: boolean; tipoQueso: string };
            toppings: { id: number; nombre: string; precio: number }[];
            aderezos?: string[];
            observaciones?: string;
          };
          mensaje += `🍔 *${item.producto.nombre} (Promo Tipo 1)* 🍔\n\n`;
          mensaje += `Mayonesa: ${p.personalizacion.conMayonesa ? "Sí" : "No"}\n`;
          mensaje += `Con queso: ${p.personalizacion.conQueso ? "Sí" : "No"}\n`;
          if (p.personalizacion.conQueso && p.personalizacion.tipoQueso) {
            mensaje += `Tipo de queso: ${p.personalizacion.tipoQueso}\n`;
          }
          if (p.toppings && p.toppings.length > 0) {
            mensaje += `Toppings: ${p.toppings.map((t) => t.nombre).join(", ")}\n`;
          }
          if (p.aderezos && p.aderezos.length > 0) {
            mensaje += `Aderezos: ${p.aderezos.join(", ")}\n`;
          }
          if (p.observaciones && p.observaciones.trim()) {
            mensaje += `Observaciones: ${p.observaciones}\n`;
          }
          mensaje += `*Total:* $${item.precio}\n\n`;
          break;
        }
        case TipoProducto.Tipo2: {
          const p = item.personalizacion as {
            tipo: TipoProducto.Tipo2;
            subproducto1: { conMayonesa: boolean; conQueso: boolean; tipoQueso: string; aderezos: string[]; observaciones: string };
            subproducto2: { conMayonesa: boolean; conQueso: boolean; tipoQueso: string; aderezos: string[]; observaciones: string };
          };
          mensaje += `🍔 *${item.producto.nombre} (Tipo 2)* 🍔\n\n`;
          mensaje += `*Subproducto 1:*\n`;
          mensaje += `Mayonesa: ${p.subproducto1.conMayonesa ? "Sí" : "No"}\n`;
          mensaje += `Con queso: ${p.subproducto1.conQueso ? "Sí" : "No"}\n`;
          if (p.subproducto1.conQueso && p.subproducto1.tipoQueso) {
            mensaje += `Tipo de queso: ${p.subproducto1.tipoQueso}\n`;
          }
          if (p.subproducto1.aderezos && p.subproducto1.aderezos.length > 0) {
            mensaje += `Aderezos: ${p.subproducto1.aderezos.join(", ")}\n`;
          }
          if (p.subproducto1.observaciones && p.subproducto1.observaciones.trim()) {
            mensaje += `Observaciones: ${p.subproducto1.observaciones}\n`;
          }
          mensaje += `\n*Subproducto 2:*\n`;
          mensaje += `Mayonesa: ${p.subproducto2.conMayonesa ? "Sí" : "No"}\n`;
          mensaje += `Con queso: ${p.subproducto2.conQueso ? "Sí" : "No"}\n`;
          if (p.subproducto2.conQueso && p.subproducto2.tipoQueso) {
            mensaje += `Tipo de queso: ${p.subproducto2.tipoQueso}\n`;
          }
          if (p.subproducto2.aderezos && p.subproducto2.aderezos.length > 0) {
            mensaje += `Aderezos: ${p.subproducto2.aderezos.join(", ")}\n`;
          }
          if (p.subproducto2.observaciones && p.subproducto2.observaciones.trim()) {
            mensaje += `Observaciones: ${p.subproducto2.observaciones}\n`;
          }
          mensaje += `*Total:* $${item.precio}\n\n`;
          break;
        }
        case TipoProducto.Tipo3: {
          const p = item.personalizacion as {
            tipo: TipoProducto.Tipo3;
            conMayonesa: boolean;
            conQueso: boolean;
            tipoQueso: string;
            toppings: { id: number; nombre: string; precio: number }[];
            aderezos: string[];
            extras: string[];
            observaciones?: string;
          };
          mensaje += `🍔 *${item.producto.nombre} (Hamburguesa Completa)* 🍔\n\n`;
          mensaje += `Mayonesa: ${p.conMayonesa ? "Sí" : "No"}\n`;
          mensaje += `Con queso: ${p.conQueso ? "Sí" : "No"}\n`;
          if (p.conQueso && p.tipoQueso) {
            mensaje += `Tipo de queso: ${p.tipoQueso}\n`;
          }
          if (p.toppings && p.toppings.length > 0) {
            mensaje += `Toppings: ${p.toppings.map((t) => t.nombre).join(", ")}\n`;
          }
          if (p.aderezos && p.aderezos.length > 0) {
            mensaje += `Aderezos: ${p.aderezos.join(", ")}\n`;
          }
          if (p.extras && p.extras.length > 0) {
            mensaje += `Extras: ${p.extras.join(", ")}\n`;
          }
          if (p.observaciones && p.observaciones.trim()) {
            mensaje += `Observaciones: ${p.observaciones}\n`;
          }
          mensaje += `*Total:* $${item.precio}\n\n`;
          break;
        }
        case TipoProducto.Tipo4: {
          const p = item.personalizacion as {
            tipo: TipoProducto.Tipo4;
            aderezos: string[];
            toppings: { id: number; nombre: string; precio: number }[];
            observaciones: string;
          };
          mensaje += `🥪 *${item.producto.nombre} (Sandwich)* 🥪\n\n`;
          if (p.aderezos && p.aderezos.length > 0) {
            mensaje += `Aderezos: ${p.aderezos.join(", ")}\n`;
          }
          if (p.toppings && p.toppings.length > 0) {
            mensaje += `Toppings: ${p.toppings.map((t) => t.nombre).join(", ")}\n`;
          }
          if (p.observaciones && p.observaciones.trim()) {
            mensaje += `Observaciones: ${p.observaciones}\n`;
          }
          mensaje += `*Total:* $${item.precio}\n\n`;
          break;
        }
        case TipoProducto.Tipo5:
        case TipoProducto.Tipo6: {
          const p = item.personalizacion as {
            tipo: TipoProducto.Tipo5 | TipoProducto.Tipo6;
            observaciones: string;
          };
          mensaje += `🍽 *${item.producto.nombre}* 🍽\n\n`;
          if (p.observaciones && p.observaciones.trim()) {
            mensaje += `Observaciones: ${p.observaciones}\n`;
          }
          mensaje += `*Total:* $${item.precio}\n\n`;
          break;
        }
        default:
          mensaje += `*${item.producto.nombre}*\nPrecio: $${item.precio}\n\n`;
      }
    });

    if (metodoEntrega) {
      mensaje += `Método de entrega: ${metodoEntrega === "delivery" ? "Delivery" : "Retiro en el Local"}\n`;
      if (metodoEntrega === "delivery") {
        // Para el mensaje se arma la dirección completa, incluyendo piso y departamento (si se ingresan)
        let mensajeDireccion = "";
        let mapsQuery = "";
        if (calle.startsWith("Lat:")) {
          const lat = calle.replace("Lat:", "").trim();
          const lng = numero.replace("Lng:", "").trim();
          mensajeDireccion = `Ubicación: ${lat}, ${lng}`;
          mapsQuery = `${lat},${lng}`;
        } else {
          mensajeDireccion = `Dirección: Calle ${calle}, Nº ${numero}`;
          mapsQuery = `Calle ${calle}, Nº ${numero}`;
        }
        // Se adjunta piso y depto en el mensaje (pero no se usan en el enlace)
        if (piso.trim()) mensajeDireccion += `, Piso: ${piso}`;
        if (departamento.trim()) mensajeDireccion += `, Departamento: ${departamento}`;
        mensaje += `${mensajeDireccion}\n`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
        mensaje += `Ver ubicación en Maps: ${googleMapsUrl}\n`;
      }
    }
    if (metodoPago) {
      mensaje += `Método de pago: ${metodoPago}\n`;
      if (metodoPago === "Transferencia") {
        mensaje += `Realizar transferencia a: Banco XYZ, Cuenta: 123456789, CBU: 000000000\n`;
      }
    }
    mensaje += `\n*Total del Carrito: $${totalCarrito}*\n`;
    mensaje += "\n✅ *Por favor, confirma mi pedido. ¡Gracias!*";

    const pedidoData = {
      nombreCliente,
      metodoEntrega,
      direccion: metodoEntrega === "delivery" ? { calle, numero, piso, departamento } : null,
      metodoPago,
      items,
      total: totalCarrito,
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const payload: Pedido = {
      id: 0,
      orden: JSON.stringify(pedidoData),
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString(),
      fechaFinalizacion: null,
    };

    try {
      const response = await fetch(`${apiUrl}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error("Error al guardar el pedido en la DB");
        return;
      }
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      return;
    }

    const numeroTelefono = "+543832460459";
    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    setMostrarConfirmacionPedido(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 w-11/12 max-w-lg mx-4 h-5/6 overflow-y-auto relative rounded shadow-lg">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
            Cerrar
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">Carrito</h2>
          {items.length === 0 ? (
            <p className="text-center">No hay productos en el carrito.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => {
                switch (item.personalizacion.tipo) {
                  case TipoProducto.Tipo1: {
                    const p = item.personalizacion as {
                      tipo: TipoProducto.Tipo1;
                      personalizacion: { conMayonesa: boolean; conQueso: boolean; tipoQueso: string };
                      toppings: { id: number; nombre: string; precio: number }[];
                      aderezos?: string[];
                      observaciones?: string;
                    };
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">
                          {item.producto.nombre} (Promo)
                        </h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          <li>Mayonesa: {p.personalizacion.conMayonesa ? "Sí" : "No"}</li>
                          <li>Con queso: {p.personalizacion.conQueso ? "Sí" : "No"}</li>
                          {p.personalizacion.conQueso && p.personalizacion.tipoQueso && (
                            <li>Tipo de queso: {p.personalizacion.tipoQueso}</li>
                          )}
                          {p.toppings && p.toppings.length > 0 && (
                            <li>Toppings: {p.toppings.map((t) => t.nombre).join(", ")}</li>
                          )}
                          {p.aderezos && p.aderezos.length > 0 && (
                            <li>Aderezos: {p.aderezos.join(", ")}</li>
                          )}
                          {p.observaciones && p.observaciones.trim() && (
                            <li>Observaciones: {p.observaciones}</li>
                          )}
                        </ul>
                        <div className="mt-2 flex justify-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }
                  case TipoProducto.Tipo2: {
                    const p = item.personalizacion as {
                      tipo: TipoProducto.Tipo2;
                      subproducto1: { conMayonesa: boolean; conQueso: boolean; tipoQueso: string; aderezos: string[]; observaciones: string };
                      subproducto2: { conMayonesa: boolean; conQueso: boolean; tipoQueso: string; aderezos: string[]; observaciones: string };
                    };
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">
                          {item.producto.nombre} (Promo)
                        </h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <div className="mt-2">
                          <div className="border border-gray-200 p-2 rounded mb-2">
                            <p className="font-medium">Producto 1:</p>
                            <ul className="text-sm text-gray-700 mt-1 space-y-1">
                              <li>Mayonesa: {p.subproducto1.conMayonesa ? "Sí" : "No"}</li>
                              <li>Con queso: {p.subproducto1.conQueso ? "Sí" : "No"}</li>
                              {p.subproducto1.conQueso && p.subproducto1.tipoQueso && (
                                <li>Tipo de queso: {p.subproducto1.tipoQueso}</li>
                              )}
                              {p.subproducto1.aderezos && p.subproducto1.aderezos.length > 0 && (
                                <li>Aderezos: {p.subproducto1.aderezos.join(", ")}</li>
                              )}
                              {p.subproducto1.observaciones && p.subproducto1.observaciones.trim() && (
                                <li>Observaciones: {p.subproducto1.observaciones}</li>
                              )}
                            </ul>
                          </div>
                          <div className="border border-gray-200 p-2 rounded">
                            <p className="font-medium">Producto 2:</p>
                            <ul className="text-sm text-gray-700 mt-1 space-y-1">
                              <li>Mayonesa: {p.subproducto2.conMayonesa ? "Sí" : "No"}</li>
                              <li>Con queso: {p.subproducto2.conQueso ? "Sí" : "No"}</li>
                              {p.subproducto2.conQueso && p.subproducto2.tipoQueso && (
                                <li>Tipo de queso: {p.subproducto2.tipoQueso}</li>
                              )}
                              {p.subproducto2.aderezos && p.subproducto2.aderezos.length > 0 && (
                                <li>Aderezos: {p.subproducto2.aderezos.join(", ")}</li>
                              )}
                              {p.subproducto2.observaciones && p.subproducto2.observaciones.trim() && (
                                <li>Observaciones: {p.subproducto2.observaciones}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }
                  case TipoProducto.Tipo3: {
                    const p = item.personalizacion as {
                      tipo: TipoProducto.Tipo3;
                      conMayonesa: boolean;
                      conQueso: boolean;
                      tipoQueso: string;
                      toppings: { id: number; nombre: string; precio: number }[];
                      aderezos: string[];
                      extras: string[];
                      observaciones?: string;
                    };
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">
                          {item.producto.nombre} (Hamburguesa Completa)
                        </h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          <li>Mayonesa: {p.conMayonesa ? "Sí" : "No"}</li>
                          <li>Con queso: {p.conQueso ? "Sí" : "No"}</li>
                          {p.conQueso && p.tipoQueso && (
                            <li>Tipo de queso: {p.tipoQueso}</li>
                          )}
                          {p.toppings && p.toppings.length > 0 && (
                            <li>Toppings: {p.toppings.map(t => t.nombre).join(", ")}</li>
                          )}
                          {p.aderezos && p.aderezos.length > 0 && (
                            <li>Aderezos: {p.aderezos.join(", ")}</li>
                          )}
                          {p.extras && p.extras.length > 0 && (
                            <li>Extras: {p.extras.join(", ")}</li>
                          )}
                          {p.observaciones && p.observaciones.trim() && (
                            <li>Observaciones: {p.observaciones}</li>
                          )}
                        </ul>
                        <div className="mt-2 flex justify-center">
                          <button onClick={() => removeItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }
                  case TipoProducto.Tipo4: {
                    const p = item.personalizacion as {
                      tipo: TipoProducto.Tipo4;
                      aderezos: string[];
                      toppings: { id: number; nombre: string; precio: number }[];
                      observaciones: string;
                    };
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">
                          {item.producto.nombre} (Sandwich)
                        </h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          {p.aderezos && p.aderezos.length > 0 && (
                            <li>Aderezos: {p.aderezos.join(", ")}</li>
                          )}
                          {p.toppings && p.toppings.length > 0 && (
                            <li>Toppings: {p.toppings.map(t => t.nombre).join(", ")}</li>
                          )}
                          {p.observaciones && p.observaciones.trim() && (
                            <li>Observaciones: {p.observaciones}</li>
                          )}
                        </ul>
                        <div className="mt-2 flex justify-center">
                          <button onClick={() => removeItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }
                  case TipoProducto.Tipo5:
                  case TipoProducto.Tipo6: {
                    const p = item.personalizacion as {
                      tipo: TipoProducto.Tipo5 | TipoProducto.Tipo6;
                      observaciones: string;
                    };
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">{item.producto.nombre}</h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          {p.observaciones && p.observaciones.trim() && (
                            <li>Observaciones: {p.observaciones}</li>
                          )}
                        </ul>
                        <div className="mt-2 flex justify-center">
                          <button onClick={() => removeItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </div>
          )}
          {items.length > 0 && (
            <>
              <div className="mt-4 flex flex-col gap-4">
                <div className="border border-gray-300 p-4 rounded-lg shadow-sm">
                  <p className="font-bold">Nombre del Cliente</p>
                  <input
                    type="text"
                    placeholder="Ingrese su nombre"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="w-full p-2 border rounded mt-2"
                  />
                </div>
                <div className="border border-gray-300 p-4 rounded-lg shadow-sm">
                  <p className="font-bold">Método de Entrega</p>
                  <div className="mt-2 flex justify-center gap-4">
                    <button
                      className={`px-4 py-2 rounded ${metodoEntrega === "retiro" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                      onClick={() => setMetodoEntrega("retiro")}
                    >
                      Retiro en el Local
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${metodoEntrega === "delivery" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                      onClick={() => setMetodoEntrega("delivery")}
                    >
                      Delivery
                    </button>
                  </div>
                  {metodoEntrega === "delivery" && (
                    <div className="mt-4">
                      {!usarUbicacionActual ? (
                        <>
                          <button onClick={obtenerUbicacion} className="bg-blue-500 text-white px-4 py-2 rounded mb-2">
                            Utilizar mi ubicación actual
                          </button>
                          <input
                            type="text"
                            placeholder="Calle"
                            value={calle}
                            onChange={(e) => setCalle(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                          />
                          <input
                            type="text"
                            placeholder="Número"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                          />
                          <input
                            type="text"
                            placeholder="Piso"
                            value={piso}
                            onChange={(e) => setPiso(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                          />
                          <input
                            type="text"
                            placeholder="Departamento"
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </>
                      ) : (
                        <>
                          <p className="mb-2">
                            Ubicación actual obtenida: <span className="font-semibold">{calle}</span> y{" "}
                            <span className="font-semibold">{numero}</span>.
                          </p>
                          <div className="flex gap-4 mb-2 items-center">
                            <span className="text-sm">¿Desea indicar piso o depto?</span>
                            <button onClick={() => setMostrarCamposExtras(true)} className="bg-green-500 text-white px-4 py-2 rounded text-sm">
                              Sí
                            </button>
                            <button onClick={() => setMostrarCamposExtras(false)} className="bg-gray-200 text-black px-4 py-2 rounded text-sm">
                              No
                            </button>
                          </div>
                          {mostrarCamposExtras && (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                placeholder="Piso"
                                value={piso}
                                onChange={(e) => setPiso(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                              <input
                                type="text"
                                placeholder="Departamento"
                                value={departamento}
                                onChange={(e) => setDepartamento(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="border border-gray-300 p-4 rounded-lg shadow-sm">
                  <p className="font-bold">Método de Pago</p>
                  <div className="mt-2 flex justify-center gap-4">
                    <button
                      className={`px-4 py-2 rounded ${metodoPago === "Efectivo" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                      onClick={() => setMetodoPago("Efectivo")}
                    >
                      Efectivo
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${metodoPago === "Transferencia" ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                      onClick={() => setMetodoPago("Transferencia")}
                    >
                      Transferencia
                    </button>
                  </div>
                  {metodoPago === "Transferencia" && (
                    <div className="mt-4 border border-gray-300 p-2 rounded">
                      <p className="text-sm">BANCO GALICIA</p>
                      <p className="text-sm">TITULAR: Carla Sofia Gigena Holvoet</p>
                      <p className="text-sm">DU: 39825818</p>
                      <p className="text-sm">CTA: 4011194-5 344-1</p>
                      <p className="text-sm">CBU: 0070344230004011194511</p>
                      <p className="text-sm">ALIAS: ALBUCHENUEVA</p>
                      <p className="mt-2 text-sm font-bold text-center">
                        Por favor enviar el comprobante por whatsapp en cuanto se confirme el pedido.
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold mt-0 mb-2">Total del Carrito: ${totalCarrito}</p>
              </div>
              <button onClick={generarPedido} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                Realizar Pedido
              </button>
            </>
          )}
        </div>
      </motion.div>

      {mostrarConfirmacionPedido && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center mx-4">
            <Image
              className="mx-auto"
              src="https://i.ibb.co/bgVxMWhC/confirmation-1152155-960-720.webp"
              alt="Confirmación"
              width={100}
              height={100}
              unoptimized
            />
            <p className="mt-4 text-lg font-bold">
              Listo, ahora aguarde la confirmación de su pedido por WhatsApp. Muchas Gracias.
            </p>
            {metodoPago === "Transferencia" && (
              <p className="mt-2 text-md">
                Recuerde enviar el comprobante por WhatsApp tan pronto se confirme el pedido.
              </p>
            )}
            <button
              onClick={() => {
                setMostrarConfirmacionPedido(false);
                setMostrarVaciarCarrito(true);
              }}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded"
            >
              Aceptar
            </button>
          </div>
        </motion.div>
      )}

      {mostrarVaciarCarrito && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center mx-4">
            <p className="mt-4 text-lg font-bold">¿Desea vaciar el carrito?</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  clearCart();
                  setMostrarVaciarCarrito(false);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Sí
              </button>
              <button onClick={() => setMostrarVaciarCarrito(false)} className="bg-red-500 text-white px-4 py-2 rounded">
                No
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
