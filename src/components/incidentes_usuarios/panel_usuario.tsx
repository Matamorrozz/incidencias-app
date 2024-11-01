import React, { useEffect, useState } from "react";
import { Card, Avatar, Typography, Spin, message, List, Space, Select, DatePicker, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Incidencia {
  id: string;
  marca_temporal: string;
  persona_emisor: string;
  nombre_emisor: string;
  jefe_inmediato: string;
  tipo_registro: string;
  fecha_permiso: string;
  info_registro: string;
  status_acta: string;
  area: string;
}

interface UsuarioData {
  displayName: string;
  email: string;
  area: string;
}

export const Usuario = () => {
  const [user, setUser] = useState<any>(null); // Usuario autenticado
  const [area, setArea] = useState<string>(""); // Área del usuario
  const [usuarios, setUsuarios] = useState<string[]>([]); // Lista de usuarios únicos
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // Usuario seleccionado
  const [historial, setHistorial] = useState<Incidencia[]>([]); // Historial de incidencias
  const [loading, setLoading] = useState(true); // Estado de carga
  const [dates, setDates] = useState<[string | null, string | null]>([null, null]); // Fechas seleccionadas

  const convertirTexto = (texto: string): string => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos (acentos)
      .toLowerCase()
      .replace(/\s+/g, '_'); // Reemplaza espacios por guiones bajos
  };

  const fetchUserData = async (currentUser: any) => {
    try {
      const correo = currentUser.email;
      const q = query(collection(db, "usuarios"), where("correo", "==", correo));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setUser(currentUser);
        setArea(userDoc.area);

        await fetchUsuariosUnicos(userDoc.area);
      } else {
        message.error("No se encontró información del usuario.");
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      message.error("Error al cargar los datos del usuario.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuariosUnicos = async (userArea: string) => {
    try {
      const areaNormalizada = convertirTexto(userArea);
      const url = `https://desarrollotecnologicoar.com/api3/incidencias_area?area=${encodeURIComponent(areaNormalizada)}`;

      const response = await axios.get<Incidencia[]>(url);
      const incidencias = response.data;

      const nombresUnicos = Array.from(
        new Set(incidencias.map((i) => i.nombre_emisor as string))
      );

      setUsuarios(nombresUnicos);
    } catch (error) {
      console.error("Error al obtener los usuarios únicos:", error);
      message.error("Error al cargar los usuarios.");
    }
  };

  const fetchHistorial = async () => {
    if (!selectedUser) {
      message.warning("Por favor, selecciona un usuario.");
      return;
    }

    try {
      let url = `https://desarrollotecnologicoar.com/api3/incidencias_nombre_emisor?nombre_emisor=${encodeURIComponent(
        selectedUser
      )}`;

      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get<Incidencia[]>(url);
      setHistorial(response.data);
    } catch (error) {
      console.error("Error al obtener el historial:", error);
      message.error("Error al cargar el historial de incidencias.");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        message.error("Usuario no autenticado.");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setDates(dateStrings);
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  }

  return (
    <Card
      title="Perfil del Usuario"
      bordered={false}
      style={{ width: "100%", maxWidth: "600px" , margin: "50px auto", borderRadius: 12, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", padding: "20px" }}
      bodyStyle={{padding: "10px 16px"}}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Select
          placeholder="Selecciona un usuario"
          style={{ width: "100%" }}
          onChange={(value) => setSelectedUser(value)}
        >
          {usuarios.map((usuario) => (
            <Option key={usuario} value={usuario}>
              {usuario}
            </Option>
          ))}
        </Select>

        <RangePicker onChange={handleDateChange} style={{ width: "100%" }} size="large"/>

        <Button type="primary" onClick={fetchHistorial} style={{ width: "100%" }} size="large">
          Mostrar Historial
        </Button>

        <Title level={5} style={{ marginTop: 24 }}>
          Historial de Incidencias
        </Title>
        {historial.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={historial}
            style={{ maxHeight: "300px", overflowY: "scroll" }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`Tipo: ${item.tipo_registro}`}
                  description={`Fecha: ${item.fecha_permiso.slice(0, 10)} | Estado: ${item.status_acta}`}
                />
                <Text>{`Comentarios adicionales: ${item.info_registro}`}</Text>
              </List.Item>
            )}
          />
        ) : (
          <Text>No se encontraron incidencias para este usuario.</Text>
        )}
      </Space>
    </Card>
  );
};
