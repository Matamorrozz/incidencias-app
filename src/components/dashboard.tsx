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


    const onDateChange = (dates: any, dateStrings: [string, string]) => {
        setDates([dateStrings[0], dateStrings[1]]);
    };

    // Función para restablecer la página
    const handleReset = () => {
        window.location.reload();
    };

    const [agrupacion, setAgrupacion] = useState<'dia' | 'semana' | 'mes'>('semana');

    const handleChange = (value: 'dia' | 'semana' | 'mes') => {
        setAgrupacion(value);
    };

    return (
        <div style={{ padding: 24 }}>

            <h2>Dashboard</h2>
            {/* Agregar el selector de rango de fechas */}
            <div style={{ marginBottom: 16 }}>
                <RangePicker onChange={onDateChange} />
            </div>
            <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={handleReset}>
                    Restablecer
                </Button>
            </div>
            <Row gutter={[16, 16]}>

                <Col xs={24} md={24}>
                    <Card title="Incidencias agrupadas por área">
                        <IncidenciasPorAreaList onSelectPersona={setSelectedArea} dates={dates} />
                    </Card>
                </Col>

            </Row>
            {/* Botón para restablecer la página */}
            <Row gutter={[16, 16]}>

                <Col xs={24} md={24}>
                    <Card title="Incidencias por tiempo"
                    >
                        <Select defaultValue="semana" style={{ width: 200 }} onChange={handleChange}>
                            <Option value="dia">Día</Option>
                            <Option value="semana">Semana</Option>
                            <Option value="mes">Mes</Option>
                        </Select>
                        <IncidenciasPorTiempoList agrupacion={agrupacion} />
                    </Card>
                </Col>

¿
                <Col xs={24} md={24}>
                    {/* Utiliza la función `getTituloPiezas` para generar el título dinámico */}
                    <Card title='Tablita'>
                        <PiezasTable selectedArea={selectedArea} selectedFecha={selectedFecha} dates={dates} />
                    </Card>
                </Col>

            </Row>

        </div>
    );
};
