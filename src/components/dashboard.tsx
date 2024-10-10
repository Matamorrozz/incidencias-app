import React, { useState } from "react";
import { Row, Col, Card, DatePicker, Button, Select } from "antd";
import { IncidenciasPorAreaList } from "./graficas_dashboard/incidenciasArea";
import { IncidenciasPorTiempoList } from "./graficas_dashboard/incidenciasTiempo";
import PiezasTable from "./graficas_dashboard/incidenciasTabla";

const { RangePicker } = DatePicker;
const { Option } = Select;

export const Dashboard: React.FC = () => {

    // Estados para almacenar las selecciones de los gráficos
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [selectedFecha, setSelectedFecha] = useState<string | null>(null);

    // Estado para manejar las fechas seleccionadas
    const [dates, setDates] = useState<[string | null, string | null]>([null, null]);

    // Manejar la selección de fechas con el DatePicker
    const onDateChange = (dates: any, dateStrings: [string, string]) => {
        setDates([dateStrings[0], dateStrings[1]]);
    };

    // Función para restablecer la página
    const handleReset = () => {
        window.location.reload();
    };

    // Estado para manejar la agrupación (día, semana, mes)
    const [agrupacion, setAgrupacion] = useState<'dia' | 'semana' | 'mes'>('semana');

    const handleChange = (value: 'dia' | 'semana' | 'mes') => {
        setAgrupacion(value);
    };

    // Función para manejar la selección de fecha desde IncidenciasPorTiempoList
    const onSelectFecha = (fecha: string) => {
        setSelectedFecha(fecha); // Actualiza el estado con la fecha seleccionada
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Dashboard</h2>

            {/* Selector de rango de fechas */}
            <div style={{ marginBottom: 16 }}>
                <RangePicker onChange={onDateChange} />
            </div>

            {/* Botón para restablecer la página */}
            <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={handleReset}>
                    Restablecer
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                {/* Gráfico de incidencias agrupadas por área */}
                <Col xs={24} md={24}>
                    <Card title="Incidencias agrupadas por área">
                        <IncidenciasPorAreaList onSelectPersona={setSelectedArea} dates={dates} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Gráfico de incidencias por tiempo (día, semana, mes) */}
                <Col xs={24} md={24}>
                    <Card title="Incidencias por tiempo">
                        <Select defaultValue="semana" style={{ width: 200 }} onChange={handleChange}>
                            <Option value="dia">Día</Option>
                            <Option value="semana">Semana</Option>
                            <Option value="mes">Mes</Option>
                        </Select>
                        <IncidenciasPorTiempoList
                            agrupacion={agrupacion}
                            dates={dates}
 // Aquí pasamos la función
                        />
                    </Card>
                </Col>

                {/* Tabla de incidencias */}
                <Col xs={24} md={24}>
                    <Card title="Tabla de Incidencias">
                        <PiezasTable selectedArea={selectedArea} selectedFecha={selectedFecha} dates={dates} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
