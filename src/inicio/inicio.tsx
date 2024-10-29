import React, { useEffect, useState } from "react";
import { Button, Table, message } from "antd"; // Importamos los componentes necesarios
import { useNavigate } from "react-router-dom"; // Para redireccionar al hacer clic en el botón
import { onAuthStateChanged } from "firebase/auth"; // Obtenemos el usuario autenticado
import { auth } from "../firebaseConfig"; // Importa la configuración de Firebase
import moment from "moment";
// Definimos los tipos de datos para los permisos
type Permiso = {
  id: string;
  fecha_solicitud: string;
  nombre_completo: string;
  correo: string;
  jefe_inmediato: string;
  area: string;
  tipo_permiso: string;
  urgencia: boolean;
  comentarios: string;
  status: string;
  fecha_permiso: any;
};

const HomePage: React.FC = () => {
  const navigate = useNavigate(); // Hook para redirigir a otra página
  const [permisos, setPermisos] = useState<Permiso[]>([]); // Estado para almacenar los permisos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [userEmail, setUserEmail] = useState<string | null>(null); // Correo del usuario autenticado

  // Redirige a la página de creación de permisos
  const handleNewIncidentClick = () => {
    navigate("/create_permit");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        message.error("No estás autenticado.");
        navigate("/login"); // Redirigir al login si no hay usuario autenticado
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPermisos = async () => {
      console.log("Correo del usuario autenticado:", userEmail);
      if (!userEmail) return; // Verificamos que el correo esté disponible
  
      try {
        const response = await fetch(
          `https://desarrollotecnologicoar.com/api3/permiso_por_correo/${userEmail}`
        );
        console.log("Respuesta de la API:", response);
  
        if (response.ok) {
          const data = await response.json();
          console.log("Datos obtenidos de la API:", data); // Verificamos el formato
  
          // Si es un objeto, lo convertimos en un array
          const permisosArray = Array.isArray(data) ? data : [data];
  
          setPermisos(permisosArray); // Guardamos los permisos en el estado
        } else {
          message.error("Error al obtener los permisos.");
          setPermisos([]); // Establecemos un array vacío para evitar errores
        }
      } catch (error) {
        console.error("Error al llamar a la API:", error);
        message.error("Hubo un error al obtener los permisos.");
        setPermisos([]); // En caso de error, dejamos un array vacío
      } finally {
        setLoading(false); // Finalizamos la carga
      }
    };
  
    fetchPermisos();
  }, [userEmail]);
  
  const columns = [
    {
        title: "Id de solicitud",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Fecha de Solicitud",
        dataIndex: "fecha_solicitud",
        key: "fecha_solicitud",
        render: (fecha: any) => moment(fecha).format("DD/MM/YYYY HH:mm"),
    },
    {
        title: "Nombre Completo",
        dataIndex: "nombre_completo",
        key: "nombre_completo",
    },
    {
        title: "Jefe Inmediato",
        dataIndex: "jefe_inmediato",
        key: "jefe_inmediato",
    },
    {
        title: "Tipo de Permiso",
        dataIndex: "tipo_permiso",
        key: "tipo_permiso",
    },
    {
        title: "Urgencia",
        dataIndex: "urgencia",
        key: "urgencia",
        render: (urgencia: boolean) => (
            <span style={{ color: urgencia ? "orange" : "blue" }}>
                {urgencia ? "Urgente" : "No Urgente"}
            </span>
        ),
    },
    {
        title: "Comentarios",
        dataIndex: "comentarios",
        key: "comentarios",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
            let color = "";
            switch (status) {
                case "Aprobado":
                    color = "green";
                    break;
                case "Pendiente":
                    color = "orange";
                    break;
                case "Rechazado":
                    color = "red";
                    break;
                default:
                    color = "gray";
            }
            return (
                <span>
                    <strong style={{ color }}>{status}</strong>
                </span>
            );
        },
    },
    {
        title: "Fecha de Permiso",
        dataIndex: "fecha_permiso",
        key: "fecha_permiso",
        render: (fecha: any) => moment(fecha).format("DD/MM/YYYY"),
    },
];

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h1>Bienvenido a la página de incidencias</h1>

      {/* Botón para crear una nueva incidencia */}
      <Button
        type="primary"
        size="large"
        onClick={handleNewIncidentClick}
        style={{
          marginTop: "20px",
          padding: "10px 40px",
          fontSize: "18px",
        }}
      >
        Solicitar permiso
      </Button>

      {/* Tabla para mostrar los permisos */}
      <div style={{ marginTop: "40px" }}>
        <Table
          dataSource={permisos || []}
          columns={columns}
          loading={loading}
          rowKey="id" // Asegúrate de tener una clave única para cada fila
        />
      </div>
    </div>
  );
};

export default HomePage;
