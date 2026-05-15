import React, { useEffect, useState } from 'react';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../../../firebaseConfig';
import { Button, Row, Col, Card, List, Spin, Empty, Typography } from 'antd';
import { ColorModeContext } from '../../../contexts/color-mode';
import { useContext } from "react";
import {
    EyeOutlined,
    TeamOutlined,
    FilePdfOutlined,
    ArrowRightOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import './listado_actas.css';

export const ListadoActas: React.FC = () => {
    const [areas, setAreas] = useState<string[]>([]);
    const [colaboradores, setColaboradores] = useState<string[]>([]);
    const [actas, setActas] = useState<{ name: string; url: string }[]>([]);

    const [areaSeleccionada, setAreaSeleccionada] = useState<string | null>(null);
    const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Cargar áreas (primer nivel)
    useEffect(() => {
        const obtenerAreas = async () => {
            const rootRef = ref(storage);
            const resultado = await listAll(rootRef);
            const nombresAreas = resultado.prefixes.map((folderRef) => folderRef.name);
            setAreas(nombresAreas);
        };
        obtenerAreas();
    }, []);

    // Cargar colaboradores al seleccionar un área
    const cargarColaboradores = async (area: string) => {
        setAreaSeleccionada(area);
        setColaboradorSeleccionado(null);
        setActas([]);
        setLoading(true);
        try {
            const areaRef = ref(storage, `${area}/`);
            const resultado = await listAll(areaRef);
            const carpetas = resultado.prefixes.map((folderRef) => folderRef.name);
            setColaboradores(carpetas);
        } catch (error) {
            console.error('Error al cargar colaboradores:', error);
        }
        setLoading(false);
    };

    // Cargar archivos al seleccionar un colaborador
    const cargarArchivos = async (area: string, colaborador: string) => {
        setColaboradorSeleccionado(colaborador);
        setLoading(true);
        try {
            const colaboradorRef = ref(storage, `${area}/${colaborador}/`);
            const resultado = await listAll(colaboradorRef);
            const archivos = await Promise.all(
                resultado.items
                    .filter(item => item.name.endsWith('.pdf')) // solo PDFs
                    .map(async (item) => ({
                        name: item.name,
                        url: await getDownloadURL(item),
                    }))
            );
            setActas(archivos);
        } catch (error) {
            console.error('Error al cargar actas:', error);
        }
        setLoading(false);
    };
    const { mode } = useContext(ColorModeContext);
    const isDark = mode === 'dark';

    return (
        <div className={`actas-page ${isDark ? 'dark' : 'light'}`}>
            <div className="actas-hero">
                <Typography.Title level={2} className="actas-title">
                    {areaSeleccionada ? 'Filtrar otra area' : 'Explorador de actas'}
                </Typography.Title>
                <Typography.Text className="actas-subtitle">
                    Selecciona un area, despues un colaborador, y abre los PDF disponibles en segundos.
                </Typography.Text>
            </div>

            <Card className="actas-card" bordered={false}>
                <div className="section-header">
                    <Typography.Title level={4} className="section-title">
                        Areas disponibles
                    </Typography.Title>
                    {areaSeleccionada && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setAreaSeleccionada(null);
                                setColaboradorSeleccionado(null);
                                setColaboradores([]);
                                setActas([]);
                            }}
                        >
                            Reiniciar filtro
                        </Button>
                    )}
                </div>

                <Row gutter={[14, 14]} justify={areaSeleccionada ? 'start' : 'center'}>
                    {areas.map((area) => (
                        <Col key={area} xs={24} sm={12} md={8} lg={6} xl={4}>
                            <Button
                                type={areaSeleccionada === area ? 'default' : 'primary'}
                                onClick={() => cargarColaboradores(area)}
                                className={`area-button ${areaSeleccionada === area ? 'selected' : ''}`}
                                icon={<EyeOutlined />}
                                size="large"
                            >
                                {area.toLocaleUpperCase().replace(/_/g, ' ')}
                            </Button>
                        </Col>
                    ))}
                </Row>
            </Card>

            {areaSeleccionada && (
                <Card className="actas-card" bordered={false}>
                    <Typography.Title level={4} className="section-title">
                        <TeamOutlined /> Colaboradores en {areaSeleccionada.toUpperCase().replace(/_/g, ' ')}
                    </Typography.Title>

                    {loading ? (
                        <div className="loading-box">
                            <Spin size="large" />
                        </div>
                    ) : colaboradores.length === 0 ? (
                        <Empty description="No hay colaboradores en esta area" />
                    ) : (
                        <List
                            dataSource={colaboradores}
                            className="list-grid"
                            renderItem={(colaborador) => (
                                <List.Item>
                                    <Button
                                        type={colaboradorSeleccionado === colaborador ? 'primary' : 'default'}
                                        className="collaborator-button"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => cargarArchivos(areaSeleccionada, colaborador)}
                                    >
                                        {colaborador.toLocaleUpperCase().replace(/_/g, ' ')}
                                    </Button>
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            )}

            {colaboradorSeleccionado && (
                <Card className="actas-card" bordered={false}>
                    <Typography.Title level={4} className="section-title">
                        <FilePdfOutlined /> Actas de {colaboradorSeleccionado.toUpperCase().replace(/_/g, ' ')}
                    </Typography.Title>

                    {loading ? (
                        <div className="loading-box">
                            <Spin size="large" />
                        </div>
                    ) : actas.length === 0 ? (
                        <Empty description="No se encontraron archivos PDF" />
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={actas}
                            renderItem={(acta) => (
                                <List.Item
                                    actions={[
                                        <a key={acta.name} href={acta.url} target="_blank" rel="noopener noreferrer">
                                            Ver PDF
                                        </a>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<FilePdfOutlined className="pdf-icon" />}
                                        title={acta.name}
                                        description="Documento disponible en almacenamiento"
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            )}
        </div>
    );
};
