"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

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

  const totalCarrito = items.reduce((sum, item) => sum + item.precio, 0);

  const generarPedido = () => {
    let mensaje = "NUEVO PEDIDO!\n\n";
    if (nombreCliente.trim()) {
      mensaje += `Nombre del Cliente: ${nombreCliente}\n\n`;
    }
    items.forEach(item => {
      if ("hamburguesas" in item.personalizacion) {
        mensaje += `🍔 *${item.producto.nombre} (Promo)* 🍔\n\n`;
        (item.personalizacion as any).hamburguesas.forEach((prod: any, index: number) => {
          mensaje += `*Producto ${index + 1}:*\n`;
          mensaje += `Mayonesa: ${prod.conMayonesa ? "Sí" : "No"}\n`;
          mensaje += `Con queso: ${prod.conQueso ? "Sí" : "No"}\n`;
          if (prod.conQueso && prod.tipoQueso) {
            mensaje += `Tipo de queso: ${prod.tipoQueso}\n`;
          }
          const aderezosSel = Object.entries(prod.seleccionesAderezos)
            .filter(([_, incluido]) => incluido)
            .map(([aderezo]) => aderezo);
          if (aderezosSel.length) {
            mensaje += `Aderezos: ${aderezosSel.join(", ")}\n`;
          }
          if (prod.observaciones.trim()) {
            mensaje += `Observaciones: ${prod.observaciones}\n`;
          }
          mensaje += "\n";
        });
        mensaje += `*Total Promo:* $${item.precio}\n\n`;
      } else {
        const tipo = (item.personalizacion as any).tipo;
        mensaje += `🍔 *${item.producto.nombre}* 🍔\n\n`;
        mensaje += `Precio: $${item.precio}\n`;
        if (tipo === "completo") {
          const { conMayonesa, conQueso, tipoQueso, aderezos, toppings, extras, observaciones } = item.personalizacion as any;
          mensaje += `Mayonesa: ${conMayonesa ? "Sí" : "No"}\n`;
          mensaje += `Con queso: ${conQueso ? "Sí" : "No"}\n`;
          if (conQueso && tipoQueso) {
            mensaje += `Tipo de queso: ${tipoQueso}\n`;
          }
          if (aderezos && aderezos.length > 0) {
            mensaje += `Aderezos: ${aderezos.join(", ")}\n`;
          }
          if (toppings && toppings.length > 0) {
            mensaje += `Toppings: ${toppings.join(", ")}\n`;
          }
          if (extras && extras.length > 0) {
            mensaje += `Extras: ${extras.join(", ")}\n`;
          }
          if (observaciones.trim()) {
            mensaje += `Observaciones: ${observaciones}\n`;
          }
        } else if (tipo === "observaciones") {
          const { observaciones } = item.personalizacion as any;
          if (observaciones.trim()) {
            mensaje += `Observaciones: ${observaciones}\n`;
          }
        } else if (tipo === "acompanar") {
          const { opcion, dips, observaciones } = item.personalizacion as any;
          mensaje += `Opción principal: ${opcion}\n`;
          if (dips && dips.length > 0) {
            mensaje += `DIPS: ${dips.join(", ")}\n`;
          }
          if (observaciones.trim()) {
            mensaje += `Observaciones: ${observaciones}\n`;
          }
        } else if (tipo === "sandwich") {
          const { aderezos, toppings, observaciones } = item.personalizacion as any;
          if (aderezos && aderezos.length > 0) {
            mensaje += `Aderezos: ${aderezos.join(", ")}\n`;
          }
          if (toppings && toppings.length > 0) {
            mensaje += `Toppings: ${toppings.join(", ")}\n`;
          }
          if (observaciones.trim()) {
            mensaje += `Observaciones: ${observaciones}\n`;
          }
        }
        mensaje += "\n";
      }
    });

    if (metodoEntrega) {
      mensaje += `Método de entrega: ${metodoEntrega === "delivery" ? "Delivery" : "Retiro en el Local"}\n`;
      if (metodoEntrega === "delivery") {
        mensaje += `Dirección: Calle ${calle}, Número ${numero}`;
        if (piso.trim()) mensaje += `, Piso: ${piso}`;
        if (departamento.trim()) mensaje += `, Departamento: ${departamento}`;
        mensaje += "\n";
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
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            Cerrar
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">Carrito</h2>
          {items.length === 0 ? (
            <p className="text-center">No hay productos en el carrito.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map(item => {
                if ("hamburguesas" in item.personalizacion) {
                  const promoPersonalizacion = item.personalizacion as {
                    hamburguesas: Array<{
                      conMayonesa: boolean;
                      conQueso: boolean;
                      tipoQueso: string;
                      seleccionesAderezos: Record<string, boolean>;
                      observaciones: string;
                    }>;
                  };
                  return (
                    <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                      <h3 className="font-bold text-lg text-center">
                        {item.producto.nombre} (Promo)
                      </h3>
                      <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {promoPersonalizacion.hamburguesas.map((prod, index) => (
                          <div key={index} className="border border-gray-200 p-2 rounded">
                            <p className="font-medium">Producto {index + 1}:</p>
                            <ul className="text-sm text-gray-700 mt-1 space-y-1">
                              <li>Mayonesa: {prod.conMayonesa ? "Sí" : "No"}</li>
                              <li>Con queso: {prod.conQueso ? "Sí" : "No"}</li>
                              {prod.conQueso && prod.tipoQueso && (
                                <li>Tipo de queso: {prod.tipoQueso}</li>
                              )}
                              <li>
                                Aderezos:{" "}
                                {Object.entries(prod.seleccionesAderezos)
                                  .filter(([_, incluido]) => incluido)
                                  .map(([aderezo]) => aderezo)
                                  .join(", ")}
                              </li>
                              {prod.observaciones && (
                                <li>Observaciones: {prod.observaciones}</li>
                              )}
                            </ul>
                          </div>
                        ))}
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
                } else {
                  const personalizacion = item.personalizacion as any;
                  if (personalizacion.tipo === "completo") {
                    const { conMayonesa, conQueso, tipoQueso, aderezos, toppings, extras, observaciones } = personalizacion;
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">{item.producto.nombre}</h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          <li>Mayonesa: {conMayonesa ? "Sí" : "No"}</li>
                          <li>Con queso: {conQueso ? "Sí" : "No"}</li>
                          {conQueso && tipoQueso && <li>Tipo de queso: {tipoQueso}</li>}
                          {aderezos && aderezos.length > 0 && <li>Aderezos: {aderezos.join(", ")}</li>}
                          {toppings && toppings.length > 0 && <li>Toppings: {toppings.join(", ")}</li>}
                          {extras && extras.length > 0 && <li>Extras: {extras.join(", ")}</li>}
                          {observaciones.trim() && <li>Observaciones: {observaciones}</li>}
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
                  } else if (personalizacion.tipo === "observaciones") {
                    const { observaciones } = personalizacion;
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">{item.producto.nombre}</h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          {observaciones.trim() && <li>Observaciones: {observaciones}</li>}
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
                  } else if (personalizacion.tipo === "acompanar") {
                    const { opcion, dips, observaciones } = personalizacion;
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">{item.producto.nombre}</h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          <li>Opción principal: {opcion}</li>
                          {dips && dips.length > 0 && <li>DIPS: {dips.join(", ")}</li>}
                          {observaciones.trim() && <li>Observaciones: {observaciones}</li>}
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
                  } else if (personalizacion.tipo === "sandwich") {
                    const { aderezos, toppings, observaciones } = personalizacion;
                    return (
                      <div key={item.id} className="border border-gray-300 p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-center">{item.producto.nombre}</h3>
                        <p className="text-sm font-semibold text-center">Precio: ${item.precio}</p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          {aderezos && aderezos.length > 0 && <li>Aderezos: {aderezos.join(", ")}</li>}
                          {toppings && toppings.length > 0 && <li>Toppings: {toppings.join(", ")}</li>}
                          {observaciones.trim() && <li>Observaciones: {observaciones}</li>}
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
                  } else {
                    return null;
                  }
                }
              })}
            </div>
          )}
          {items.length > 0 && (
            <>
              <div className="mt-4 flex flex-col gap-4">
                {/* Sección para ingresar el nombre del cliente */}
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
              <button 
                onClick={generarPedido}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
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
              src="https://i.ibb.co/bgVxMWhC/confirmation-1152155-960-720.webp" // Reemplaza con el enlace directo de imgbb para la imagen SVG de confirmación
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
              <button
                onClick={() => setMostrarVaciarCarrito(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
