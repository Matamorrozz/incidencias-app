import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { List, Spin, message } from "@pankod/refine-antd";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

interface NombreIncidencias {
    name: string;
    value: number;
}

interface Incidencia {
    id: string;
    area: string;
    nombre_emisor: string;
}

interface IncidenciasPorUsuarioListProps {
    onSelectPersona: (persona: string) => void;
    dates: [string | null, string | null]; // Rango de fechas recibido desde el componente padre
}

export const IncidenciasPorUsuario: React.FC<IncidenciasPorUsuarioListProps> = ({
    onSelectPersona,
    dates,
}) => {
    const [data, setData] = useState<NombreIncidencias[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [area, setArea] = useState<string | null>(null);

    // Lista de usuarios con acceso completo
    const UsuariosPermitidos = ['developer@asiarobotica.com'];

    // Convertir texto (área) a formato normalizado
    const convertirTexto = (texto: string): string =>
        texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .toLowerCase()
            .replace(/\s+/g, "_"); // Espacios por guiones bajos

    // Obtener nombres únicos desde las incidencias
    const getUniqueNames = (incidencias: Incidencia[]): string[] =>
        [...new Set(incidencias.map((i) => i.nombre_emisor || "Sin área"))];

    // Llamar a la API sin filtros (acceso completo)
    const fetchData = async () => {
        try {
            let url = "https://www.desarrollotecnologicoar.com/api3/incidencias";
            const [startDate, endDate] = dates;

            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await axios.get<Incidencia[]>(url);
            const incidencias = response.data;

            const names = getUniqueNames(incidencias);
            const incidenciasPorNombre = names.map((name) => ({
                name,
                value: incidencias.filter((i) => i.nombre_emisor === name).length,
            }));

            setData(incidenciasPorNombre);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            message.error("Error al cargar los datos.");
        } finally {
            setLoading(false);
        }
    };

    // Llamar a la API filtrada por área
    const fetchUsuariosUnicos = async (userArea: string) => {
        try {
            const areaNormalizada = convertirTexto(userArea);
            const url = `https://desarrollotecnologicoar.com/api3/incidencias_area?area=${encodeURIComponent(areaNormalizada)}`;

            const response = await axios.get<Incidencia[]>(url);
            const incidencias = response.data;

            const names = getUniqueNames(incidencias);
            const incidenciasPorNombre = names.map((name) => ({
                name,
                value: incidencias.filter((i) => i.nombre_emisor === name).length,
            }));

            setData(incidenciasPorNombre);
        } catch (error) {
            console.error("Error al obtener usuarios únicos:", error);
            message.error("Error al cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    // Obtener datos del usuario autenticado y decidir qué función llamar
    useEffect(() => {
        const fetchUserData = async (currentUser: any) => {
            try {
                const correo = currentUser.email;
                setUserEmail(correo);

                const q = query(collection(db, "usuarios"), where("correo", "==", correo));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0].data();
                    setArea(userDoc.area);

                    if (UsuariosPermitidos.includes(correo)) {
                        await fetchData(); // Acceso completo
                    } else {
                        await fetchUsuariosUnicos(userDoc.area); // Datos filtrados
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

        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                fetchUserData(currentUser);
            } else {
                message.error("Usuario no autenticado.");
                setLoading(false);
            }
        });
    }, [dates]); // Ejecutar cuando cambien las fechas

    const handleBarClick = (data: NombreIncidencias) => {
        onSelectPersona(data.name);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { name, value } = payload[0].payload;
            return (
                <div style={{ backgroundColor: "#fff", padding: 10, border: "1px solid #ccc" }}>
                    <p><strong>Nombre:</strong> {name}</p>
                    <p><strong>Incidencias:</strong> {value}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <Spin size="large" />;

    return (
        <List title="Incidencias por Usuario">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" onClick={(_, index) => handleBarClick(data[index])} />
                </BarChart>
            </ResponsiveContainer>
        </List>
    );
};
