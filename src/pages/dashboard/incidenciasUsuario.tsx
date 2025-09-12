import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { List, Spin, message } from "@pankod/refine-antd";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
// import { usuariosPermitidos } from "../../user_config";
import { ColorModeContext } from "../../contexts/color-mode";
import { useContext } from "react";

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

type Lider = { id: number | string; nombre: string; correo: string };
type Gerentes = string[];

export const IncidenciasPorUsuario: React.FC<IncidenciasPorUsuarioListProps> = ({
    onSelectPersona,
    dates,
}) => {
    const [data, setData] = useState<NombreIncidencias[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [area, setArea] = useState<string | null>(null);
    const [usuariosPermitidos, setUsuariosPermitidos] = useState<string[]>([]);
    const [loadingGerentes, setLoadingGerentes] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGerentes = async () => {
            try {
                const { data } = await axios.get<Gerentes>(
                    "https://desarrollotecnologicoar.com/api3/usuarios_permitidos/"
                );
                setUsuariosPermitidos(data);
                console.log("Correos de gerentes:", data);
            } catch (e) {
                setError((prev) => prev ?? "Error al cargar gerentes.");
            } finally {
                setLoadingGerentes(false);
            }
        };

        fetchGerentes();
    }, []); // Solo al montar, no depende de dates

    useEffect(() => {
        if (loadingGerentes) return; // Espera a los gerentes

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                message.error("Usuario no autenticado.");
                setLoading(false); // Asegúrate de cerrar aquí
                return;
            }

            const fetchUserData = async () => {
                try {
                    const correo = currentUser.email || "";
                    setUserEmail(correo);

                    const q = query(collection(db, "usuarios"), where("correo", "==", correo));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        message.error("No se encontró información del usuario.");
                        return;
                    }

                    const userDoc = querySnapshot.docs[0].data();
                    setArea(userDoc.area);

                    const normalizados = usuariosPermitidos.map((c) => c.toLowerCase());
                    if (normalizados.includes(correo.toLowerCase())) {
                        await fetchData();
                    } else {
                        await fetchUsuariosUnicos(userDoc.area);
                    }
                } catch (err) {
                    console.error(err);
                    message.error("Error al cargar datos.");
                } finally {
                    setLoading(false); // Muy importante
                }
            };

            fetchUserData();
        });

        return () => unsubscribe();
    }, [loadingGerentes, usuariosPermitidos, dates]);



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
            console.log("Usuario permitido para gráfico por personas, todos los usuarios");
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
            let url = `https://desarrollotecnologicoar.com/api3/incidencias_area?area=${encodeURIComponent(areaNormalizada)}`;
            const [startDate, endDate] = dates;

            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await axios.get<Incidencia[]>(url);
            const incidencias = response.data;

            const names = getUniqueNames(incidencias);
            const incidenciasPorNombre = names.map((name) => ({
                name,
                value: incidencias.filter((i) => i.nombre_emisor === name).length,
            }));

            setData(incidenciasPorNombre);
            console.log("Usuario no permitido para gráfico por personas, usuarios del área:", names);
        } catch (error) {
            console.error("Error al obtener usuarios únicos:", error);
            message.error("Error al cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };



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
    const { mode } = useContext(ColorModeContext);
    const modeImage = mode === "dark" ? "#0fad03" : "#020675";

    return (
        <List title="Incidencias por Usuario">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" fill={modeImage} onClick={(_, index) => handleBarClick(data[index])} />
                </BarChart>
            </ResponsiveContainer>
        </List>
    );
};
