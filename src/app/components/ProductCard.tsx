"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Producto } from "../../../types/product";
import { motion } from "framer-motion";
import toppingsData from "../../../public/data/toppings.json";
import { useCart } from "../../app/context/CartContext";
import { v4 as uuidv4 } from "uuid";

interface ProductCardProps {
  producto: Producto;
  setPersonalizando: (value: boolean) => void;
}

// Componente para cada sección colapsable
const AccordionSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 border-b pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left font-bold text-lg mb-2"
      >
        {title} {open ? "▲" : "▼"}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

export default function ProductCard({ producto, setPersonalizando }: ProductCardProps) {
  // IDs para distinguir promociones
  const promoTipo1Ids = [11, 12, 13, 14];
  const promoTipo2Ids = [7, 8, 9, 10];
  const isPromoTipo1 = promoTipo1Ids.includes(producto.id);
  const isPromoTipo2 = promoTipo2Ids.includes(producto.id);

  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [toppingsGlobales, setToppingsGlobales] = useState<Record<string, number>>({});
  // Para producto normal
  const [precioTotal, setPrecioTotal] = useState(producto.precio);

  // Estados para producto normal
  const [conMayonesa, setConMayonesa] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [tipoQueso, setTipoQueso] = useState("");
  const cheeseTypes = ["Cheddar", "Tybo", "Azul", "Provolone"];

  // Extras (solo para producto normal)
  const extrasOptions = ["Medallón de Carne", "Dips de Aderezo"];
  const extrasPrecios: Record<string, number> = {
    "Medallón de Carne": 1700,
    "Medallón Veggie": 1500,
    "Dips de Aderezo": 400,
  };
  const [seleccionesExtras, setSeleccionesExtras] = useState<Record<string, boolean>>(
    extrasOptions.reduce((acc: Record<string, boolean>, extra) => {
      acc[extra] = false;
      return acc;
    }, {})
  );
  // Observaciones para producto normal
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

  // Funciones de toggle para producto normal
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

  // Actualiza el precio para producto normal
  useEffect(() => {
    if (!isPromoTipo1 && !isPromoTipo2) {
      const costoToppings = Object.entries(seleccionesToppings)
        .filter(([_, incluido]) => incluido)
        .reduce((total, [topping]) => total + (toppingsGlobales[topping] || 0), 0);
      const costoExtras = Object.entries(seleccionesExtras)
        .filter(([_, incluido]) => incluido)
        .reduce((total, [extra]) => total + (extrasPrecios[extra] || 0), 0);
      setPrecioTotal(producto.precio + costoToppings + costoExtras);
    }
  }, [seleccionesToppings, seleccionesExtras, toppingsGlobales, producto.precio, isPromoTipo1, isPromoTipo2]);

  // Estados para promociones Tipo 1: 2 hamburguesas (personalización, aderezos y observaciones)
  const [promoType1Customizations, setPromoType1Customizations] = useState(
    isPromoTipo1
      ? [
          {
            conMayonesa: false,
            conQueso: false,
            tipoQueso: "",
            seleccionesAderezos: aderezos.reduce((acc: Record<string, boolean>, a) => {
              acc[a] = true;
              return acc;
            }, {} as Record<string, boolean>),
            observaciones: "",
          },
          {
            conMayonesa: false,
            conQueso: false,
            tipoQueso: "",
            seleccionesAderezos: aderezos.reduce((acc: Record<string, boolean>, a) => {
              acc[a] = true;
              return acc;
            }, {} as Record<string, boolean>),
            observaciones: "",
          },
        ]
      : []
  );
  // Para promociones Tipo 2: 1 hamburguesa con opción de seleccionar hasta 2 toppings (ya incluidos)
  const [promoType2Customization, setPromoType2Customization] = useState(
    isPromoTipo2
      ? {
          conMayonesa: false,
          conQueso: false,
          tipoQueso: "",
          seleccionesAderezos: aderezos.reduce((acc: Record<string, boolean>, a) => {
            acc[a] = true;
            return acc;
          }, {} as Record<string, boolean>),
          seleccionesToppings: {} as Record<string, boolean>,
          observaciones: "",
        }
      : null
  );
  const [promoPrecioTotal, setPromoPrecioTotal] = useState(0);
  // El precio de la promo se mantiene en el precio base
  useEffect(() => {
    if (isPromoTipo1) {
      setPromoPrecioTotal(producto.precio);
    }
  }, [isPromoTipo1, producto.precio]);
  useEffect(() => {
    if (isPromoTipo2 && promoType2Customization) {
      setPromoPrecioTotal(producto.precio);
    }
  }, [isPromoTipo2, promoType2Customization, producto.precio]);

  const { addItem } = useCart();

  const agregarAlCarrito = () => {
    if (isPromoTipo1) {
      // Agrega un ítem de promo que incluye ambas hamburguesas personalizadas.
      const item = {
        id: uuidv4(),
        producto,
        personalizacion: {
          conMayonesa: false,
          conQueso: false,
          tipoQueso: "",
          aderezos: [] as string[],
          toppings: [] as string[],
          extras: [] as string[],
          observaciones: JSON.stringify(promoType1Customizations),
          hamburguesas: promoType1Customizations,
        },
        precio: producto.precio,
      };
      addItem(item);
    } else if (isPromoTipo2 && promoType2Customization) {
      const item = {
        id: uuidv4(),
        producto,
        personalizacion: {
          conMayonesa: promoType2Customization.conMayonesa,
          conQueso: promoType2Customization.conQueso,
          tipoQueso: promoType2Customization.tipoQueso,
          aderezos: Object.entries(promoType2Customization.seleccionesAderezos)
                    .filter(([_, included]) => included)
                    .map(([a]) => a),
          // Los toppings ya vienen incluidos en la promo, sin afectar el precio
          toppings: Object.entries(promoType2Customization.seleccionesToppings)
                    .filter(([_, included]) => included)
                    .map(([t]) => t),
          extras: [] as string[],
          observaciones: promoType2Customization.observaciones,
        },
        precio: producto.precio,
      };
      addItem(item);
    } else {
      const item = {
        id: uuidv4(),
        producto,
        personalizacion: {
          conMayonesa,
          conQueso,
          tipoQueso,
          aderezos: Object.entries(seleccionesAderezos)
            .filter(([_, incluido]) => incluido)
            .map(([a]) => a),
          toppings: Object.entries(seleccionesToppings)
            .filter(([_, incluido]) => incluido)
            .map(([t]) => t),
          extras: Object.entries(seleccionesExtras)
            .filter(([_, incluido]) => incluido)
            .map(([e]) => e),
          observaciones,
        },
        precio: precioTotal,
      };
      addItem(item);
    }
    setMostrarOpciones(false);
    setPersonalizando(false);
  };

  // Se elimina la función generarPedido (la lógica se moverá a CartModal.tsx)

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg text-center relative w-80 min-h-[450px] flex flex-col justify-between">
      <div className="w-full h-48 flex justify-center items-center overflow-hidden">
        <Image
          loader={() => producto.imagen}
          src={producto.imagen}
          width={350}
          height={250}
          alt={producto.nombre}
          className="rounded-lg object-cover w-full h-full"
          unoptimized
          priority
        />
      </div>
      <h2 className="text-2xl font-semibold mt-4">{producto.nombre}</h2>
      <p className="text-gray-700 mt-2">{producto.descripcion}</p>
      <span className="text-black-600 font-bold text-xl block mt-4">
         ${producto.precio}
      </span>

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
          {/* Modal scrollable */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4">{producto.nombre}</h3>

            {isPromoTipo1 ? (
              // PROMO TIPO 1: 2 unidades, solo Personalización, Aderezos y Observaciones
              [0, 1].map((i) => (
                <div key={i} className="border p-4 mb-4 rounded">
                  <h4 className="font-bold mb-2">Hamburguesa {i + 1}</h4>
                  <AccordionSection title="Personalización">
                    <label className="block">
                      <input
                        type="checkbox"
                        checked={promoType1Customizations[i].conMayonesa}
                        onChange={(e) => {
                          const newPromo = [...promoType1Customizations];
                          newPromo[i].conMayonesa = e.target.checked;
                          setPromoType1Customizations(newPromo);
                        }}
                        className="mr-2"
                      />
                      Mayonesa casera
                    </label>
                    <label className="block">
                      <input
                        type="checkbox"
                        checked={promoType1Customizations[i].conQueso}
                        onChange={(e) => {
                          const newPromo = [...promoType1Customizations];
                          newPromo[i].conQueso = e.target.checked;
                          setPromoType1Customizations(newPromo);
                        }}
                        className="mr-2"
                      />
                      Con queso
                    </label>
                    {promoType1Customizations[i].conQueso && (
                      <select
                        value={promoType1Customizations[i].tipoQueso}
                        onChange={(e) => {
                          const newPromo = [...promoType1Customizations];
                          newPromo[i].tipoQueso = e.target.value;
                          setPromoType1Customizations(newPromo);
                        }}
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
                  </AccordionSection>
                  <AccordionSection title="Aderezos">
                    {aderezos.map((aderezo) => (
                      <label key={aderezo} className="block">
                        <input
                          type="checkbox"
                          checked={promoType1Customizations[i].seleccionesAderezos[aderezo]}
                          onChange={(e) => {
                            const newPromo = [...promoType1Customizations];
                            newPromo[i].seleccionesAderezos[aderezo] = e.target.checked;
                            setPromoType1Customizations(newPromo);
                          }}
                          className="mr-2"
                        />
                        {aderezo}
                      </label>
                    ))}
                  </AccordionSection>
                  <AccordionSection title="Observaciones">
                    <textarea
                      value={promoType1Customizations[i].observaciones}
                      onChange={(e) => {
                        const newPromo = [...promoType1Customizations];
                        newPromo[i].observaciones = e.target.value;
                        setPromoType1Customizations(newPromo);
                      }}
                      placeholder="Observaciones..."
                      className="w-full p-2 border rounded"
                      rows={3}
                    ></textarea>
                  </AccordionSection>
                </div>
              ))
            ) : isPromoTipo2 && promoType2Customization ? (
              // PROMO TIPO 2: 1 unidad con Toppings (máx 2) incluidos; no se permiten extras
              <>
                <AccordionSection title="Personalización">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={promoType2Customization.conMayonesa}
                      onChange={(e) =>
                        setPromoType2Customization({
                          ...promoType2Customization,
                          conMayonesa: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Mayonesa casera
                  </label>
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={promoType2Customization.conQueso}
                      onChange={(e) =>
                        setPromoType2Customization({
                          ...promoType2Customization,
                          conQueso: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Con queso
                  </label>
                  {promoType2Customization.conQueso && (
                    <select
                      value={promoType2Customization.tipoQueso}
                      onChange={(e) =>
                        setPromoType2Customization({
                          ...promoType2Customization,
                          tipoQueso: e.target.value,
                        })
                      }
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
                </AccordionSection>
                <AccordionSection title="Aderezos">
                  {aderezos.map((aderezo) => (
                    <label key={aderezo} className="block">
                      <input
                        type="checkbox"
                        checked={promoType2Customization.seleccionesAderezos[aderezo]}
                        onChange={(e) =>
                          setPromoType2Customization({
                            ...promoType2Customization,
                            seleccionesAderezos: {
                              ...promoType2Customization.seleccionesAderezos,
                              [aderezo]: e.target.checked,
                            },
                          })
                        }
                        className="mr-2"
                      />
                      {aderezo}
                    </label>
                  ))}
                </AccordionSection>
                <AccordionSection title="Toppings">
                  <p className="text-sm text-gray-600 mb-2">(Máximo 2)</p>
                  {Object.keys(toppingsGlobales).map((topping) => {
                    const currentCount = Object.values(promoType2Customization.seleccionesToppings).filter(Boolean).length;
                    const isChecked = promoType2Customization.seleccionesToppings[topping] || false;
                    return (
                      <label key={topping} className="block">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            if (newValue && currentCount >= 2) return;
                            setPromoType2Customization({
                              ...promoType2Customization,
                              seleccionesToppings: {
                                ...promoType2Customization.seleccionesToppings,
                                [topping]: newValue,
                              },
                            });
                          }}
                          className="mr-2"
                        />
                        {topping} (+${toppingsGlobales[topping]})
                      </label>
                    );
                  })}
                </AccordionSection>
                <AccordionSection title="Observaciones">
                  <textarea
                    value={promoType2Customization.observaciones}
                    onChange={(e) =>
                      setPromoType2Customization({
                        ...promoType2Customization,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones..."
                    className="w-full p-2 border rounded"
                    rows={3}
                  ></textarea>
                </AccordionSection>
              </>
            ) : (
              // Formulario normal (no promo)
              <>
                <AccordionSection title="Personalización">
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
                </AccordionSection>
                <AccordionSection title="Aderezos">
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
                </AccordionSection>
                <AccordionSection title="Toppings">
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
                </AccordionSection>
                <AccordionSection title="Extras">
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
                </AccordionSection>
                <AccordionSection title="Observaciones">
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ingrese alguna observación...(sin sal, etc)"
                    className="w-full p-2 border rounded"
                    rows={3}
                  ></textarea>
                </AccordionSection>
              </>
            )}

            <p className="text-lg font-bold mt-4">
              Total: ${isPromoTipo1 || isPromoTipo2 ? promoPrecioTotal : precioTotal}
            </p>

            {/* Se han eliminado las secciones de Entrega, Método de Pago y la función generarPedido */}
            {/* Se muestran solo los botones para Agregar al Carrito y Volver atrás */}
            {isPromoTipo1 ? (
              <button
                onClick={agregarAlCarrito}
                className="mt-4 bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                Agregar Promo (2 unidades) al Carrito
              </button>
            ) : isPromoTipo2 ? (
              <button
                onClick={agregarAlCarrito}
                className="mt-4 bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                Agregar Promo al Carrito
              </button>
            ) : (
              <button
                onClick={agregarAlCarrito}
                className="mt-4 bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                Agregar al Carrito
              </button>
            )}

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
