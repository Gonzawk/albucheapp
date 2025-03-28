"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white text-center p-6 mt-10 text-lg w-full">
      Todos los derechos reservados. <br />
      <a 
        href="https://portafoliowebgonzadev.netlify.app/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-400 hover:underline"
      >
        &copy;GonzaDev
      </a> 
      <span className="mx-2">-</span>
      <a 
        href="mailto:gdp43191989@gmail.com" 
        className="text-blue-400 hover:underline"
      >
        gdp43191989@gmail.com
      </a>
    </footer>
  );
}
