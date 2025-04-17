// app/context/CartContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { TipoProducto } from "../config/personalizacionConfig";
import { Topping } from "../../../types/Topping";

// --- Tus tipos existentes ---
export type Personalizacion =
  | {
      tipo: TipoProducto.Tipo1;
      personalizacion?: any;
      aderezos?: string[];
      toppings: Topping[];
      observaciones?: string;
    }
  | {
      tipo: TipoProducto.Tipo2;
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
      conMayonesa: boolean;
      conQueso: boolean;
      tipoQueso: string;
      toppings: Topping[];
      aderezos: string[];
      extras: string[];
      observaciones?: string;
    }
  | {
      tipo: TipoProducto.Tipo4;
      aderezos: string[];
      toppings: Topping[];
      observaciones: string;
    }
  | {
      tipo: TipoProducto.Tipo5;
      observaciones: string;
    }
  | {
      tipo: TipoProducto.Tipo6;
      observaciones: string;
    }
  | {
      tipo: "acompanar";
      opcion: string;
      dips: string[];
      observaciones: string;
    }
  | {
      tipo: "sandwich";
      aderezos: string[];
      toppings: Topping[];
      observaciones: string;
    };

export interface CartItem {
  id: string;
  producto: any;
  personalizacion: Personalizacion;
  precio: number;
}

// --- Extensión para llevar mesaId y mesaNombre ---
interface CartContextType {
  mesaId: string;
  mesaNombre: string;
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

// Contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider recibe ahora mesaId y mesaNombre
export const CartProvider = ({
  children,
  mesaId,
  mesaNombre,
}: {
  children: ReactNode;
  mesaId: string;
  mesaNombre: string;
}) => {
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
    <CartContext.Provider
      value={{ mesaId, mesaNombre, items, addItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook para usarlo en tus componentes
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};
