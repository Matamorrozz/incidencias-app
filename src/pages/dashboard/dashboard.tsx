import React, { useState, useEffect } from "react";
import { Row, Col, Card, DatePicker, Button, Select, Tabs } from "antd";
import { IncidenciasPorAreaList } from "./incidenciasArea";
import { IncidenciasPorTiempoList } from "./incidenciasTiempo";
import PiezasTable from "./incidenciasTabla";
import { Usuario } from "./incidentes_usuarios/panel_usuario";
import { IncidenciasPorUsuario } from "./incidenciasUsuario";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig"


const { RangePicker } = DatePicker;
const { Option } = Select;

export const Dashboard: React.FC = () => {
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
    const [selectedFecha, setSelectedFecha] = useState<string | null>(null);
    const [dates, setDates] = useState<[string | null, string | null]>([null, null]);
    const [agrupacion, setAgrupacion] = useState<'dia' | 'semana' | 'mes'>('semana');
    const [graficaElecta, setGraficaElecta] = useState<'Por area' | 'Por persona'>('Por persona');

    const onDateChange = (dates: any, dateStrings: [string, string]) => {
        setDates([dateStrings[0], dateStrings[1]]);
    };

    const handleReset = () => {
        window.location.reload();
    };

    const handleChange = (value: 'dia' | 'semana' | 'mes') => {
        setAgrupacion(value);
    };

    const onSelectFecha = (fecha: string) => {
        setSelectedFecha(fecha);
    };

    const onGraficaChange = (value: 'Por area' | 'Por persona') => {
        setGraficaElecta(value);
    }
    const graficosBarras =
        graficaElecta === 'Por persona' ? (
            <Col xs={24} md={24}>
                <IncidenciasPorUsuario onSelectPersona={setSelectedPersona} dates={dates} />
            </Col>
        ) : (
            <Col xs={24} md={24}>
                <IncidenciasPorAreaList onSelectPersona={setSelectedArea} dates={dates} />
            </Col>
        );


    return (
        <Tabs defaultActiveKey="1"
            centered
            tabBarStyle={{ minHeight: 48 }}
            tabBarGutter={20}
        >
            <Tabs.TabPane tab="Panel de Control" key="1">
                <div style={{ padding: 24 }}>
                    <h2>Dashboard</h2>
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
                            <Card title="Incidencias por tiempo">
                                <Select defaultValue="semana" style={{ width: 200 }} onChange={handleChange}>
                                    <Option value="dia">Día</Option>
                                    <Option value="semana">Semana</Option>
                                    <Option value="mes">Mes</Option>
                                </Select>
                                <IncidenciasPorTiempoList agrupacion={agrupacion} dates={dates} />
                            </Card>
                        </Col>
                        <Col xs={24} md={24}>
                            <Card title="Gráficos de Incidencias">
                                <div style={{ marginBottom: 16 }}>
                                    <Select<'Por area' | 'Por persona'>
                                        defaultValue="Por persona"
                                        style={{ width: 200 }}
                                        onChange={(value) => setGraficaElecta(value)}
                                    >
                                        <Option value="Por area">Por área</Option>
                                        <Option value="Por persona">Por persona</Option>
                                    </Select>
                                </div>
                                {graficosBarras}
                            </Card>
                        </Col>

                        <Col xs={24} md={24}>
                            <Card title="Tabla de Incidencias">
                                <PiezasTable selectedArea={selectedArea} selectedFecha={selectedFecha} dates={dates} />
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Desgloce por Usuario" key="2">
                <Usuario /> {/* Componente de usuario agregado aquí */}
            </Tabs.TabPane>
        </Tabs>
    );
};
