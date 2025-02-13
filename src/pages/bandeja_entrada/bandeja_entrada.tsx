import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Table, message, Spin, Button, Tabs } from "antd";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { usuariosPermitidos } from "../../user_config";

// Definimos la interfaz para los permisos
interface Permiso {
  id: string;
  fecha_solicitud: string;
  nombre_completo: string;
  correo: string;
  jefe_inmediato: string;
  tipo_permiso: string;
  urgencia: boolean;
  comentarios: string;
  fecha_permiso: string;
  status: string;
  area: string;
}

// Definimos las columnas de la tabla
const columns = (navigate: (path: string) => void) => [
  { title: "Fecha de solicitud", dataIndex: "fecha_solicitud", key: "fecha_solicitud", render: (fecha: any) => moment(fecha).format("DD/MM/YYYY HH:MM") },
  { title: "Nombre", dataIndex: "nombre_completo", key: "nombre_completo" },
  { title: "Area", dataIndex: "area", key: "area" },
  { title: "Jefe Inmediato", dataIndex: "jefe_inmediato", key: "jefe_inmediato" },
  { title: "Tipo de permiso", dataIndex: "tipo_permiso", key: "tipo_permiso" },
  { title: "Urgencia", dataIndex: "urgencia", key: "urgencia" },
  { title: "Comentarios", dataIndex: "comentarios", key: "comentarios" },
  { title: "Fecha de permiso", dataIndex: "fecha_permiso", key: "fecha_permiso", render: (fecha: any) => moment(fecha).format("DD/MM/YYYY") },
  {
    title: "Status del permiso",
    dataIndex: "status",
    key: "status",
    render: (status: string, record: Permiso) => {
      const color =
        status === "Aprobado" ? "green" :
          status === "Pendiente" ? "orange" : "red";
      const isDisabled = status === "Aprobado" || status === "Rechazado";

      return (
        <Button
          style={{ backgroundColor: color, color: "white", border: "none" }}
          disabled={isDisabled}
          onClick={() => navigate(`/detalle_permiso/${record.id}`)}
        >
          {status}
        </Button>
      );
    },
  },
];

export const TablaPermisos: React.FC = () => {
  const [data, setData] = useState<Permiso[]>([]); // Estado de los permisos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [area, setArea] = useState<string>(""); // Área del usuario
  const [user, setUser] = useState<any>(null); // Usuario autenticado
  const navigate = useNavigate(); // Hook de navegación

  // **1. Convertir texto (área) a formato normalizado**
  const convertirTexto = (texto: string): string =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .toLowerCase()
      .replace(/\s+/g, "_"); // Espacios por guiones bajos

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const correo = user.email || "";

          // Verificar si el usuario está en usuariosPermitidos
          if (usuariosPermitidos.includes(correo)) {
            //fetch a la api general
            const fetchPermisosGenerales = async () => {
              try {
                const response = await axios.get<Permiso[]>(
                  "https://desarrollotecnologicoar.com/api3/permisos"
                );
                setData(response.data);
              } catch (error) {
                console.error("Error al obtener permisos generales:", error);
                message.error("Hubo un error al cargar los permisos generales.");
              } finally {
                setLoading(false);
              }
            };
            await fetchPermisosGenerales();
          } else {
            // Obtener el área del usuario para permisos específicos
            const q = query(collection(db, "usuarios"), where("correo", "==", correo));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0].data();
              const userArea = convertirTexto(userDoc.area) || "";
              setArea(userArea); // Guardar el área del usuario
              setUser(userDoc.nombre_completo || '');
              console.log(`El area de usuario es: ${userArea}, el usuario es: ${user.displayName}`);
            } else {
              message.error("No se encontró información del usuario.");
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          message.error("Hubo un error al cargar los datos del usuario.");
          setLoading(false);
        }
      } else {
        message.error("El usuario no está autenticado.");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Limpiar el listener
  }, []);

  // Cargar permisos por área
  useEffect(() => {
    const fetchPermisosPorArea = async () => {
      if (!area) return; // No continuar si no hay área

      try {
        const response = await axios.get<Permiso[]>(
          `https://desarrollotecnologicoar.com/api3/permisos`
        );
        const filteredData = response.data.filter((permiso) => {
          const areaMatch = permiso.area === area;
          const userMatch = permiso.jefe_inmediato.toLowerCase().includes(user.toLowerCase());
          return areaMatch || userMatch;
        });
        setData(filteredData);
      } catch (error) {
        console.error("Error al obtener permisos por área:", error);
        message.error("Hubo un error al cargar los permisos por área.");
      } finally {
        setLoading(false);
      }
    };

    if (!usuariosPermitidos.includes(auth.currentUser?.email || "")) {
      fetchPermisosPorArea();
    }
  }, [area]);

  // Filtrar permisos por status
  const permisosPendientes = data.filter((permiso) => permiso.status === "Pendiente");
  const permisosAprobados = data.filter((permiso) => permiso.status === "Aprobado");
  const permisosRechazados = data.filter((permiso) => permiso.status === "Rechazado");

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  }

  return (
    <Tabs defaultActiveKey="1"
      centered
      tabBarGutter={20} // Espaciado entre pestañas para una mejor accesibilidad en móviles
      tabBarStyle={{ minHeight: 48 }} >
      <Tabs.TabPane tab="Pendientes" key="1">
        <Table
          columns={columns(navigate)}
          scroll={{ x: 800, y: 300 }}
          dataSource={permisosPendientes}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Aprobados" key="2">
        <Table
          columns={columns(navigate)}
          scroll={{ x: 800, y: 300 }}
          dataSource={permisosAprobados}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Rechazados" key="3">
        <Table
          columns={columns(navigate)}
          scroll={{ x: 800, y: 300 }}
          dataSource={permisosRechazados}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};
