import { TipoProducto } from "./TipoProducto";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  tipoProducto: TipoProducto;
  PersonalizacionSchema?: string;
}
