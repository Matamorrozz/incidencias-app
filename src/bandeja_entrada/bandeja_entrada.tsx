import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Table, message, Spin, Button } from "antd";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Definimos la interfaz para el tipo de los datos
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
}

// Definimos las columnas de la tabla
const columns = (navigate: (path: string) => void) => [
    { title: "Fecha de solicitud", dataIndex: "fecha_solicitud", key: "fecha_solicitud" },
    { title: "Nombre", dataIndex: "nombre_completo", key: "nombre_completo" },
    { title: "Correo / Usuario", dataIndex: "correo", key: "correo" },
    { title: "Jefe Inmediato", dataIndex: "jefe_inmediato", key: "jefe_inmediato" },
    { title: "Tipo de permiso", dataIndex: "tipo_permiso", key: "tipo_permiso" },
    { title: "Urgencia", dataIndex: "urgencia", key: "urgencia" },
    { title: "Comentarios", dataIndex: "comentarios", key: "comentarios" },
    { title: "Fecha de permiso", dataIndex: "fecha_permiso", key: "fecha_permiso" },
    {
        title: "Status del permiso",
        dataIndex: "status",
        key: "status",
        render: (status: string, record: Permiso) => {
            const color =
                status === "Aprobado" ? "green" :
                    status === "Pendiente" ? "orange" : "red";
            return (
                <Button style={{ backgroundColor: color, color: "white", border: "none" }}
                    onClick={() => navigate(`/detalle_permiso/${record.id}`)}>
                    {status}
                </Button>);
        },
    },];


export const TablaPermisos: React.FC = () => {
    const [data, setData] = useState<Permiso[]>([]); // Estado de los permisos
    const [loading, setLoading] = useState(true); // Estado de carga
    const [area, setArea] = useState<string>(""); // Área del usuario
    const navigate = useNavigate(); // Hook de navegación

    // Escuchar cambios en la autenticación y obtener área del usuario
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const correo = user.email || "";
                    const q = query(collection(db, "usuarios"), where("correo", "==", correo));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0].data();
                        const userArea = userDoc.area || "";
                        setArea(userArea); // Guardar el área del usuario
                    } else {
                        message.error("No se encontró información del usuario.");
                    }
                } catch (error) {
                    console.error("Error al obtener los datos del usuario:", error);
                    message.error("Hubo un error al cargar los datos del usuario.");
                }
            } else {
                message.error("El usuario no está autenticado.");
            }
        });

        return () => unsubscribe(); // Limpiar el listener
    }, []);

    // Cargar permisos cuando se obtenga el área
    useEffect(() => {
        const fetchPermisos = async () => {
            if (!area) return; // No continuar si no hay área

            try {
                const response = await axios.get<Permiso[]>(
                    `https://desarrollotecnologicoar.com/api3/permiso_por_area/${area}`
                );
                setData(response.data); // Guardar los permisos en el estado
            } catch (error) {
                console.error("Error al obtener permisos:", error);
                message.error("Hubo un error al cargar los permisos.");
            } finally {
                setLoading(false); // Finalizar la carga
            }
        };

        fetchPermisos();
    }, [area]); // Ejecutar cada vez que el área cambie

    // Mostrar spinner si estamos cargando
    if (loading) {
        return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
    }

    return (
        <Table
            columns={columns(navigate)} // Pasamos navigate a las columnas
            dataSource={data}
            rowKey="id"
            pagination={{ pageSize: 5 }}
        />
    );
};
