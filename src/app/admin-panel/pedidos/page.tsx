"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pedido } from "../../../../types/Pedido";
import OrderDetails from "../../../app/components/OrderDetails";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

interface DeliveryPerson {
  id: number;
  nombre: string;
  celular: string;
}

interface Asignacion {
  id: number;
  pedidoID: number;
  repartidorID: number;
  fechaAsignacion: string;
}

interface CajaRecord {
  id: number;
  pedidoID: number;
  metodoPago: string;
  monto: number;
  fechaRegistro: string;
}

export default function PedidosPanel() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<string>("Pendiente");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Estados para previsualización de comanda
  const [mostrarComanda, setMostrarComanda] = useState(false);
  const [comandaContent, setComandaContent] = useState("");

  // Estados para modal de asignación de Delivery
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryPedido, setSelectedDeliveryPedido] = useState<Pedido | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [availableDeliveryPersons, setAvailableDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [assignments, setAssignments] = useState<Asignacion[]>([]);

  // Estado para los registros de la caja
  const [cajaRecords, setCajaRecords] = useState<CajaRecord[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Función para traer repartidores reales
  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/Repartidores`);
      if (!res.ok) throw new Error("Error al obtener los repartidores");
      const data = await res.json();
      setAvailableDeliveryPersons(data);
    } catch (err: any) {
      console.error(err.message || "Error al obtener repartidores");
    }
  };

  // Función para traer asignaciones existentes
  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/RepartidorPedidos`);
      if (!res.ok) throw new Error("Error al obtener asignaciones");
      const data = await res.json();
      setAssignments(data);
    } catch (err: any) {
      console.error(err.message || "Error al obtener asignaciones");
    }
  };

  // Función para traer los registros de la caja
  const fetchCajaRecords = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/Caja`);
      if (!res.ok) throw new Error("Error al obtener registros de caja");
      const data = await res.json();
      setCajaRecords(data);
    } catch (err: any) {
      console.error(err.message || "Error al obtener registros de caja");
    }
  };

  // Obtener pedidos y filtrar según estado
  const fetchPedidos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/pedidos`);
      if (!res.ok) throw new Error("Error al obtener los pedidos");
      const data: Pedido[] = await res.json();
      const filtered = filterEstado === "Todos" ? data : data.filter((pedido) => pedido.estado === filterEstado);
      setPedidos(filtered);
    } catch (err: any) {
      setError(err.message || "Error al obtener los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [filterEstado]);

  useEffect(() => {
    fetchDeliveryPersons();
    fetchAssignments();
    fetchCajaRecords();
  }, [apiUrl]);

  // Función para confirmar pedido
  const confirmPedido = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/Pedidos/${id}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al confirmar el pedido");
      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === id
            ? { ...pedido, estado: "Confirmado", fechaFinalizacion: new Date().toISOString() }
            : pedido
        )
      );
    } catch (err: any) {
      alert(err.message || "Error al confirmar el pedido");
    }
  };

  // Función para completar pedido
  const completePedido = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/Pedidos/${id}/completar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al completar el pedido");
      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === id
            ? { ...pedido, estado: "Completado", fechaFinalizacion: new Date().toISOString() }
            : pedido
        )
      );
    } catch (err: any) {
      alert(err.message || "Error al completar el pedido");
    }
  };

  // Función para imprimir la comanda
  const imprimirComanda = async (pedido: Pedido) => {
    try {
      const ReactDOMServer = await import("react-dom/server");
      const details = JSON.parse(pedido.orden);
      const html = ReactDOMServer.renderToStaticMarkup(<OrderDetails data={details} />);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } catch (error) {
      alert("Error al imprimir la comanda.");
      console.error(error);
    }
  };

  // Función para previsualizar la comanda
  const generarComandaPreview = async (pedido: Pedido) => {
    try {
      const ReactDOMServer = await import("react-dom/server");
      const details = JSON.parse(pedido.orden);
      const html = ReactDOMServer.renderToStaticMarkup(<OrderDetails data={details} />);
      setComandaContent(html);
      setMostrarComanda(true);
    } catch (error) {
      alert("No se pudo generar la comanda.");
      console.error(error);
    }
  };

  // Función para ver detalles del pedido
  const viewDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    try {
      const details = JSON.parse(pedido.orden);
      // Agregamos el estado en los detalles para usarlo en el modal
      details.estado = pedido.estado;
      setOrderDetails(details);
    } catch (err) {
      console.error("Error al parsear la orden:", err);
      setOrderDetails(null);
    }
  };

  // Función para abrir el modal de asignación de Delivery
  const openDeliveryModal = (pedido: Pedido, orderData: any) => {
    setSelectedDeliveryPedido(pedido);
    setShowDeliveryModal(true);
  };

  // Función para asignar delivery
  const assignDelivery = async () => {
    if (!selectedDeliveryPerson || !selectedDeliveryPedido) {
      alert("Seleccione un repartidor");
      return;
    }
    const payload = {
      pedidoID: selectedDeliveryPedido.id,
      repartidorID: selectedDeliveryPerson.id,
    };
    try {
      const res = await fetch(`${apiUrl}/api/RepartidorPedidos/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al asignar repartidor");
      alert("Asignación creada correctamente.");
      fetchAssignments();
    } catch (error: any) {
      alert(error.message || "Error al asignar repartidor");
    }
    setShowDeliveryModal(false);
    setSelectedDeliveryPedido(null);
    setSelectedDeliveryPerson(null);
  };

  // Función para enviar la información al repartidor
  const sendToDelivery = (pedido: Pedido, orderData: any) => {
    const assignment = assignments.find((a) => a.pedidoID === pedido.id);
    if (!assignment) {
      alert("No hay repartidor asignado.");
      return;
    }
    const assignedRepartidor = availableDeliveryPersons.find((p) => p.id === assignment.repartidorID);
    if (!assignedRepartidor) {
      alert("No se encontró información del repartidor asignado.");
      return;
    }
    const direccion = orderData.direccion;
    let query = "";
    if (direccion?.calle && direccion.calle.startsWith("Lat:")) {
      const lat = direccion.calle.replace("Lat:", "").trim();
      const lng = direccion.numero.replace("Lng:", "").trim();
      query = `${lat},${lng}`;
      if (direccion.piso?.trim()) query += `, Piso: ${direccion.piso}`;
      if (direccion.departamento?.trim()) query += `, Dept: ${direccion.departamento}`;
    } else {
      query = `Calle ${direccion?.calle}, Nº ${direccion?.numero}`;
      if (direccion?.piso?.trim()) query += `, Piso: ${direccion.piso}`;
      if (direccion?.departamento?.trim()) query += `, Departamento: ${direccion.departamento}`;
    }
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    let mensaje = `Nuevo pedido delivery:\n`;
    mensaje += `${direccion?.calle && direccion.calle.startsWith("Lat:") ? "Ubicación:" : "Dirección:"} ${query}\n`;
    if (orderData.metodoPago === "Efectivo") {
      mensaje += `Monto a cobrar: $${orderData.total}\n`;
    }
    mensaje += `Ver ubicación en Maps: ${googleMapsUrl}`;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${assignedRepartidor.celular}&text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappLink, "_blank");
  };

  // Función para agregar el pedido a caja
  const agregarACaja = async (pedido: Pedido) => {
    const yaAgregado = cajaRecords.some((record) => record.pedidoID === pedido.id);
    if (yaAgregado) {
      alert("Este pedido ya fue agregado a la caja.");
      return;
    }
    try {
      const orderData = JSON.parse(pedido.orden);
      const payload = {
        PedidoID: pedido.id,
        MetodoPago: orderData.metodoPago,
        Monto: orderData.total,
      };
      const res = await fetch(`${apiUrl}/api/Caja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Error al agregar el pedido a la caja");
      }
      alert("Pedido agregado a la caja correctamente.");
      fetchCajaRecords();
    } catch (err: any) {
      alert(err.message || "Error al agregar el pedido a la caja");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />

      <header className="relative w-full h-40 md:h-56 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg"
          alt="Panel de Administración"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-2xl md:text-4xl font-bold text-white">Gestión de Pedidos</h1>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">
            Pedidos - {filterEstado}
          </h2>
          <div className="flex items-center space-x-2">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded text-sm md:text-base text-gray-900 dark:text-gray-100"
            >
              <option value="Todos">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Completado">Completado</option>
            </select>
            <button
              onClick={fetchPedidos}
              className="bg-blue-500 text-white px-3 py-2 rounded text-sm md:text-base"
            >
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : pedidos.length === 0 ? (
          <p className="text-center">No se encontraron pedidos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Estado</th>
                  <th className="py-2 px-4 border-b">Fecha Creación</th>
                  <th className="py-2 px-4 border-b">Fecha Finalización</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => {
                  let orderData: any = {};
                  try {
                    orderData = JSON.parse(pedido.orden);
                  } catch (err) {
                    console.error("Error al parsear la orden:", err);
                  }
                  const isDelivery = orderData.metodoEntrega === "delivery";
                  const assigned = assignments.find((a) => a.pedidoID === pedido.id);
                  const yaAgregadoCaja = cajaRecords.some((record) => record.pedidoID === pedido.id);
                  return (
                    <tr key={pedido.id} className="text-center">
                      <td className="py-2 px-4 border-b">{pedido.id}</td>
                      <td className="py-2 px-4 border-b">{pedido.estado}</td>
                      <td className="py-2 px-4 border-b">{new Date(pedido.fechaCreacion).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b">
                        {pedido.fechaFinalizacion ? new Date(pedido.fechaFinalizacion).toLocaleString() : "-"}
                      </td>
                      <td className="py-2 px-4 border-b space-x-2">
                        <button
                          onClick={() => viewDetails(pedido)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600 transition-colors"
                        >
                          Ver Detalles
                        </button>
                        {pedido.estado === "Pendiente" && (
                          <button
                            onClick={() => confirmPedido(pedido.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-green-600 transition-colors"
                          >
                            Confirmar
                          </button>
                        )}
                        {pedido.estado === "Confirmado" && (
                          <>
                            <button
                              onClick={() => completePedido(pedido.id)}
                              className="bg-orange-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-orange-600 transition-colors"
                            >
                              Completar
                            </button>
                            <button
                              onClick={() => generarComandaPreview(pedido)}
                              className="bg-purple-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-purple-600 transition-colors"
                            >
                              Generar Comanda
                            </button>
                          </>
                        )}
                        {pedido.estado === "Completado" && <></>}
                        {isDelivery &&
                          (assigned ? (
                            <button
                              onClick={() => sendToDelivery(pedido, orderData)}
                              className="bg-indigo-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-indigo-600 transition-colors"
                            >
                              Enviar a delivery
                            </button>
                          ) : (
                            <button
                              onClick={() => openDeliveryModal(pedido, orderData)}
                              className="bg-teal-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-teal-600 transition-colors"
                            >
                              Asignar Delivery
                            </button>
                          ))}
                        {(pedido.estado === "Confirmado" || pedido.estado === "Completado") && (
                          yaAgregadoCaja ? (
                            <button
                              disabled
                              className="bg-gray-500 text-white px-2 py-1 rounded text-xs md:text-sm"
                            >
                              Agregado a Caja
                            </button>
                          ) : (
                            <button
                              onClick={() => agregarACaja(pedido)}
                              className="bg-pink-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-pink-600 transition-colors"
                            >
                              Agregar a Caja
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para ver detalles del pedido */}
        {selectedPedido && orderDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-11/12 max-w-lg overflow-y-auto max-h-[90vh]">
              <h2 className="text-lg md:text-xl font-bold mb-2">
                Detalles del Pedido #{selectedPedido.id}
              </h2>
              <OrderDetails data={orderDetails} />
              {(orderDetails.estado === "Confirmado" || orderDetails.estado === "Completado") && (
                cajaRecords.some(record => record.pedidoID === selectedPedido.id) ? (
                  <button
                    disabled
                    className="bg-gray-500 text-white px-4 py-2 rounded my-4"
                  >
                    Agregado a Caja
                  </button>
                ) : (
                  <button
                    onClick={() => agregarACaja(selectedPedido)}
                    className="bg-pink-500 text-white px-4 py-2 rounded my-4 hover:bg-pink-600 transition-colors"
                  >
                    Agregar a Caja
                  </button>
                )
              )}
              <button
                onClick={() => {
                  setSelectedPedido(null);
                  setOrderDetails(null);
                }}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded text-xs md:text-sm"
              >
                Cerrar Detalles
              </button>
            </div>
          </motion.div>
        )}

        {/* Modal para asignar Delivery */}
        {showDeliveryModal && selectedDeliveryPedido && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-11/12 max-w-md text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold mb-4">
                Asignar Delivery al Pedido #{selectedDeliveryPedido.id}
              </h2>
              <div>
                <label className="block mb-2">Seleccionar Repartidor:</label>
                <select
                  value={selectedDeliveryPerson ? selectedDeliveryPerson.id : ""}
                  onChange={(e) => {
                    const personId = Number(e.target.value);
                    const person = availableDeliveryPersons.find((p) => p.id === personId);
                    setSelectedDeliveryPerson(person || null);
                  }}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Seleccionar --</option>
                  {availableDeliveryPersons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={assignDelivery}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Asignar
                </button>
                <button
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setSelectedDeliveryPedido(null);
                    setSelectedDeliveryPerson(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal de previsualización de Comanda */}
        {mostrarComanda && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Previsualización de Comanda</h2>
              <div
                className="border p-4 mb-4 dark:border-gray-600"
                dangerouslySetInnerHTML={{ __html: comandaContent }}
              />
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(comandaContent);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-xs md:text-sm"
                >
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([comandaContent], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `comanda-pedido-${selectedPedido?.id || ""}.html`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded text-xs md:text-sm"
                >
                  Descargar
                </button>
                <button
                  onClick={() => setMostrarComanda(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded text-xs md:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <FooterAdmin />
    </div>
  );
}
