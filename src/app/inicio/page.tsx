"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-red-600 p-6 text-white text-center text-3xl font-bold shadow-md">
        Bienvenido a Rostisería
      </header>
      <main className="p-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl font-bold mb-6">Las mejores hamburguesas y lomos</h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          Disfruta de los sabores más irresistibles, con ingredientes frescos y de calidad. Ordena tu comida favorita ahora mismo.
        </p>
        <Image src="" width={800} height={500} alt="Imagen de la Rostisería" className="rounded-lg shadow-lg mb-8 object-cover w-full max-w-3xl" />
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/menu" className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-all">
            Ver Menú
          </Link>
         {/* <Link href="/contacto" className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all">
            Contacto
          </Link>*/} 
        </div>
      </main>
      <footer className="bg-gray-800 text-white text-center p-6 mt-8 text-lg">
        &copy; 2024 Rostisería - Todos los derechos reservados.
      </footer>
    </div>
  );
}
