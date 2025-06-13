import React, { useEffect, useState } from "react";
import { Card, Avatar, Typography, Spin, message, List, Space, Select, DatePicker, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { auth, db } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ColorModeContext } from "../../../contexts/color-mode";
import { useContext } from "react";
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
import { usuariosPermitidos } from "../../../user_config";


interface TipoIncidencias {
  name: string;
  value: number;
}

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
  const [data, setData] = useState<TipoIncidencias[]>([]);

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

        if (usuariosPermitidos.includes(correo)) {
          fetchUsuarios();
        } else {
          fetchUsuariosUnicos(userDoc.area);
        }
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
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
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
      // Contar incidencias por tipo
      setUsuarios(nombresUnicos);

      // Convertir el conteo a un array para el gráfico

    } catch (error) {
      console.error("Error al obtener los usuarios únicos:", error);
      message.error("Error al cargar los usuarios.");
    }
  };

  const fetchUsuarios = async () => {
    try {
      const url = "https://www.desarrollotecnologicoar.com/api3/incidencias";
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
  }

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
      const tipoConteo: Record<string, number> = {};
      response.data.forEach((i) => {
        const tipo = i.tipo_registro;
        tipoConteo[tipo] = (tipoConteo[tipo] || 0) + 1;
      });
      const tipoGraficoData = Object.entries(tipoConteo).map(([name, value]) => ({ name, value }));

      console.log("Datos del gráfico:", tipoGraficoData); // Validar formato
      setData(tipoGraficoData);
      setHistorial(response.data);
    } catch (error) {
      console.error("Error al obtener el historial:", error);
      message.error("Error al cargar el historial de incidencias.");
    }
  };


  const CustomTooltip = ({ active, payload }: any) => {
    console.log("Tooltip activo:", active, "Payload:", payload);

    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload; // Datos del tooltip
      return (
        <div style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", color: "#000" }}>
          <p><strong>Tipo:</strong> {name}</p>
          <p><strong>Conteo:</strong> {value}</p>
        </div>
      );
    }
    return null;
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
  const { mode } = useContext(ColorModeContext);
  const modeImage = mode === "dark" ? "#0fad03" : "#020675";

  return (
    <Card
      title="Perfil del Usuario"
      bordered={false}
      style={{ width: "100%", maxWidth: "800px", margin: "50px auto", borderRadius: 12, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", padding: "20px" }}
      bodyStyle={{ padding: "10px 16px" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Select
          showSearch
          placeholder="Selecciona un usuario"
          style={{ width: "100%" }}
          onChange={(value) => setSelectedUser(value)}
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={usuarios.map((usuario)=>({
            label: String(usuario),
            value: usuario
          }))}

        />
        <RangePicker onChange={handleDateChange} style={{ width: "100%" }} size="large" />

        <Button type="primary" onClick={fetchHistorial} style={{ width: "100%" }} size="large">
          Mostrar Historial
        </Button>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300} >
            <BarChart data={data}>
              <XAxis dataKey="name" tickFormatter={(value) => truncateText(value, 25)} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill={modeImage} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text>No hay datos para mostrar.</Text>
        )}

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
                  description={`Fecha: ${item.fecha_permiso ? item.fecha_permiso.slice(0, 10) : "Sin fecha"} | Estado: ${item.status_acta || "Sin estado"}`}
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
