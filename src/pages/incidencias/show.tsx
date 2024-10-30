import { DateField, Show, TextField } from "@refinedev/antd";
import React, { useEffect, useState, useCallback } from "react";
import { useShow } from "@refinedev/core";
import { Typography, Spin, message } from "antd";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { usuariosPermitidos } from "../../user_config"; // Lista de usuarios permitidos

const { Title } = Typography;

export const BlogPostShow = () => {
  const { queryResult } = useShow({}); // Cargar datos
  const { data, isLoading: queryLoading } = queryResult;

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userArea, setUserArea] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any>(null); // Estado para la data filtrada
  const [loading, setLoading] = useState(true); // Estado de carga

  const convertirTexto = (texto: string): string =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_");

  // **Función para filtrar los datos según el usuario**
  const filtrarDatos = useCallback(
    (area: string | null) => {
      if (usuariosPermitidos.includes(userEmail || "")) {
        // Usuario permitido: acceso completo
        setFilteredData(data?.data);
      } else {
        // Usuario restringido: filtrar por área
        const filtered = data?.data.filter(
          (incidencia: any) => incidencia.area === area
        );
        setFilteredData(filtered);
      }
    },
    [data, userEmail]
  );

  // **Obtener datos del usuario autenticado y aplicar el filtro**
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      if (user) {
        setUserEmail(user.email); // Guardar correo

        try {
          const q = query(collection(db, "usuarios"), where("correo", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            const area = convertirTexto(userDoc.area);
            setUserArea(area); // Guardar área

            // Filtrar los datos después de obtener la autenticación y datos
            filtrarDatos(area);
          } else {
            message.error("No se encontró información del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          message.error("Error al cargar los datos del usuario.");
        }
      } else {
        message.error("Usuario no autenticado.");
      }
      setLoading(false); // Finalizar carga
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, [filtrarDatos]);

  // Mostrar indicador de carga si los datos o la autenticación están en proceso
  if (loading || queryLoading) {
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  }

  if (!filteredData || filteredData.length === 0) {
    return <div>No se encontraron registros.</div>;
  }

  return (
    <Show isLoading={queryLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={filteredData[0]?.id} />

      <Title level={5}>{"Persona Emisor"}</Title>
      <TextField value={filteredData[0]?.persona_emisor} />

      <Title level={5}>{"Nombre Emisor"}</Title>
      <TextField value={filteredData[0]?.nombre_emisor} />

      <Title level={5}>{"Jefe Inmediato"}</Title>
      <TextField value={filteredData[0]?.jefe_inmediato} />

      <Title level={5}>{"Tipo de Registro"}</Title>
      <TextField value={filteredData[0]?.tipo_registro} />

      <Title level={5}>{"Fecha de Permiso"}</Title>
      <DateField value={filteredData[0]?.fecha_permiso} />

      <Title level={5}>{"Información del Registro"}</Title>
      <TextField value={filteredData[0]?.info_registro} />

      <Title level={5}>{"Status del Acta"}</Title>
      <TextField value={filteredData[0]?.status_acta} />

      <Title level={5}>{"Marca Temporal"}</Title>
      <DateField value={filteredData[0]?.marca_temporal} />
    </Show>
  );
};
