"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface ImageContextType {
  imagenPortada: string;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [imagenPortada, setImagenPortada] = useState("https://i.ibb.co/q3BRdshT/Albucheportada.jpg");

  useEffect(() => {
    const actualizarImagen = () => {
      if (window.innerWidth >= 768) {
        setImagenPortada("https://i.ibb.co/RkrHd3dS/Albucheportadaweb.jpg");
      } else {
        setImagenPortada("https://i.ibb.co/q3BRdshT/Albucheportada.jpg");
      }
    };

    actualizarImagen();
    window.addEventListener("resize", actualizarImagen);
    return () => window.removeEventListener("resize", actualizarImagen);
  }, []);

  return (
    <ImageContext.Provider value={{ imagenPortada }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage debe ser usado dentro de un ImageProvider");
  }
  return context;
}
