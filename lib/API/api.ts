import { Producto } from '../../types/Producto';

export async function getProductos(): Promise<Producto[]> {
  if (typeof window === 'undefined') return [];
  const res = await fetch('/data/productos.json');
  const productos = await res.json();
  return productos;
}