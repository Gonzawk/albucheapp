"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  cambiarSeccion: (seccion: string) => void;
}

export default function Navbar({ cambiarSeccion }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Ícono de usuario a la izquierda */}
        <div>
          <Link href="/login">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"  // Tamaño ajustable según necesites
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A7.5 7.5 0 0112 15a7.5 7.5 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>

        {/* Menú centrado */}
        <div className="flex-grow flex justify-center">
          <ul className="flex space-x-6">
            <li>
              <button onClick={() => cambiarSeccion("inicio")} className="hover:underline">
                Inicio
              </button>
            </li>
            <li>
              <button onClick={() => cambiarSeccion("menu")} className="hover:underline">
                Menú
              </button>
            </li>
            <li>
              <button onClick={() => cambiarSeccion("contacto")} className="hover:underline">
                Contacto
              </button>
            </li>
          </ul>
        </div>

        {/* Espacio vacío para balancear el layout (opcional) */}
        <div className="w-5"></div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-black shadow mt-2">
          <div className="px-4 py-2 space-y-2">
            <ul className="flex flex-col space-y-2">
              <li>
                <button
                  onClick={() => {
                    cambiarSeccion("inicio");
                    setMobileMenuOpen(false);
                  }}
                  className="block hover:underline"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    cambiarSeccion("menu");
                    setMobileMenuOpen(false);
                  }}
                  className="block hover:underline"
                >
                  Menú
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    cambiarSeccion("contacto");
                    setMobileMenuOpen(false);
                  }}
                  className="block hover:underline"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </nav>
  );
}
