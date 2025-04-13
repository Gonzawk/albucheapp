"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthContext } from "@/app/context/AuthContext";

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {}
});

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const { token, tokenPayload } = useContext(AuthContext);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Extraer el id del usuario desde la claim necesaria y convertirlo a número
  const userIdClaim = tokenPayload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const userId = userIdClaim ? Number(userIdClaim) : null;

  useEffect(() => {
    if (!token) {
      // No mostrar error en el primer render, el token podría no estar aún disponible.
      return;
    }
    if (!userId) {
      console.error("No se pudo obtener el id del usuario.");
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
  }, [token, apiUrl, userId]);

  // toggleDarkMode solo actualiza el estado local, sin hacer solicitud PUT.
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkModeState(newValue);
    // La actualización en el servidor se realizará desde la página correspondiente.
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
