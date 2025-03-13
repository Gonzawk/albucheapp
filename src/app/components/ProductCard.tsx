"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Producto } from "../../../types/product";
import { motion } from "framer-motion";
import toppingsData from "../../../public/data/toppings.json";
import { useCart, Personalizacion } from "../../app/context/CartContext";
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
  // Se agrega extrasPrecios para calcular el costo de extras.
  const extrasPrecios = {
    "Medallón Veggie": 1500,
    "Medallón de Carne": 1700,
    "Dips de Aderezo": 0, // No se usa precio base, se sumará por cada sub-opción
  };
  const DIP_COST = 400; // Cada sub-opción de DIP cuesta $400

  // IDs para distinguir promociones
  const promoTipo1Ids = [11, 12, 13, 14];
  const promoTipo2Ids = [7, 8, 9, 10];
  const isPromoTipo1 = promoTipo1Ids.includes(producto.id);
  const isPromoTipo2 = promoTipo2Ids.includes(producto.id);

  // Variables de categoría
  const categoria = producto.categoria || "";
  const isParaAcompañar = categoria === "Para acompañar";
  const isAcompañarCustom = isParaAcompañar && producto.id === 24;
  // Para sandwiches, se mostrarán solo Aderezos, Toppings y Observaciones
  const isSandwich = categoria.toLowerCase() === "sandwiches";
  // Para Veggies, si el id es 5 o 16, se mostrarán solo Aderezos, Toppings y Observaciones
  const isVeggieSimple = categoria === "Veggies" && (producto.id === 5 || producto.id === 16);
  // Si es Veggies se usan "Medallón Veggie", sino "Medallón de Carne"
  const extrasOptionsLocal = categoria === "Veggies" ? ["Medallón Veggie", "Dips de Aderezo"] : ["Medallón de Carne", "Dips de Aderezo"];
  // En Veggies, en general, se ocultan Extras para ciertos ids (pero en este caso se reemplaza la personalización completa)
  const hideExtras = categoria === "Veggies" && (producto.id === 5 || producto.id === 16);

  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [toppingsGlobales, setToppingsGlobales] = useState<Record<string, number>>({});
  const [precioTotal, setPrecioTotal] = useState(producto.precio);

  // Estados para personalización completa
  const [conMayonesa, setConMayonesa] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [tipoQueso, setTipoQueso] = useState("");
  const cheeseTypes = ["Cheddar", "Tybo", "Azul", "Provolone"];

  const [seleccionesExtras, setSeleccionesExtras] = useState<Record<string, boolean>>(
    extrasOptionsLocal.reduce((acc: Record<string, boolean>, extra) => {
      acc[extra] = false;
      return acc;
    }, {})
  );
  // Estado para las sub-opciones de DIP de Aderezo
  const [dipAderezoSelections, setDipAderezoSelections] = useState<Record<string, boolean>>({
    "Mayonesa Casera": false,
    "Salsa de la casa": false,
    "Savora": false,
    "Ketchup": false,
  });
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

  // Estado para la personalización custom de "Para acompañar" (producto id:24)
  const [acompañarCustomization, setAcompañarCustomization] = useState(
    isAcompañarCustom
      ? {
          opcion: "",
          seleccionesAderezos: aderezos.reduce((acc: Record<string, boolean>, aderezo: string) => {
            acc[aderezo] = false;
            return acc;
          }, {} as Record<string, boolean>),
          observaciones: "",
        }
      : null
  );

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

  useEffect(() => {
    if (!isPromoTipo1 && !isPromoTipo2) {
      const costoToppings = Object.entries(seleccionesToppings)
        .filter(([_, incluido]) => incluido)
        .reduce((total, [topping]) => total + (toppingsGlobales[topping] || 0), 0);
      const costoExtras = Object.entries(seleccionesExtras)
        .filter(([_, incluido]) => incluido)
        .reduce((total, [extra]) => {
          if (extra === "Dips de Aderezo") {
            const countDip = Object.values(dipAderezoSelections).filter(v => v).length;
            return total + (DIP_COST * countDip);
          }
          return total + (extrasPrecios[extra as keyof typeof extrasPrecios] || 0);
        }, 0);
      setPrecioTotal(producto.precio + costoToppings + costoExtras);
    }
  }, [seleccionesToppings, seleccionesExtras, dipAderezoSelections, toppingsGlobales, producto.precio, isPromoTipo1, isPromoTipo2]);

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
    let personalizacion: Personalizacion;
    if (isPromoTipo1) {
      personalizacion = {
        tipo: "completo",
        conMayonesa: false,
        conQueso: false,
        tipoQueso: "",
        aderezos: [],
        toppings: [],
        extras: [],
        observaciones: JSON.stringify(promoType1Customizations),
        hamburguesas: promoType1Customizations,
      };
      const item = { id: uuidv4(), producto, personalizacion, precio: producto.precio };
      addItem(item);
    } else if (isPromoTipo2 && promoType2Customization) {
      personalizacion = {
        tipo: "completo",
        conMayonesa: promoType2Customization.conMayonesa,
        conQueso: promoType2Customization.conQueso,
        tipoQueso: promoType2Customization.tipoQueso,
        aderezos: Object.entries(promoType2Customization.seleccionesAderezos)
          .filter(([_, included]) => included)
          .map(([a]) => a),
        toppings: Object.entries(promoType2Customization.seleccionesToppings)
          .filter(([_, included]) => included)
          .map(([t]) => t),
        extras: [],
        observaciones: promoType2Customization.observaciones,
      };
      const item = { id: uuidv4(), producto, personalizacion, precio: producto.precio };
      addItem(item);
    } else {
      if (producto.categoria === "Para acompañar") {
        if (isAcompañarCustom && acompañarCustomization) {
          personalizacion = {
            tipo: "acompanar",
            opcion: acompañarCustomization.opcion,
            dips: Object.entries(acompañarCustomization.seleccionesAderezos)
              .filter(([_, incluido]) => incluido)
              .map(([a]) => a),
            observaciones: acompañarCustomization.observaciones,
          };
          const item = { id: uuidv4(), producto, personalizacion, precio: producto.precio };
          addItem(item);
        } else {
          personalizacion = {
            tipo: "observaciones",
            observaciones,
          };
          const item = { id: uuidv4(), producto, personalizacion, precio: producto.precio };
          addItem(item);
        }
      } else {
        if (isVeggieSimple) {
          // Para Veggies con id 5 o 16, solo se guardan Aderezos, Toppings y Observaciones
          personalizacion = {
            tipo: "completo",
            conMayonesa: false,
            conQueso: false,
            tipoQueso: "",
            aderezos: Object.entries(seleccionesAderezos)
              .filter(([_, incluido]) => incluido)
              .map(([a]) => a),
            toppings: Object.entries(seleccionesToppings)
              .filter(([_, incluido]) => incluido)
              .map(([t]) => t),
            extras: [], // No se usan extras en estos Veggies
            observaciones,
          };
        } else if (isSandwich) {
          // Para sandwiches, se muestran solo Aderezos, Toppings y Observaciones
          personalizacion = {
            tipo: "completo",
            conMayonesa: false,
            conQueso: false,
            tipoQueso: "",
            aderezos: Object.entries(seleccionesAderezos)
              .filter(([_, incluido]) => incluido)
              .map(([a]) => a),
            toppings: Object.entries(seleccionesToppings)
              .filter(([_, incluido]) => incluido)
              .map(([t]) => t),
            extras: [],
            observaciones,
          };
        } else {
          personalizacion = {
            tipo: "completo",
            conMayonesa,
            conQueso,
            tipoQueso,
            aderezos: Object.entries(seleccionesAderezos)
              .filter(([_, incluido]) => incluido)
              .map(([a]) => a),
            toppings: Object.entries(seleccionesToppings)
              .filter(([_, incluido]) => incluido)
              .map(([t]) => t),
            extras: (categoria === "Veggies" && (producto.id === 5 || producto.id === 16))
              ? []
              : Object.entries(seleccionesExtras)
                  .filter(([_, incluido]) => incluido)
                  .reduce((acc: string[], [e]) => {
                    if (e === "Dips de Aderezo") {
                      return acc;
                    }
                    acc.push(e);
                    return acc;
                  }, []),
            observaciones,
          };
        }
        const item = { id: uuidv4(), producto, personalizacion, precio: isVeggieSimple || isSandwich ? producto.precio : precioTotal };
        addItem(item);
      }
    }
    setMostrarOpciones(false);
    setPersonalizando(false);
  };

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
              <>
                {isParaAcompañar ? (
                  producto.id === 24 && acompañarCustomization ? (
                    <>
                      <AccordionSection title="Principal">
                        <label className="block">
                          <input
                            type="radio"
                            name="acompanamiento"
                            value="Nuggets de Pollo"
                            checked={acompañarCustomization.opcion === "Nuggets de Pollo"}
                            onChange={(e) =>
                              setAcompañarCustomization({
                                ...acompañarCustomization,
                                opcion: e.target.value,
                              })
                            }
                            className="mr-2"
                          />
                          Nuggets de Pollo
                        </label>
                        <label className="block">
                          <input
                            type="radio"
                            name="acompanamiento"
                            value="Aros de Cebolla"
                            checked={acompañarCustomization.opcion === "Aros de Cebolla"}
                            onChange={(e) =>
                              setAcompañarCustomization({
                                ...acompañarCustomization,
                                opcion: e.target.value,
                              })
                            }
                            className="mr-2"
                          />
                          Aros de Cebolla
                        </label>
                      </AccordionSection>
                      <AccordionSection title="DIPS (2 Dos)">
                        {aderezos.map((aderezo) => {
                          const currentCount = Object.values(acompañarCustomization.seleccionesAderezos).filter(Boolean).length;
                          const isChecked = acompañarCustomization.seleccionesAderezos[aderezo] || false;
                          return (
                            <label key={aderezo} className="block">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newValue = e.target.checked;
                                  if (newValue && currentCount >= 2) return;
                                  setAcompañarCustomization({
                                    ...acompañarCustomization,
                                    seleccionesAderezos: {
                                      ...acompañarCustomization.seleccionesAderezos,
                                      [aderezo]: newValue,
                                    },
                                  });
                                }}
                                className="mr-2"
                              />
                              {aderezo}
                            </label>
                          );
                        })}
                      </AccordionSection>
                      <AccordionSection title="Observaciones">
                        <textarea
                          value={acompañarCustomization.observaciones}
                          onChange={(e) =>
                            setAcompañarCustomization({
                              ...acompañarCustomization,
                              observaciones: e.target.value,
                            })
                          }
                          placeholder="Ingrese alguna observación..."
                          className="w-full p-2 border rounded"
                          rows={3}
                        ></textarea>
                      </AccordionSection>
                    </>
                  ) : (
                    <AccordionSection title="Observaciones">
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Ingrese alguna observación...(sin sal, etc)"
                        className="w-full p-2 border rounded"
                        rows={3}
                      ></textarea>
                    </AccordionSection>
                  )
                ) : isSandwich || isVeggieSimple ? (
                  <>
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
                ) : (
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
                    {!hideExtras && (
                      <AccordionSection title="Extras">
                        {extrasOptionsLocal.map((extra) => (
                          <label key={extra} className="block">
                            <input
                              type="checkbox"
                              checked={seleccionesExtras[extra]}
                              onChange={() => toggleExtra(extra)}
                              className="mr-2"
                            />
                            {extra} {extra !== "Dips de Aderezo" && `(+${extrasPrecios[extra as keyof typeof extrasPrecios]})`}
                          </label>
                        ))}
                        {seleccionesExtras["Dips de Aderezo"] && (
                          <AccordionSection title="Selecciona DIP de Aderezo" defaultOpen={true}>
                            {Object.keys(dipAderezoSelections).map(option => (
                              <label key={option} className="block">
                                <input
                                  type="checkbox"
                                  checked={dipAderezoSelections[option]}
                                  onChange={() =>
                                    setDipAderezoSelections(prev => ({ ...prev, [option]: !prev[option] }))
                                  }
                                  className="mr-2"
                                />
                                {option} (+${DIP_COST})
                              </label>
                            ))}
                          </AccordionSection>
                        )}
                      </AccordionSection>
                    )}
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
              </>
            )}
            <p className="text-lg font-bold mt-4">
              Total: ${isPromoTipo1 || isPromoTipo2 ? promoPrecioTotal : precioTotal}
            </p>
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
