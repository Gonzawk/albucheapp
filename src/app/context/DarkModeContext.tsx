"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthContext } from "@/app/context/AuthContext";

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (value: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: async () => {},
  setDarkMode: () => {}
});

export const useDarkMode = () => useContext(DarkModeContext);

// Función para decodificar el JWT
const parseJwt = (token: string): any | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return null;
  }
};

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useContext(AuthContext);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!token) {
      console.error("No se encontró token; se omite la consulta de configuración.");
      return;
    }
    const decoded = parseJwt(token);
    const userId = decoded ? decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] : null;
    if (!userId) {
      console.error("No se encontró el ID de usuario en el token.");
      return;
    }
    const fetchUserSettings = async () => {
      const endpoint = `${apiUrl}/api/UserSettings/${userId}`;
      console.log("Realizando consulta a:", endpoint);
      try {
        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Respuesta del endpoint de UserSettings, estado:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("Configuración recibida:", data);
          setDarkModeState(data.isDarkMode);
        } else {
          console.error("Error al obtener la configuración de usuario. Estado:", res.status);
          setDarkModeState(false);
        }
      } catch (error) {
        console.error("Error fetching user settings", error);
        setDarkModeState(false);
      }
    };

    fetchUserSettings();
  }, [token, apiUrl]);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkModeState(newValue);
    if (!token) {
      console.error("No se encontró token; no se puede actualizar la configuración.");
      return;
    }
    const decoded = parseJwt(token);
    const userId = decoded ? decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] : null;
    if (!userId) {
      console.error("No se encontró el ID de usuario en el token.");
      return;
    }
    const endpoint = `${apiUrl}/api/UserSettings/${userId}`;
    console.log("Enviando solicitud PUT a:", endpoint);
    console.log("Payload enviado:", { isDarkMode: newValue });
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isDarkMode: newValue })
      });
      console.log("Respuesta del PUT, estado:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error al actualizar la configuración del usuario. Estado:", res.status, errorText);
      }
    } catch (error) {
      console.error("Error updating user settings", error);
    }
  };

  return (
    <DarkModeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setDarkMode: setDarkModeState
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};
