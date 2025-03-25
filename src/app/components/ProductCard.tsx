"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Producto } from "../../../types/Producto";
import { Topping } from "../../../types/Topping";
import { motion } from "framer-motion";
import { useCart, Personalizacion } from "../../app/context/CartContext";
import { v4 as uuidv4 } from "uuid";
import { personalizacionConfig, TipoProducto } from "../../app/config/personalizacionConfig";
import { Extra } from "../../../types/Extra";
import { Aderezo } from "../../../types/Aderezo";

// Componente de acordeón para cada sección
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

export default function ProductCard({
  producto,
  setPersonalizando,
}: {
  producto: Producto;
  setPersonalizando: (value: boolean) => void;
}) {
  // Precios extras
  const extrasPrecios = {
    "Medallón Veggie": 1500,
    "Medallón de Carne": 1700,
    "DIPS": 0, // Debe coincidir con la DB
  };

  // Se fuerza el tipado a TipoProducto para evitar el error
  const tipo = producto.tipoProducto as TipoProducto;
  const schemaConfig = personalizacionConfig.schemas[tipo];
  const allowedSections: string[] = schemaConfig ? schemaConfig.allowedSections : [];

  // Cargar datos externos
  const [toppingsGlobales, setToppingsGlobales] = useState<Topping[]>([]);
  const [aderezosGlobales, setAderezosGlobales] = useState<string[]>([]);
  const [extrasGlobales, setExtrasGlobales] = useState<string[]>([]);
  // Estado para opciones DIP
  const [dipOptions, setDipOptions] = useState<{ id: number; nombre: string; precio: number }[]>([]);
  const [seleccionesDips, setSeleccionesDips] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const resToppings = await fetch(`${apiUrl}/api/toppings/active`);
        if (resToppings.ok) {
          const data: Topping[] = await resToppings.json();
          setToppingsGlobales(data);
        }
      } catch (error) {
        console.error("Error fetching toppings: ", error);
      }
      try {
        const resAderezos = await fetch(`${apiUrl}/api/aderezos/active`);
        if (resAderezos.ok) {
          const data: Aderezo[] = await resAderezos.json();
          setAderezosGlobales(data.map((a) => a.nombre));
        }
      } catch (error) {
        console.error("Error fetching aderezos: ", error);
      }
      try {
        const resExtras = await fetch(`${apiUrl}/api/extras/active`);
        if (resExtras.ok) {
          const data: Extra[] = await resExtras.json();
          setExtrasGlobales(data.map((e) => e.nombre));
        }
      } catch (error) {
        console.error("Error fetching extras: ", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDips() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const resDips = await fetch(`${apiUrl}/api/dips/active`);
        if (resDips.ok) {
          const data = await resDips.json();
          setDipOptions(data);
          setSeleccionesDips((prev) => {
            if (Object.keys(prev).length === 0) {
              return data.reduce((acc: Record<number, boolean>, dip: { id: number; nombre: string; precio: number }) => {
                acc[dip.id] = false;
                return acc;
              }, {});
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error fetching dip options: ", error);
      }
    }
    fetchDips();
  }, []);

  // Estados de personalización para productos que NO son Tipo 2
  const [personalizacionBasica, setPersonalizacionBasica] = useState({
    conMayonesa: false,
    conQueso: false,
    tipoQueso: "",
  });

  // Para Tipo 2: dos subproductos
  const [personalizacionSub1, setPersonalizacionSub1] = useState({
    conMayonesa: false,
    conQueso: false,
    tipoQueso: "",
    aderezos: [] as string[],
    observaciones: "",
  });
  const [personalizacionSub2, setPersonalizacionSub2] = useState({
    conMayonesa: false,
    conQueso: false,
    tipoQueso: "",
    aderezos: [] as string[],
    observaciones: "",
  });

  // Para secciones generales (aderezos, toppings, extras, observaciones)
  const [seleccionesAderezos, setSeleccionesAderezos] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (aderezosGlobales.length > 0 && Object.keys(seleccionesAderezos).length === 0) {
      setSeleccionesAderezos(
        aderezosGlobales.reduce((acc, aderezo) => {
          acc[aderezo] = true;
          return acc;
        }, {} as Record<string, boolean>)
      );
    }
  }, [aderezosGlobales]);
  const [seleccionesToppings, setSeleccionesToppings] = useState<Record<number, boolean>>({});
  const [seleccionesExtras, setSeleccionesExtras] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (extrasGlobales.length > 0 && Object.keys(seleccionesExtras).length === 0) {
      setSeleccionesExtras(
        extrasGlobales.reduce((acc, extra) => {
          acc[extra] = false;
          return acc;
        }, {} as Record<string, boolean>)
      );
    }
  }, [extrasGlobales]);
  const [observaciones, setObservaciones] = useState("");
  const [opcionPrincipal, setOpcionPrincipal] = useState("");
  const [tipo6Observaciones, setTipo6Observaciones] = useState("");

  // Calcular precio total: base + costo de toppings + extras + (opciones DIP si corresponde)
  const [precioTotal, setPrecioTotal] = useState(producto.precio);
  useEffect(() => {
    let total = tipo === TipoProducto.Tipo2 ? producto.precio * 2 : producto.precio;
    if (allowedSections.includes("toppings")) {
      total += toppingsGlobales.reduce((acc, topping) => {
        if (seleccionesToppings[topping.id]) {
          return acc + topping.precio;
        }
        return acc;
      }, 0);
    }
    if (allowedSections.includes("extras")) {
      total += extrasGlobales.reduce((acc, extra) => {
        if (seleccionesExtras[extra]) {
          return acc + (extrasPrecios[extra as keyof typeof extrasPrecios] || 0);
        }
        return acc;
      }, 0);
      if (seleccionesExtras["DIPS"]) {
        total += dipOptions.reduce((acc, dip) => {
          if (seleccionesDips[dip.id]) {
            return acc + dip.precio;
          }
          return acc;
        }, 0);
      }
    }
    setPrecioTotal(total);
  }, [
    producto.precio,
    tipo,
    toppingsGlobales,
    extrasGlobales,
    seleccionesToppings,
    seleccionesExtras,
    dipOptions,
    seleccionesDips,
    allowedSections,
  ]);

  const { addItem } = useCart();

  const agregarAlCarrito = () => {
    let personalizacion: Personalizacion;
    if (tipo === TipoProducto.Tipo2) {
      personalizacion = {
        tipo: TipoProducto.Tipo2,
        subproducto1: personalizacionSub1,
        subproducto2: personalizacionSub2,
      };
    } else if (tipo === TipoProducto.Tipo1) {
      personalizacion = {
        tipo: TipoProducto.Tipo1,
        personalizacion: personalizacionBasica,
        toppings: Object.entries(seleccionesToppings)
          .filter(([_, incluido]) => incluido)
          .map(([id]) => {
            const topping = toppingsGlobales.find(t => t.id === parseInt(id));
            return topping
              ? { id: topping.id, nombre: topping.nombre, precio: topping.precio, activo: topping.activo }
              : { id: parseInt(id), nombre: id.toString(), precio: 0, activo: true };
          }),
        aderezos: Object.entries(seleccionesAderezos)
          .filter(([_, incluido]) => incluido)
          .map(([key]) => key),
        observaciones: allowedSections.includes("observaciones") ? observaciones : "",
      };
    } else if (tipo === TipoProducto.Tipo3) {
      personalizacion = {
        tipo: TipoProducto.Tipo3,
        conMayonesa: personalizacionBasica.conMayonesa,
        conQueso: personalizacionBasica.conQueso,
        tipoQueso: personalizacionBasica.tipoQueso,
        toppings: Object.entries(seleccionesToppings)
          .filter(([_, incluido]) => incluido)
          .map(([id]) => {
            const topping = toppingsGlobales.find(t => t.id === parseInt(id));
            return topping
              ? { id: topping.id, nombre: topping.nombre, precio: topping.precio, activo: topping.activo }
              : { id: parseInt(id), nombre: id.toString(), precio: 0, activo: true };
          }),
        aderezos: Object.entries(seleccionesAderezos)
          .filter(([_, incluido]) => incluido)
          .map(([key]) => key),
        extras: allowedSections.includes("extras")
          ? Object.entries(seleccionesExtras)
              .filter(([_, incluido]) => incluido)
              .map(([key]) => key)
          : [],
        observaciones: allowedSections.includes("observaciones") ? observaciones : "",
      };
    } else if (tipo === TipoProducto.Tipo4) {
      personalizacion = {
        tipo: TipoProducto.Tipo4,
        aderezos: Object.entries(seleccionesAderezos)
          .filter(([_, incluido]) => incluido)
          .map(([key]) => key),
        toppings: Object.entries(seleccionesToppings)
          .filter(([_, incluido]) => incluido)
          .map(([id]) => {
            const topping = toppingsGlobales.find(t => t.id === parseInt(id));
            return topping
              ? { id: topping.id, nombre: topping.nombre, precio: topping.precio, activo: topping.activo }
              : { id: parseInt(id), nombre: id.toString(), precio: 0, activo: true };
          }),
        observaciones: allowedSections.includes("observaciones") ? observaciones : "",
      };
    } else if (tipo === TipoProducto.Tipo5 || tipo === TipoProducto.Tipo6) {
      personalizacion = {
        tipo: tipo,
        observaciones: allowedSections.includes("observaciones") ? observaciones : "",
      };
    } else {
      // Fallback
      personalizacion = {
        tipo: tipo,
        conMayonesa: false,
        conQueso: false,
        tipoQueso: "",
        aderezos: [],
        toppings: [],
        extras: [],
        observaciones: "",
      };
    }

    const item = {
      id: uuidv4(),
      producto,
      personalizacion,
      precio: precioTotal,
    };
    addItem(item);
    setPersonalizando(false);
    setMostrarOpciones(false);
    setMostrarConfirmacion(true);
  };

  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

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
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4">
              {producto.nombre} - Personalización
            </h3>
            {tipo === TipoProducto.Tipo2 ? (
              <>
                <h4 className="text-xl font-bold mb-2">Producto 1</h4>
                <AccordionSection title="Personalización">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={personalizacionSub1.conMayonesa}
                      onChange={(e) =>
                        setPersonalizacionSub1((prev) => ({
                          ...prev,
                          conMayonesa: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Mayonesa casera
                  </label>
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={personalizacionSub1.conQueso}
                      onChange={(e) =>
                        setPersonalizacionSub1((prev) => ({
                          ...prev,
                          conQueso: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Con queso
                  </label>
                  {personalizacionSub1.conQueso && (
                    <select
                      value={personalizacionSub1.tipoQueso}
                      onChange={(e) =>
                        setPersonalizacionSub1((prev) => ({
                          ...prev,
                          tipoQueso: e.target.value,
                        }))
                      }
                      className="mt-2 p-2 border rounded"
                    >
                      <option value="">Selecciona el tipo de queso</option>
                      {["Cheddar", "Tybo", "Azul", "Provolone"].map((cheese) => (
                        <option key={cheese} value={cheese}>
                          {cheese}
                        </option>
                      ))}
                    </select>
                  )}
                </AccordionSection>
                <AccordionSection title="Aderezos">
                  {aderezosGlobales.map((aderezo) => (
                    <label key={aderezo} className="block">
                      <input
                        type="checkbox"
                        checked={personalizacionSub1.aderezos.includes(aderezo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPersonalizacionSub1((prev) => ({
                              ...prev,
                              aderezos: [...prev.aderezos, aderezo],
                            }));
                          } else {
                            setPersonalizacionSub1((prev) => ({
                              ...prev,
                              aderezos: prev.aderezos.filter((a) => a !== aderezo),
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      {aderezo}
                    </label>
                  ))}
                </AccordionSection>
                <AccordionSection title="Observaciones">
                  <textarea
                    value={personalizacionSub1.observaciones}
                    onChange={(e) =>
                      setPersonalizacionSub1((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                    placeholder="Observaciones..."
                    className="w-full p-2 border rounded mt-2"
                    rows={2}
                  ></textarea>
                </AccordionSection>

                <h4 className="text-xl font-bold mt-4 mb-2">Producto 2</h4>
                <AccordionSection title="Personalización">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={personalizacionSub2.conMayonesa}
                      onChange={(e) =>
                        setPersonalizacionSub2((prev) => ({
                          ...prev,
                          conMayonesa: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Mayonesa casera
                  </label>
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={personalizacionSub2.conQueso}
                      onChange={(e) =>
                        setPersonalizacionSub2((prev) => ({
                          ...prev,
                          conQueso: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Con queso
                  </label>
                  {personalizacionSub2.conQueso && (
                    <select
                      value={personalizacionSub2.tipoQueso}
                      onChange={(e) =>
                        setPersonalizacionSub2((prev) => ({
                          ...prev,
                          tipoQueso: e.target.value,
                        }))
                      }
                      className="mt-2 p-2 border rounded"
                    >
                      <option value="">Selecciona el tipo de queso</option>
                      {["Cheddar", "Tybo", "Azul", "Provolone"].map((cheese) => (
                        <option key={cheese} value={cheese}>
                          {cheese}
                        </option>
                      ))}
                    </select>
                  )}
                </AccordionSection>
                <AccordionSection title="Aderezos">
                  {aderezosGlobales.map((aderezo) => (
                    <label key={aderezo} className="block">
                      <input
                        type="checkbox"
                        checked={personalizacionSub2.aderezos.includes(aderezo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPersonalizacionSub2((prev) => ({
                              ...prev,
                              aderezos: [...prev.aderezos, aderezo],
                            }));
                          } else {
                            setPersonalizacionSub2((prev) => ({
                              ...prev,
                              aderezos: prev.aderezos.filter((a) => a !== aderezo),
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      {aderezo}
                    </label>
                  ))}
                </AccordionSection>
                <AccordionSection title="Observaciones">
                  <textarea
                    value={personalizacionSub2.observaciones}
                    onChange={(e) =>
                      setPersonalizacionSub2((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                    placeholder="Observaciones..."
                    className="w-full p-2 border rounded mt-2"
                    rows={2}
                  ></textarea>
                </AccordionSection>
              </>
            ) : (
              <>
                {allowedSections.includes("personalizacion") && (
                  <AccordionSection title="Personalización">
                    <p className="text-sm">(Opciones básicas de personalización)</p>
                    <label className="block">
                      <input
                        type="checkbox"
                        checked={personalizacionBasica.conMayonesa}
                        onChange={(e) =>
                          setPersonalizacionBasica((prev) => ({
                            ...prev,
                            conMayonesa: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      Mayonesa casera
                    </label>
                    <label className="block">
                      <input
                        type="checkbox"
                        checked={personalizacionBasica.conQueso}
                        onChange={(e) =>
                          setPersonalizacionBasica((prev) => ({
                            ...prev,
                            conQueso: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      Con queso
                    </label>
                    {personalizacionBasica.conQueso && (
                      <select
                        value={personalizacionBasica.tipoQueso}
                        onChange={(e) =>
                          setPersonalizacionBasica((prev) => ({
                            ...prev,
                            tipoQueso: e.target.value,
                          }))
                        }
                        className="mt-2 p-2 border rounded"
                      >
                        <option value="">Selecciona el tipo de queso</option>
                        {["Cheddar", "Tybo", "Azul", "Provolone"].map((cheese) => (
                          <option key={cheese} value={cheese}>
                            {cheese}
                          </option>
                        ))}
                      </select>
                    )}
                  </AccordionSection>
                )}
                {allowedSections.includes("aderezos") && (
                  <AccordionSection title="Aderezos">
                    {aderezosGlobales.map((aderezo) => (
                      <label key={aderezo} className="block">
                        <input
                          type="checkbox"
                          checked={seleccionesAderezos[aderezo] || false}
                          onChange={() =>
                            setSeleccionesAderezos((prev) => ({
                              ...prev,
                              [aderezo]: !prev[aderezo],
                            }))
                          }
                          className="mr-2"
                        />
                        {aderezo}
                      </label>
                    ))}
                  </AccordionSection>
                )}
                {allowedSections.includes("toppings") && (
                  <AccordionSection title="Toppings (Máximo 2)">
                    {toppingsGlobales.map((topping) => (
                      <label key={topping.id} className="block">
                        <input
                          type="checkbox"
                          checked={seleccionesToppings[topping.id] || false}
                          onChange={() =>
                            setSeleccionesToppings((prev) => ({
                              ...prev,
                              [topping.id]: !prev[topping.id],
                            }))
                          }
                          className="mr-2"
                        />
                        {topping.nombre} {`(+${topping.precio})`}
                      </label>
                    ))}
                  </AccordionSection>
                )}
                {allowedSections.includes("extras") && (
                  <AccordionSection title="Extras">
                    {extrasGlobales.map((extra) => (
                      <div key={extra}>
                        <label className="block">
                          <input
                            type="checkbox"
                            checked={seleccionesExtras[extra] || false}
                            onChange={() =>
                              setSeleccionesExtras((prev) => ({
                                ...prev,
                                [extra]: !prev[extra],
                              }))
                            }
                            className="mr-2"
                          />
                          {extra} {extra !== "DIPS" && `(+${extrasPrecios[extra as keyof typeof extrasPrecios] || 0})`}
                        </label>
                        {extra === "DIPS" && seleccionesExtras[extra] && (
                          <AccordionSection title="Opciones DIPS" defaultOpen={false}>
                            {dipOptions.map((dip) => (
                              <label key={dip.id} className="block">
                                <input
                                  type="checkbox"
                                  checked={seleccionesDips[dip.id] || false}
                                  onChange={() =>
                                    setSeleccionesDips((prev) => ({
                                      ...prev,
                                      [dip.id]: !prev[dip.id],
                                    }))
                                  }
                                  className="mr-2"
                                />
                                {dip.nombre} {`(+${dip.precio})`}
                              </label>
                            ))}
                          </AccordionSection>
                        )}
                      </div>
                    ))}
                  </AccordionSection>
                )}
                {allowedSections.includes("observaciones") && (
                  <AccordionSection title="Observaciones">
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ingrese observaciones..."
                      className="w-full p-2 border rounded"
                      rows={3}
                    ></textarea>
                  </AccordionSection>
                )}
                {allowedSections.includes("opcion") && (
                  <AccordionSection title="Principal">
                    <label className="block">
                      <input
                        type="radio"
                        name="acompanamiento"
                        value="Nuggets de Pollo"
                        checked={opcionPrincipal === "Nuggets de Pollo"}
                        onChange={(e) => setOpcionPrincipal(e.target.value)}
                        className="mr-2"
                      />
                      Nuggets de Pollo
                    </label>
                    <label className="block">
                      <input
                        type="radio"
                        name="acompanamiento"
                        value="Aros de Cebolla"
                        checked={opcionPrincipal === "Aros de Cebolla"}
                        onChange={(e) => setOpcionPrincipal(e.target.value)}
                        className="mr-2"
                      />
                      Aros de Cebolla
                    </label>
                  </AccordionSection>
                )}
              </>
            )}
            <p className="text-lg font-bold mt-4">Total: ${precioTotal}</p>
            <button
              onClick={agregarAlCarrito}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded w-full"
            >
              Agregar al Carrito
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
      {mostrarConfirmacion && (
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
              Producto agregado al carrito correctamente
            </p>
            <button
              onClick={() => setMostrarConfirmacion(false)}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
