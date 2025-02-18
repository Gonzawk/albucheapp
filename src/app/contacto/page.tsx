"use client";
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { useImage } from '../context/ImageContext';

export default function Contacto() {
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
        <h1 className="text-5xl font-bold mb-6">Contáctanos</h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          ¡Estamos aquí para atenderte! Puedes visitarnos, llamarnos o escribirnos por WhatsApp.
        </p>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl text-left w-full max-w-3xl border border-gray-200">
          <h2 className="text-3xl font-semibold mb-4 text-center text-black-600">Información de Contacto</h2>
          <p className="text-lg text-gray-800 mb-2"><strong>📞 Teléfono:</strong> +54 351 </p>
          <p className="text-lg text-gray-800 mb-2"><strong>📧 Email:</strong> contacto@rostiseria.com</p>
          <p className="text-lg text-gray-800 mb-4"><strong>📍 Dirección:</strong> Bv Pte. Umberto Arturo Illia 499, X5000 Córdoba</p>
          
          <h2 className="text-3xl font-semibold mt-6 mb-4 text-center text-black-600">Ubicación</h2>
          <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border border-gray-300">
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123456.78901234567!2d-64.188775!3d-31.4173395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432999999999999%3A0x9999999999999999!2sRostiser%C3%ADa!5e0!3m2!1ses-419!2sar!4v1610000000000"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-6 mt-16 text-lg">
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
