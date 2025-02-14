"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-red-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rostisería</h1>
        <ul className="flex space-x-4">
          <li><Link href="/inicio" className="hover:underline">Inicio</Link></li>
          <li><Link href="/menu" className="hover:underline">Menú</Link></li>
          <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
        </ul>
      </div>
    </nav>
  );
}
