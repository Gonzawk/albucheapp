'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null; // Se expone el token
  tokenPayload: any | null;
  login: (token: string, keepSession?: boolean) => void;
  logout: () => void;
  setTokenPayload: (payload: any | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  tokenPayload: null,
  login: () => {},
  logout: () => {},
  setTokenPayload: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenPayload, setTokenPayload] = useState<any | null>(null);

  // Función para decodificar el JWT
  const parseJwt = (token: string): any | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      console.log('Token decodificado:', payload);
      return payload;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  };

  // Al montar, intentamos recuperar el token de localStorage o sessionStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const payload = parseJwt(storedToken);
      setTokenPayload(payload);
    }
  }, []);

  // Función para iniciar sesión: guarda el token, actualiza el estado y crea la cookie necesaria
  const login = (token: string, keepSession: boolean = false) => {
    if (keepSession) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    // Crear cookie "token" para que el middleware (lado servidor) pueda acceder
    document.cookie = `token=${token}; path=/; samesite=lax;`;
    setToken(token);
    const payload = parseJwt(token);
    setTokenPayload(payload);
    console.log('Login realizado con token:', token);
  };

  // Función para cerrar sesión: elimina token de ambos almacenamientos, la cookie y actualiza el estado
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    setToken(null);
    setTokenPayload(null);
    console.log('Logout realizado, token eliminado');
  };

  return (
    <AuthContext.Provider value={{ token, tokenPayload, login, logout, setTokenPayload }}>
      {children}
    </AuthContext.Provider>
  );
};
