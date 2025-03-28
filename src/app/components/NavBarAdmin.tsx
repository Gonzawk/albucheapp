"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";

export default function NavBarAdmin() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  // Menú base para las rutas de Productos, Toppings, Aderezos y Extras
  const baseLinks = [
    { label: "Panel", href: "/admin-panel" },
    { label: "Productos", href: "/admin-panel/productos" },
    { label: "Toppings", href: "/admin-panel/toppings" },
    { label: "Aderezos", href: "/admin-panel/aderezos" },
    { label: "Extras", href: "/admin-panel/extras" },
  ];

  let links: { label: string; href: string }[] = [];

  if (
    pathname.startsWith("/admin-panel/pedidos") ||
    pathname.startsWith("/admin-panel/categorias") ||
    pathname.startsWith("/admin-panel/configuracion")
  ) {
    // En estas rutas se muestra solo la opción de Panel
    links = [{ label: "Panel", href: "/admin-panel" }];
  } else if (
    pathname.startsWith("/admin-panel/productos") ||
    pathname.startsWith("/admin-panel/toppings") ||
    pathname.startsWith("/admin-panel/aderezos") ||
    pathname.startsWith("/admin-panel/extras")
  ) {
    // Se muestra el menú base, quitando la opción correspondiente a la ruta actual
    links = baseLinks.filter(
      (link) =>
        link.href === "/admin-panel" ||
        // Compara solo la parte base de la ruta (por ejemplo, si estamos en /admin-panel/productos se elimina ese enlace)
        !pathname.startsWith(link.href)
    );
  } else if (pathname === "/admin-panel") {
    // En la ruta principal se muestran las opciones del panel principal
    links = [
      { label: "Categorías", href: "/admin-panel/categorias" },
      { label: "Productos", href: "/admin-panel/productos" },
      { label: "Pedidos", href: "/admin-panel/pedidos" },
      { label: "Configuración", href: "/admin-panel/configuracion" },
    ];
  } else if (pathname.startsWith("/admin-panel/reportes")) {
    // Ejemplo para una nueva ruta: Reportes
    links = [
      { label: "Panel", href: "/admin-panel" },
      { label: "Reportes", href: "/admin-panel/reportes" },
      { label: "Configuración", href: "/admin-panel/configuracion" },
    ];
  } else {
    // Fallback
    links = [{ label: "Panel", href: "/admin-panel" }];
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Panel de Administración
        </h1>
        {/* Menú de escritorio */}
        <nav className="hidden md:flex space-x-4 items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </nav>
        {/* Botón para menú móvil */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focus:outline-none text-gray-700 dark:text-gray-200 hover:text-blue-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Menú móvil */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-800 shadow mt-2">
          <div className="px-4 py-2 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
