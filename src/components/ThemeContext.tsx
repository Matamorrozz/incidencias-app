import React, { createContext, useState, useContext, useEffect } from "react";

// Crear el contexto del tema
const ThemeContext = createContext<any>(null);

// Hook personalizado para usar el contexto del tema
export const useTheme = () => useContext(ThemeContext);

// Componente proveedor del tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState<boolean>(false);

    // Efecto para cargar el estado inicial del tema desde localStorage
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) {
            setDarkMode(storedTheme === "dark");
        }
    }, []);

    // Efecto para añadir o remover la clase "dark-mode" al body cuando el estado de darkMode cambie
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    // Función para cambiar el modo noche y guardar la preferencia en localStorage
    const toggleDarkMode = () => {
        setDarkMode((prevMode) => {
            const newMode = !prevMode;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            return newMode;
        });
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
