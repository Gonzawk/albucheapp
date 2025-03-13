"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Personalizacion =
  | {
      tipo: "completo";
      conMayonesa: boolean;
      conQueso: boolean;
      tipoQueso: string;
      aderezos: string[];
      toppings: string[];
      extras: string[];
      observaciones: string;
      hamburguesas?: any[]; // Opcional para promos
    }
  | {
      tipo: "observaciones";
      observaciones: string;
    }
  | {
      tipo: "acompanar";
      opcion: string;
      dips: string[];
      observaciones: string;
    };

export interface CartItem {
  id: string;
  producto: any;
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
