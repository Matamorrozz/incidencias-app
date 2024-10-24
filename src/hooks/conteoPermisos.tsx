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

  // Obtener el área del usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const correo = user.email || "";
          const q = query(collection(db, "usuarios"), where("correo", "==", correo));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setArea(userDoc.area || ""); // Guardar el área en el estado
          } else {
            message.error("No se encontró información del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener el área del usuario:", error);
          message.error("Hubo un error al cargar los datos del usuario.");
        }
      } else {
        message.error("Usuario no autenticado.");
      }
    });

    return () => unsubscribe(); // Limpieza del listener
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
