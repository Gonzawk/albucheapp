"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pedido } from "../../../../types/Pedido";
import OrderDetails from "../../../app/components/OrderDetails";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";

export default function PedidosPanel() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<string>("Pendiente");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Estados para previsualizar la comanda
  const [mostrarComanda, setMostrarComanda] = useState(false);
  const [comandaContent, setComandaContent] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Obtener pedidos del endpoint y filtrar en el cliente
  const fetchPedidos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/pedidos`);
      if (!res.ok) {
        throw new Error("Error al obtener los pedidos");
      }
      const data: Pedido[] = await res.json();
      // Filtrar localmente según el estado seleccionado; si se selecciona "Todos" se muestran todos.
      const filtered =
        filterEstado === "Todos" ? data : data.filter((pedido) => pedido.estado === filterEstado);
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

  // Función para confirmar el pedido (de "Pendiente" a "Confirmado")
  const confirmPedido = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/Pedidos/${id}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Error al confirmar el pedido");
      }
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

  // Función para completar el pedido (de "Confirmado" a "Completado")
  const completePedido = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/Pedidos/${id}/completar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Error al completar el pedido");
      }
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

  // Función para imprimir la comanda usando OrderDetails (genera el HTML en el frontend)
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
      setOrderDetails(details);
    } catch (err) {
      console.error("Error al parsear la orden:", err);
      setOrderDetails(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <NavBarAdmin />

      <header className="relative w-full h-40 md:h-56 overflow-hidden">
        <Image
          src="/admin-banner.jpg"
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
              className="border border-gray-300 p-2 rounded text-sm md:text-base"
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
            <table className="min-w-full bg-white border border-gray-200 text-sm md:text-base">
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
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="text-center">
                    <td className="py-2 px-4 border-b">{pedido.id}</td>
                    <td className="py-2 px-4 border-b">{pedido.estado}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(pedido.fechaCreacion).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {pedido.fechaFinalizacion
                        ? new Date(pedido.fechaFinalizacion).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => viewDetails(pedido)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                      >
                        Ver Detalles
                      </button>
                      {pedido.estado === "Pendiente" && (
                        <button
                          onClick={() => confirmPedido(pedido.id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-green-600"
                        >
                          Confirmar
                        </button>
                      )}
                      {pedido.estado === "Confirmado" && (
                        <>
                          <button
                            onClick={() => completePedido(pedido.id)}
                            className="bg-orange-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-orange-600"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => generarComandaPreview(pedido)}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-purple-600"
                          >
                            Generar Comanda
                          </button>
                          <button
                            onClick={() => imprimirComanda(pedido)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                          >
                            Imprimir Comanda
                          </button>
                        </>
                      )}
                      {pedido.estado === "Completado" && (
                        <button
                          onClick={() => imprimirComanda(pedido)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                        >
                          Imprimir Comanda
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedPedido && orderDetails && (
          <div className="mt-4 p-4 border rounded shadow bg-white">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Detalles del Pedido #{selectedPedido.id}
            </h2>
            <OrderDetails data={orderDetails} />
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
        )}
      </main>

      {/* Modal de previsualización de Comanda */}
      {mostrarComanda && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Previsualización de Comanda</h2>
            <div
              className="border p-4 mb-4"
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

      <FooterAdmin />
    </div>
  );
}
