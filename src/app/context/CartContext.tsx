"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { TipoProducto } from "../config/personalizacionConfig";
import { Topping } from "../../../types/Topping"; // Importa la interfaz Topping

// Definimos el tipo Personalizacion basado en el esquema de cada TipoProducto
export type Personalizacion =
  | {
      tipo: TipoProducto.Tipo1;
      // Promo Tipo 1: permite personalización, aderezos, toppings y observaciones.
      personalizacion?: any; // se puede ampliar si se requiere más detalle
      aderezos?: string[];
      toppings: Topping[]; // Actualizado a Topping[]
      observaciones?: string;
    }
  | {
      tipo: TipoProducto.Tipo2;
      // Tipo 2: 2 productos sin toppings, cada uno con su propia personalización
      subproducto1: {
        conMayonesa: boolean;
        conQueso: boolean;
        tipoQueso: string;
        aderezos: string[];
        observaciones: string;
      };
      subproducto2: {
        conMayonesa: boolean;
        conQueso: boolean;
        tipoQueso: string;
        aderezos: string[];
        observaciones: string;
      };
    }
  | {
      tipo: TipoProducto.Tipo3;
      // Hamburguesas: personalización completa
      conMayonesa: boolean;
      conQueso: boolean;
      tipoQueso: string;
      toppings: Topping[]; // Actualizado a Topping[]
      aderezos: string[];
      extras: string[];
      observaciones?: string;
    }
  | {
      tipo: TipoProducto.Tipo4;
      // Sandwiches: aderezos, toppings y observaciones
      aderezos: string[];
      toppings: Topping[]; // Actualizado a Topping[]
      observaciones: string;
    }
  | {
      tipo: TipoProducto.Tipo5;
      // Para Acompañar: solo observaciones
      observaciones: string;
    }
  | {
      tipo: TipoProducto.Tipo6;
      // Minutas: solo observaciones
      observaciones: string;
    }
  | {
      // Caso adicional: si se requiere el tipo "acompanar" fuera del enum
      tipo: "acompanar";
      opcion: string;
      dips: string[];
      observaciones: string;
    }
  | {
      // Caso adicional: si se requiere el tipo "sandwich" de forma diferenciada
      tipo: "sandwich";
      aderezos: string[];
      toppings: Topping[]; // Actualizado a Topping[]
      observaciones: string;
    };

export interface CartItem {
  id: string;
  producto: any; // Puedes tipificarlo según tu modelo
  personalizacion: Personalizacion;
  precio: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
