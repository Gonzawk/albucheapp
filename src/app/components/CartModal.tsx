"use client";
import { useState } from "react";
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

  const totalCarrito = items.reduce((sum, item) => sum + item.precio, 0);

  const generarPedido = () => {
    let mensaje = "";
    items.forEach(item => {
      if ("hamburguesas" in item.personalizacion) {
        mensaje += `🍔 *${item.producto.nombre} (Promo)* 🍔\n\n`;
        (item.personalizacion as any).hamburguesas.forEach((prod: any, index: number) => {
          mensaje += `*Producto ${index + 1}:*\n`;
          // Se elimina la línea de precio en cada producto
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
        // Se muestra el precio total de la promo una sola vez
        mensaje += `Total Promo: $${item.precio}\n\n`;
      } else {
        mensaje += `🍔 *${item.producto.nombre}* 🍔\n\n`;
        const { conMayonesa, conQueso, tipoQueso, aderezos, toppings, extras, observaciones } = item.personalizacion;
        mensaje += `Precio: $${item.precio}\n`;
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
        mensaje += "\n";
      }
    });

    // Agregar información del método de entrega
    if (metodoEntrega) {
      mensaje += `Método de entrega: ${metodoEntrega === "delivery" ? "Delivery" : "Retiro en el Local"}\n`;
      if (metodoEntrega === "delivery") {
        mensaje += `Dirección: Calle ${calle}, Número ${numero}`;
        if (piso.trim()) mensaje += `, Piso: ${piso}`;
        if (departamento.trim()) mensaje += `, Departamento: ${departamento}`;
        mensaje += "\n";
      }
    }
    // Agregar información del método de pago
    if (metodoPago) {
      mensaje += `Método de pago: ${metodoPago}\n`;
      if (metodoPago === "Transferencia") {
        mensaje += `Realizar transferencia a: Banco XYZ, Cuenta: 123456789, CBU: 000000000\n`;
      }
    }
    mensaje += `\n *Total del Carrito: $${totalCarrito}*\n`;
    mensaje += "\n✅ *Por favor, confirma mi pedido. ¡Gracias!*";
    const numeroTelefono = "+543832460459";
    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    alert("Listo, ahora aguarde la confirmación de su pedido. Muchas Gracias.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 w-11/12 max-w-lg h-5/6 overflow-y-auto relative rounded">
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
          items.map(item => {
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
                <div key={item.id} className="border p-4 mb-4 rounded">
                  <h3 className="font-bold text-lg">
                    {item.producto.nombre} (Promo)
                  </h3>
                  <p className="text-sm font-semibold">Precio: ${item.precio}</p>
                  <div className="mt-2">
                    <p className="font-semibold">Personalización:</p>
                    {promoPersonalizacion.hamburguesas.map((prod, index) => (
                      <div key={index} className="ml-4 mt-2 border-l pl-4">
                        <p className="font-medium">Producto {index + 1}:</p>
                        <ul className="text-sm text-gray-700 mt-1 space-y-1">
                          <li>Mayonesa casera: {prod.conMayonesa ? "Sí" : "No"}</li>
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
                  <div className="mt-2 flex justify-end">
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
              const { conMayonesa, conQueso, tipoQueso, aderezos, toppings, extras, observaciones } = item.personalizacion;
              return (
                <div key={item.id} className="border p-4 mb-4 rounded">
                  <h3 className="font-bold text-lg">{item.producto.nombre}</h3>
                  <p className="text-sm font-semibold">Precio: ${item.precio}</p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>Mayonesa casera: {conMayonesa ? "Sí" : "No"}</li>
                    <li>Con queso: {conQueso ? "Sí" : "No"}</li>
                    {conQueso && tipoQueso && <li>Tipo de queso: {tipoQueso}</li>}
                    {aderezos && aderezos.length > 0 && <li>Aderezos: {aderezos.join(", ")}</li>}
                    {toppings && toppings.length > 0 && <li>Toppings: {toppings.join(", ")}</li>}
                    {extras && extras.length > 0 && <li>Extras: {extras.join(", ")}</li>}
                    {observaciones && <li>Observaciones: {observaciones}</li>}
                  </ul>
                  <div className="mt-2 flex justify-end">
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
          })
        )}
        {items.length > 0 && (
          <>
            <div className="mt-4 flex flex-col gap-4">
              <div className="border p-4 rounded">
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
              <div className="border p-4 rounded">
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
                  <div className="mt-4 border p-2 rounded">
                    <p className="text-sm">Banco XYZ</p>
                    <p className="text-sm">Cuenta: 123456789</p>
                    <p className="text-sm">CBU: 000000000</p>
                  </div>
                )}
              </div>
              <p className="text-lg font-bold">Total del Carrito: ${totalCarrito}</p>
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
    </div>
  );
}
