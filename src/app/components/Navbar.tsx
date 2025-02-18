"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-center">
        <ul className="flex space-x-6">
          <li><Link href="/" className="hover:underline">Inicio</Link></li>
          <li><Link href="/menu" className="hover:underline">Menú</Link></li>
          <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
        </ul>
      </div>
    </nav>
  );
}
