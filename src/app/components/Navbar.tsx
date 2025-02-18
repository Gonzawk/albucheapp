"use client";
import React from "react";

interface NavbarProps {
  cambiarSeccion: (seccion: string) => void;
}

export default function Navbar({ cambiarSeccion }: NavbarProps) {
  return (
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-center">
        <ul className="flex space-x-6">
          <li><button onClick={() => cambiarSeccion("inicio")} className="hover:underline">Inicio</button></li>
          <li><button onClick={() => cambiarSeccion("menu")} className="hover:underline">Menú</button></li>
          <li><button onClick={() => cambiarSeccion("contacto")} className="hover:underline">Contacto</button></li>
        </ul>
      </div>
    </nav>
  );
}
