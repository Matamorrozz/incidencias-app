import { useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { message } from "antd";

// Hook corregido para contar los registros pendientes
export const useUnreviewedPermitsCount = (): number => {
  const [count, setCount] = useState<number>(0); // Estado del conteo
  const [area, setArea] = useState<string | null>(null); // Área del usuario

  // **1. Convertir texto (área) a formato normalizado**
  const convertirTexto = (texto: string): string =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .toLowerCase()
      .replace(/\s+/g, "_"); // Espacios por guiones bajos

  // Obtener el área del usuario autenticado
  useEffect(() => {
    let isUnmounted = false; // Bandera para controlar el estado del componente
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!isUnmounted) {
          console.log("Usuario no autenticado.");
          message.error("Usuario no autenticado."); // Mostrar solo una vez
        }
        return; // Salir si no hay usuario autenticado
      }
  
      try {
        const correo = user.email || "";
        const q = query(collection(db, "usuarios"), where("correo", "==", correo));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          if (!isUnmounted) {
            setArea(convertirTexto(userDoc.area) || ""); // Guardar el área si el componente está montado
          }
        } else {
          if (!isUnmounted) {
            message.error("No se encontró información del usuario.");
          }
        }
      } catch (error) {
        console.error("Error al obtener el área del usuario:", error);
        if (!isUnmounted) {
          message.error("Hubo un error al cargar los datos del usuario.");
        }
      }
    });
  
    return () => {
      isUnmounted = true; // Establecer la bandera en true al desmontar el componente
      unsubscribe(); // Limpia el listener de onAuthStateChanged
    };
  }, []);
  

  // Obtener los registros de la API y contar los pendientes
  useEffect(() => {
    const fetchAndCountPermits = async () => {
      if (!area) return; // No continuar si no hay área disponible

      try {
        const response = await axios.get(
          `https://desarrollotecnologicoar.com/api3/permiso_por_area/${area}`
        );

        const registros = response.data; // Lista de todos los registros

        // Filtramos los registros con estado 'Pendiente'
        const pendientes = registros.filter(
          (registro: { status: string }) => registro.status === "Pendiente"
        );

        setCount(pendientes.length); // Guardamos el conteo en el estado
      } catch (error) {
        console.error("Error al obtener los permisos:", error);
        message.error("Hubo un error al obtener los permisos.");
      }
    };

    fetchAndCountPermits(); // Llamada inicial
  }, [area]); // Ejecutar cada vez que el área cambie

  return count; // Devolver el conteo final
};
