import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import axios from "axios";
import { List, Spin } from "@pankod/refine-antd";

interface AreaIncidencias {
    name: string;
    value: number;
}

interface IncidenciasPorAreaListProps {
    onSelectPersona: (persona: string) => void; // Función para seleccionar una persona
    dates: [string | null, string | null]; // Rango de fechas recibido desde el componente padre
}

export const IncidenciasPorAreaList: React.FC<IncidenciasPorAreaListProps> = ({ onSelectPersona, dates }) => {
    const [data, setData] = useState<AreaIncidencias[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartSize, setChartSize] = useState({ width: 400, height: 300 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = 'https://www.desarrollotecnologicoar.com/api3/incidencias';
                const [startDate, endDate] = dates;

                if (startDate && endDate) {
                    url += `?startDate=${startDate}&endDate=${endDate}`;
                }

                const response = await axios.get(url);
                const areas = [" Gerente General", " Jefe de Almacén", " Jefe de Contabilidad", " Supervisor de Producción", " Analista de Seguridad e Higiene / Mantenimiento"," Gerente Contabilidad, Finanza y RRHH"," Supervisor de Calidad","IT"," Logística"," Subjefe Crédito y Cobranza"," Subjefe de Soporte Técnico Presencial / Encargado de Sucursal CDMX"," Encargada Ventas de Refacciones y Servicios"," Operaciones"," Encargada Satisfacción al cliente","  Soporte Técnico Presencial","Mercadotecnia ","  Jefe de Procesos y Calidad"," Encargado de Logística Internacional"," Generalista RRHH","Soporte Técnico Call Center / NPI"];
                const incidenciasPorArea = areas.map((entidad) => ({
                    name: entidad.charAt(0).toUpperCase() + entidad.slice(1),
                    value: response.data.filter((area: any) => area.area === entidad).length,
                }));
                console.log(incidenciasPorArea);

                setData(incidenciasPorArea);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dates]); // Dependencias para actualizar los datos cuando cambien las fechas

    const handleBarClick = (data: AreaIncidencias) => {
        onSelectPersona(data.name);
    };

    if (loading) return <Spin size="large" />;

    return (
        <List title="Incidencias según el área">
            <BarChart width={1000} height={300} data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" onClick={(_, index) => handleBarClick(data[index])} />
            </BarChart>
        </List>
    );
};
