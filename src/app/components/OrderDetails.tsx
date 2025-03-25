"use client";
import React from "react";
import { TipoProducto } from "../../app/config/personalizacionConfig";

interface OrderDetailsProps {
  data: {
    nombreCliente?: string;
    metodoEntrega?: "retiro" | "delivery" | null;
    direccion?: {
      calle: string;
      numero: string;
      piso?: string;
      departamento?: string;
    } | null;
    metodoPago?: "Efectivo" | "Transferencia" | null;
    items: any[]; // Puedes tipificarlo según tu modelo
    total: number;
  };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ data }) => {
  return (
    <div>
      {data.nombreCliente && (
        <p>
          <strong>Cliente:</strong> {data.nombreCliente}
        </p>
      )}
      {data.metodoEntrega && (
        <p>
          <strong>Método de Entrega:</strong>{" "}
          {data.metodoEntrega === "delivery" ? "Delivery" : "Retiro en el Local"}
        </p>
      )}
      {data.metodoEntrega === "delivery" && data.direccion && (
        <p>
          <strong>Dirección:</strong> Calle {data.direccion.calle}, Nº {data.direccion.numero}
          {data.direccion.piso && `, Piso: ${data.direccion.piso}`}
          {data.direccion.departamento && `, Dept: ${data.direccion.departamento}`}
        </p>
      )}
      {data.metodoPago && (
        <p>
          <strong>Método de Pago:</strong> {data.metodoPago}
        </p>
      )}
      <h3 className="mt-4 font-bold">Productos:</h3>
      <div>
        {data.items.map((item, index) => {
          const key = item?.producto?.id
            ? `prod-${item.producto.id}`
            : `prod-${index}`;
          return (
            <div key={key} className="border p-2 my-2">
              <p>
                <strong>Producto:</strong> {item.producto.nombre}
              </p>
              <p>
                <strong>Precio:</strong> ${item.precio}
              </p>

              {item.personalizacion && item.personalizacion.tipo === TipoProducto.Tipo1 && (
                <div className="ml-4">
                  <p className="font-bold">Promo Tipo 1:</p>
                  <p>
                    Mayonesa:{" "}
                    {item.personalizacion.personalizacion.conMayonesa ? "Sí" : "No"}
                  </p>
                  <p>
                    Con queso:{" "}
                    {item.personalizacion.personalizacion.conQueso ? "Sí" : "No"}
                  </p>
                  {item.personalizacion.personalizacion.conQueso &&
                    item.personalizacion.personalizacion.tipoQueso && (
                      <p>
                        Tipo de queso: {item.personalizacion.personalizacion.tipoQueso}
                      </p>
                    )}
                  {item.personalizacion.toppings &&
                    item.personalizacion.toppings.length > 0 && (
                      <p>
                        Toppings:{" "}
                        {item.personalizacion.toppings
                          .map((t: any) => t.nombre)
                          .join(", ")}
                      </p>
                    )}
                  {item.personalizacion.aderezos &&
                    item.personalizacion.aderezos.length > 0 && (
                      <p>
                        Aderezos: {item.personalizacion.aderezos.join(", ")}
                      </p>
                    )}
                  {item.personalizacion.observaciones &&
                    item.personalizacion.observaciones.trim() && (
                      <p>
                        Observaciones: {item.personalizacion.observaciones}
                      </p>
                    )}
                </div>
              )}

              {item.personalizacion && item.personalizacion.tipo === TipoProducto.Tipo2 && (
                <div className="ml-4">
                  <p className="font-bold">Tipo 2:</p>
                  <div>
                    <p className="font-semibold">Subproducto 1:</p>
                    <p>
                      Mayonesa:{" "}
                      {item.personalizacion.subproducto1.conMayonesa ? "Sí" : "No"}
                    </p>
                    <p>
                      Con queso:{" "}
                      {item.personalizacion.subproducto1.conQueso ? "Sí" : "No"}
                    </p>
                    {item.personalizacion.subproducto1.conQueso &&
                      item.personalizacion.subproducto1.tipoQueso && (
                        <p>
                          Tipo de queso: {item.personalizacion.subproducto1.tipoQueso}
                        </p>
                      )}
                    {item.personalizacion.subproducto1.aderezos &&
                      item.personalizacion.subproducto1.aderezos.length > 0 && (
                        <p>
                          Aderezos: {item.personalizacion.subproducto1.aderezos.join(", ")}
                        </p>
                      )}
                    {item.personalizacion.subproducto1.observaciones &&
                      item.personalizacion.subproducto1.observaciones.trim() && (
                        <p>
                          Observaciones: {item.personalizacion.subproducto1.observaciones}
                        </p>
                      )}
                  </div>
                  <hr className="my-2" />
                  <div>
                    <p className="font-semibold">Subproducto 2:</p>
                    <p>
                      Mayonesa:{" "}
                      {item.personalizacion.subproducto2.conMayonesa ? "Sí" : "No"}
                    </p>
                    <p>
                      Con queso:{" "}
                      {item.personalizacion.subproducto2.conQueso ? "Sí" : "No"}
                    </p>
                    {item.personalizacion.subproducto2.conQueso &&
                      item.personalizacion.subproducto2.tipoQueso && (
                        <p>
                          Tipo de queso: {item.personalizacion.subproducto2.tipoQueso}
                        </p>
                      )}
                    {item.personalizacion.subproducto2.aderezos &&
                      item.personalizacion.subproducto2.aderezos.length > 0 && (
                        <p>
                          Aderezos: {item.personalizacion.subproducto2.aderezos.join(", ")}
                        </p>
                      )}
                    {item.personalizacion.subproducto2.observaciones &&
                      item.personalizacion.subproducto2.observaciones.trim() && (
                        <p>
                          Observaciones: {item.personalizacion.subproducto2.observaciones}
                        </p>
                      )}
                  </div>
                </div>
              )}

              {item.personalizacion && item.personalizacion.tipo === TipoProducto.Tipo3 && (
                <div className="ml-4">
                  <p className="font-bold">Hamburguesa Completa:</p>
                  <p>
                    Mayonesa: {item.personalizacion.conMayonesa ? "Sí" : "No"}
                  </p>
                  <p>
                    Con queso: {item.personalizacion.conQueso ? "Sí" : "No"}
                  </p>
                  {item.personalizacion.conQueso &&
                    item.personalizacion.tipoQueso && (
                      <p>Tipo de queso: {item.personalizacion.tipoQueso}</p>
                    )}
                  {item.personalizacion.toppings &&
                    item.personalizacion.toppings.length > 0 && (
                      <p>
                        Toppings:{" "}
                        {item.personalizacion.toppings
                          .map((t: any) => t.nombre)
                          .join(", ")}
                      </p>
                    )}
                  {item.personalizacion.aderezos &&
                    item.personalizacion.aderezos.length > 0 && (
                      <p>Aderezos: {item.personalizacion.aderezos.join(", ")}</p>
                    )}
                  {item.personalizacion.extras &&
                    item.personalizacion.extras.length > 0 && (
                      <p>Extras: {item.personalizacion.extras.join(", ")}</p>
                    )}
                  {item.personalizacion.observaciones &&
                    item.personalizacion.observaciones.trim() && (
                      <p>Observaciones: {item.personalizacion.observaciones}</p>
                    )}
                </div>
              )}

              {item.personalizacion && item.personalizacion.tipo === TipoProducto.Tipo4 && (
                <div className="ml-4">
                  <p className="font-bold">Sandwich:</p>
                  {item.personalizacion.aderezos &&
                    item.personalizacion.aderezos.length > 0 && (
                      <p>Aderezos: {item.personalizacion.aderezos.join(", ")}</p>
                    )}
                  {item.personalizacion.toppings &&
                    item.personalizacion.toppings.length > 0 && (
                      <p>
                        Toppings:{" "}
                        {item.personalizacion.toppings
                          .map((t: any) => t.nombre)
                          .join(", ")}
                      </p>
                    )}
                  {item.personalizacion.observaciones &&
                    item.personalizacion.observaciones.trim() && (
                      <p>Observaciones: {item.personalizacion.observaciones}</p>
                    )}
                </div>
              )}

              {(item.personalizacion &&
                (item.personalizacion.tipo === TipoProducto.Tipo5 ||
                  item.personalizacion.tipo === TipoProducto.Tipo6)) && (
                <div className="ml-4">
                  <p className="font-bold">Observaciones:</p>
                  <p>{item.personalizacion.observaciones}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4">
        <strong>Total:</strong> ${data.total}
      </p>
    </div>
  );
};

export default OrderDetails;
