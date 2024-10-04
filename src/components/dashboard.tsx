import React, { useState } from "react";
import { Row, Col, Card, DatePicker, Button } from "antd";
import { IncidenciasPorAreaList } from "./graficas_dashboard/incidenciasArea";



const { RangePicker } = DatePicker;

export const Dashboard: React.FC = () => {


    // Estados para almacenar las selecciones de los gráficos
    const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

    // Estado para manejar las fechas seleccionadas
    const [dates, setDates] = useState<[string | null, string | null]>([null, null]);

    // Función para generar el título dinámico basado en los filtros aplicados
    const getTituloPiezas = () => {
        if (selectedEstado && selectedPersona) {
            return `Piezas en estado: ${selectedEstado} y asignadas a: ${selectedPersona}`;
        } else if (selectedEstado) {
            return `Piezas en estado: ${selectedEstado}`;
        } else if (selectedPersona) {
            return `Piezas asignadas a: ${selectedPersona}`;
        } else {
            return "Piezas totales";
        }
    };

    const onDateChange = (dates: any, dateStrings: [string, string]) => {
        setDates([dateStrings[0], dateStrings[1]]);
    };

    // Función para restablecer la página
    const handleReset = () => {
        window.location.reload();
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
                    <Card title="Piezas por Persona">
                        <IncidenciasPorAreaList onSelectPersona={setSelectedPersona} dates={dates} />
                    </Card>
                </Col>

            </Row>
            {/* Botón para restablecer la página */}

        </div>
    );
};
