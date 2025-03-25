import { TipoProducto } from "./TipoProducto";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  tipoProducto: number;
  // Agregar esta línea si corresponde:
  aderezos?: string[];
}

