"use client";
import { useEffect, useState } from 'react';
import { Producto } from '../../../types/product';
import { getProductos } from '../../../lib/API/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    getProductos().then(setProductos);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-red-600 p-6 text-white text-center text-3xl font-bold shadow-md">
        Rostisería - Menú Personalizable
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Nuestro Menú</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productos.map(producto => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
        
      </main>
      <footer className="bg-gray-800 text-white text-center p-6 mt-8 text-lg">
        &copy; 2024 Rostisería - Todos los derechos reservados.
      </footer>
    </div>
  );
}