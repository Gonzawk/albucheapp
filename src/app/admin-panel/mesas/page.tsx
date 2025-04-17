"use client";
import { useEffect, useState, useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Image from "next/image";

interface Mesa {
  mesaID: number;
  nombre: string;
  codigoQR?: string;
  activo: boolean;
  fechaCreacion: string;
  posX?: number;
  posY?: number;
}
interface MesaDto {
  nombre: string;
  activo: boolean;
  posX?: number;
  posY?: number;
  codigoQR?: string;
}

export default function MesasPanel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [origin, setOrigin] = useState("");
  const [addingMesa, setAddingMesa] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [formData, setFormData] = useState<MesaDto>({
    nombre: "",
    activo: true,
    posX: 0,
    posY: 0,
    codigoQR: "",
  });

  // capturar origen URL
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const getToken = () =>
    localStorage.getItem("token") ||
    document.cookie.match(/(^| )token=([^;]+)/)?.[2] ||
    "";
  const getAuthHeaders = (json = true) => ({
    ...(json && { "Content-Type": "application/json" }),
    Authorization: `Bearer ${getToken()}`,
  });

  // obtiene todas las mesas
  async function fetchMesas() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Mesa`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener las mesas");
      setMesas(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  // busca una mesa por ID
  async function fetchMesaById(id: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/Mesa/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Mesa no encontrada");
      setMesas([await res.json()]);
    } catch (e: any) {
      setError(e.message);
      setMesas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMesas();
  }, [apiUrl]);

  const handleSearch = (e: MouseEvent) => {
    e.preventDefault();
    searchValue.trim() ? fetchMesaById(searchValue.trim()) : fetchMesas();
  };

  // --- CREAR MESA: primero POST, luego actualizamos su CodigoQR a /mesa/{newId}
  async function createMesa() {
    try {
      // 1) POST inicial (sin codigoQR)
      const res = await fetch(`${apiUrl}/api/Mesa`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Error al crear mesa");
      const newId: number = await res.json();

      // 2) Generamos la URL dinámica y la guardamos
      const qrUrl = `${origin}/mesa/${newId}`;
      await fetch(`${apiUrl}/api/Mesa/${newId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...formData, codigoQR: qrUrl }),
      });

      // 3) refrescamos
      await fetchMesas();
      setAddingMesa(false);
      setFormData({ nombre: "", activo: true, posX: 0, posY: 0, codigoQR: "" });
    } catch (e: any) {
      alert(e.message);
    }
  }
  // --- ACTUALIZAR MESA: acepta codigoQR del DTO
  async function updateMesa() {
    if (!editingMesa) return;
    try {
      await fetch(`${apiUrl}/api/Mesa/${editingMesa.mesaID}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      await fetchMesas();
      setEditingMesa(null);
      setFormData({ nombre: "", activo: true, posX: 0, posY: 0, codigoQR: "" });
    } catch (e: any) {
      alert(e.message);
    }
  }
  // --- ELIMINAR MESA
  async function deleteMesa(id: number) {
    if (!confirm("¿Eliminar esta mesa?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/Mesa/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });
      if (!res.ok) throw new Error("Error al eliminar mesa");
      setMesas((ms) => ms.filter((m) => m.mesaID !== id));
    } catch (e: any) {
      alert(e.message);
    }
  }
  // precarga DTO al editar
  function openEdit(mesa: Mesa) {
    setEditingMesa(mesa);
    setFormData({
      nombre: mesa.nombre,
      activo: mesa.activo,
      posX: mesa.posX ?? 0,
      posY: mesa.posY ?? 0,
      codigoQR: mesa.codigoQR,
    });
    setAddingMesa(false);
    setOrganizing(false);
  }

  // Imprime el QR existente en el canvas
  const printQR = (mesa: Mesa) => {
    const canvas = document.getElementById(`qrcode-${mesa.mesaID}`) as HTMLCanvasElement;
    if (!canvas) return alert("QR no disponible");
    const dataUrl = canvas.toDataURL();
    const w = window.open("");
    if (w) {
      w.document.write(
        `<img src="${dataUrl}" onload="window.print();window.close()" />`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <NavBarAdmin />

      <header className="relative w-full h-40 md:h-56 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg"
          alt="Mesas"
          fill
          style={{ objectFit: "cover" }}
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            Gestión de Mesas
          </h1>
        </div>
      </header>

      <main className="flex-grow p-6 space-y-6">
        <form className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded dark:bg-gray-800 dark:border-gray-600"
            placeholder="Buscar por ID…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              fetchMesas();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Limpiar
          </button>
        </form>

        <div className="flex gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setAddingMesa(true);
              setEditingMesa(null);
              setFormData({ nombre: "", activo: true, posX: 0, posY: 0, codigoQR: "" });
            }}
          >
            Agregar Mesa
          </button>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setOrganizing(true);
              setAddingMesa(false);
              setEditingMesa(null);
            }}
          >
            Organizar Mesas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                {["ID", "Nombre", "QR", "Activo", "Fecha", "Acciones"].map((h) => (
                  <th key={h} className="py-2 px-4 border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesas.map((m) => (
                <tr key={m.mesaID} className="text-center">
                  <td className="py-1 px-2 border">{m.mesaID}</td>
                  <td className="py-1 px-2 border">{m.nombre}</td>
                  <td className="py-1 px-2 border">
                    {origin && (
                      <QRCodeCanvas
                        id={`qrcode-${m.mesaID}`}
                        value={m.codigoQR ?? `${origin}/mesa/${m.mesaID}`}
                        size={64}
                      />
                    )}
                  </td>
                  <td className="py-1 px-2 border">{m.activo ? "Sí" : "No"}</td>
                  <td className="py-1 px-2 border">
                    {new Date(m.fechaCreacion).toLocaleString()}
                  </td>
                  <td className="py-1 px-2 border flex justify-center gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteMesa(m.mesaID)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => printQR(m)}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      Imprimir QR
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    Cargando…
                  </td>
                </tr>
              )}
              {!loading && mesas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No hay mesas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <FooterAdmin />

      {/* Modal Crear / Editar (ahora con campo URL para QR) */}
      {(addingMesa || editingMesa) && (
        <ModalMesa
          title={addingMesa ? "Nueva Mesa" : `Editar Mesa #${editingMesa?.mesaID}`}
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setAddingMesa(false);
            setEditingMesa(null);
          }}
          onSubmit={addingMesa ? createMesa : updateMesa}
        />
      )}

      {/* Organizar mesas: mantiene su propia lógica */}
      {organizing && (
        <ModalOrganizar
          mesas={mesas}
          onClose={() => setOrganizing(false)}
          onSave={async (updated) => {
            for (const m of updated) {
              await fetch(`${apiUrl}/api/Mesa/${m.mesaID}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  nombre: m.nombre,
                  activo: m.activo,
                  posX: m.posX,
                  posY: m.posY,
                  codigoQR: m.codigoQR,
                }),
              });
            }
            await fetchMesas();
            setOrganizing(false);
          }}
        />
      )}
    </div>
  );
}

// Modal para crear/editar (incluye campo URL)
function ModalMesa({
  title,
  onClose,
  onSubmit,
  formData,
  setFormData,
}: {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  formData: MesaDto;
  setFormData: (d: MesaDto) => void;
}) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFormData({
      ...formData,
      posX: (e.clientX - rect.left) / rect.width,
      posY: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-lg space-y-4">
        <h2 className="text-xl font-bold text-center">{title}</h2>

        <input
          type="text"
          placeholder="Nombre de la mesa"
          className="border p-2 rounded w-full"
          value={formData.nombre}
          onChange={(e) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.activo}
            onChange={(e) =>
              setFormData({ ...formData, activo: e.target.checked })
            }
          />
          Activo
        </label>

        <input
          type="text"
          placeholder="URL para el Código QR"
          className="border p-2 rounded w-full"
          value={formData.codigoQR}
          onChange={(e) =>
            setFormData({ ...formData, codigoQR: e.target.value })
          }
        />

        <p className="text-sm">Haz click en el plano para ubicar la mesa:</p>
        <div
          className="relative border w-full h-64 overflow-hidden"
          onClick={handleClick}
        >
          <img
            src="/img/plano.jpg"
            alt="Plano"
            className="object-cover w-full h-full"
          />
          {typeof formData.posX === "number" &&
            typeof formData.posY === "number" && (
              <div
                className="absolute bg-red-500 rounded-full w-4 h-4"
                style={{
                  left: `${formData.posX * 100}%`,
                  top: `${formData.posY * 100}%`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ... ModalOrganizar queda igual que antes ...
function ModalOrganizar({
  mesas,
  onClose,
  onSave,
}: {
  mesas: Mesa[];
  onClose: () => void;
  onSave: (updated: Mesa[]) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localMesas, setLocalMesas] = useState<Mesa[]>(mesas);

  const handleDragEnd =
    (id: number) =>
    (_: any, info: { point: { x: number; y: number } }) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (info.point.x - rect.left) / rect.width;
      const y = (info.point.y - rect.top) / rect.height;
      setLocalMesas((ms) =>
        ms.map((m) => (m.mesaID === id ? { ...m, posX: x, posY: y } : m))
      );
    };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl">Organizar Mesas</h3>
          <button onClick={onClose} className="text-red-500">
            Cerrar
          </button>
        </div>
        <div
          ref={containerRef}
          className="relative border w-full h-96 overflow-hidden"
        >
          <img
            src="/img/plano.jpg"
            alt="Plano"
            className="object-cover w-full h-full"
          />
          {localMesas.map((m) => (
            <motion.div
              key={m.mesaID}
              drag
              dragMomentum={false}
              dragConstraints={containerRef}
              onDragEnd={handleDragEnd(m.mesaID)}
              style={{
                position: "absolute",
                left: `${(m.posX ?? 0) * 100}%`,
                top: `${(m.posY ?? 0) * 100}%`,
              }}
            >
              <div className="relative flex flex-col items-center select-none cursor-move">
                <span className="absolute -top-5 text-xs font-medium text-black whitespace-nowrap">
                  {m.nombre}
                </span>
                <span className="w-4 h-4 bg-black rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button
            onClick={() => onSave(localMesas)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Guardar Ubicaciones
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
