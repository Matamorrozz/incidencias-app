import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, message, Typography, Tag, Space } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

interface Permiso {
  id: string;
  nombre_completo: string;
  correo: string;
  fecha_solicitud: string;
  tipo_permiso: string;
  urgencia: boolean;
  comentarios: string;
  status: string;
}

export const DetallePermiso = () => {
  const { id } = useParams<{ id: string }>(); // Obtener ID de la URL
  const navigate = useNavigate(); // Navegar entre rutas
  const [loading, setLoading] = useState(true); // Estado de carga
  const [permiso, setPermiso] = useState<Permiso | null>(null); // Estado del permiso

  // Función para obtener los datos del permiso
  const fetchPermiso = async () => {
    try {
      const response = await axios.get(
        `https://desarrollotecnologicoar.com/api3/permisos/${id}`
      );
      setPermiso(response.data); // Guardamos el permiso
    } catch (error) {
      console.error("Error al obtener el permiso:", error);
      message.error("Hubo un error al cargar el permiso.");
    } finally {
      setLoading(false); // Terminamos la carga
    }
  };

  // useEffect para cargar los datos al montar el componente
  useEffect(() => {
    fetchPermiso();
  }, [id]);

  // Función para actualizar el status en la API
  const actualizarStatus = async (nuevoStatus: string) => {
    console.log("ID:", id); // Verificar que el ID sea correcto
    console.log("Nuevo Status:", nuevoStatus); // Verificar el estado enviado
  
    try {
      const response = await axios.put(
        `https://desarrollotecnologicoar.com/api3/actualizar_status/${id}`,
        { status: nuevoStatus }
      );
  
      console.log("Respuesta de la API:", response.data); // Verificar la respuesta
      message.success(`El permiso ha sido ${nuevoStatus.toLowerCase()}.`);
      navigate("/bandeja_entrada"); // Redirigir a la bandeja
    } catch (error) {
      console.error("Error al actualizar el status:", error); // Mostrar el error
      message.error("Hubo un error al actualizar el status.");
    }
  };
  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  }

  if (!permiso) {
    return <div>No se encontró el permiso.</div>;
  }

  return (
    <Card
      title={`Permiso de ${permiso.nombre_completo}`}
      bordered={false}
      style={{ width: 600, margin: "50px auto", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Text strong>ID:</Text>
        <Text>{permiso.id}</Text>

        <Text strong>Correo:</Text>
        <Text>{permiso.correo}</Text>

        <Text strong>Fecha de Solicitud:</Text>
        <Text>{permiso.fecha_solicitud}</Text>

        <Text strong>Tipo de Permiso:</Text>
        <Text>{permiso.tipo_permiso}</Text>

        <Text strong>Urgencia:</Text>
        <Tag color={permiso.urgencia ? "red" : "green"}>
          {permiso.urgencia ? "Urgente" : "No Urgente"}
        </Tag>

        <Text strong>Comentarios:</Text>
        <Text>{permiso.comentarios}</Text>

        <Text strong>Status Actual:</Text>
        <Tag color={
          permiso.status === "Pendiente" ? "orange" :
          permiso.status === "Aprobado" ? "green" : "red"
        }>
          {permiso.status}
        </Tag>

        <Space size="middle" style={{ marginTop: "20px" }}>
          <Button
            type="primary"
            onClick={() => actualizarStatus("Aprobado")}
            disabled={permiso.status === "Aprobado"}
          >
            Aprobar Permiso
          </Button>
          <Button
            danger
            onClick={() => actualizarStatus("Rechazado")}
            disabled={permiso.status === "Rechazado"}
          >
            Rechazar Permiso
          </Button>
        </Space>
      </Space>
    </Card>
  );
};
