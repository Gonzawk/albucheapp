"use client";
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../src/app/components/Navbar';
import { useImage } from '../app/context/ImageContext';

export default function Inicio() {
  const { imagenPortada } = useImage();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col relative">
      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image 
          src={imagenPortada} 
          alt="Rostisería"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </header>
      
      {/* Navbar pegado debajo de la imagen */}
      <div className="sticky top-0 z-50 md:relative md:top-auto">
        <Navbar />
      </div>
      
      <main className="p-6 max-w-6xl mx-auto flex flex-col items-center text-center flex-grow">
        <h1 className="text-5xl font-bold mb-6">Bienvenidos</h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          Disfruta de los sabores más irresistibles, con ingredientes frescos y de calidad. Pide tu hamburguesa favorita ahora!.
        </p>
       
        <Image 
          src="https://i.ibb.co/TqHL0pP2/Fondo.jpg" 
          width={800} 
          height={500} 
          alt="Imagen de la Rostisería" 
          className="rounded-lg shadow-lg mb-8 object-cover w-full max-w-3xl"
        />
         <div className="flex flex-col md:flex-row gap-4">
          <Link href="/menu" className="bg-green-500 text-white px-12 py-3 mb-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-all">
            Ver Menú
          </Link>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/contacto" className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-all">
            Ver Contacto
          </Link>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-6 mt-5 text-lg">
       Todos los derechos reservados. <br />
       <a 
         href="https://portafoliowebgonzadev.netlify.app/" 
         target="_blank" 
         rel="noopener noreferrer" 
         className="text-blue-400 hover:underline"
       >
         &copy; GonzaDev
       </a> 
       <span className="mx-2">-</span>
       <a 
         href="mailto:gdp43191989@gmail.com" 
         className="text-blue-400 hover:underline"
       >
         gdp43191989@gmail.com
       </a>
     </footer>
    </div>
  );
}
