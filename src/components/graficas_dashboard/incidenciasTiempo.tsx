import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { List, Spin, Table, Row, Col } from "@pankod/refine-antd";

interface IncidenciasGraficaProps {
    agrupacion: 'dia' | 'semana' | 'mes';
    dates: [string | null, string | null];
}

interface TiempoIncidencias {
    name: string; // Puede ser el nombre del mes, semana o día
    value: number; // El número de incidencias
}

export const IncidenciasPorTiempoList: React.FC<IncidenciasGraficaProps> = ({ agrupacion, dates }) => {
    const [data, setData] = useState<TiempoIncidencias[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `https://www.desarrollotecnologicoar.com/api3/incidencias_fechas?agrupacion=${agrupacion}`;

                const [startDate, endDate] = dates;
                if (startDate && endDate) {
                    url += `&startDate=${startDate}&endDate=${endDate}`;
                }

                const response = await axios.get(url);

                // Ajustamos los datos para que se puedan usar en el gráfico de líneas
                const incidencias = response.data.map((item: any) => ({
                    name: item.fecha || item.semana || item.mes, // Dependiendo de cómo esté agrupado
                    value: item.total_incidencias, // El valor de incidencias
                }));

                setData(incidencias);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agrupacion, dates]);

    // Configurar las columnas de la tabla
    const columns = [
        {
            title: agrupacion === 'dia' ? 'Fecha' : agrupacion === 'semana' ? 'Semana' : 'Mes',
            dataIndex: 'name',
            key: 'name',
            width: '50%', // Ajusta el ancho de la columna
        },
        {
            title: 'Conteo incidencias',
            dataIndex: 'value',
            key: 'value',
            width: '50%', // Ajusta el ancho de la columna
        },
    ];

    if (loading) return <Spin size="large" />;

    return (
        <List title={`Incidencias agrupadas por ${agrupacion}`}>
            <Row gutter={[16, 16]}>
                {/* Columna para la gráfica de líneas */}
                <Col xs={24} md={14}> {/* Ocupa 14/24 columnas en pantallas medianas */}
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />

                            {/* Eje X, ajusta el formato si es necesario */}
                            <XAxis dataKey="name" />

                            {/* Eje Y con dominio personalizado */}
                            <YAxis domain={[0, 'dataMax + 15']} tickCount={8} />

                            {/* Tooltip y leyenda */}
                            <Tooltip />
                            <Legend />

                            {/* Línea personalizada */}
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#ff7300"
                                strokeWidth={3}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Col>

                {/* Columna para la tabla */}
                <Col xs={24} md={10}> {/* Ocupa 10/24 columnas en pantallas medianas */}
                    <div style={{ height: 400, overflowY: 'scroll' }}>
                        <Table
                            columns={columns}
                            dataSource={data}
                            pagination={false}
                            rowKey="name"
                            scroll={{ y: 275 }} // Ajusta la altura de la tabla
                        />
                    </div>
                </Col>
            </Row>
        </List>
    );
};
