import React, { useEffect, useState } from 'react';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../../../firebaseConfig';
import { Button, Row, Col } from 'antd';
import { Typography } from 'antd/lib';
import { ColorModeContext } from '../../../contexts/color-mode';
import { useContext } from "react";
import { EyeOutlined } from '@ant-design/icons';

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
    const modeImage = mode === "dark" ? "white"  : "black";
    const modeImageButton = mode === "dark" ? "#abebc6" : "#81d4fa";
    const modeText = mode === "dark" ? "black"  : "white";

    return (
        <div style={{ padding: '1rem' }}>
            <Typography.Title level={2} style={{ color: modeImage }}> {areaSeleccionada ? "Filtrar otra área" : "Selecciona el área a visualizar:"}</Typography.Title>


            <Row gutter={[16, 16]} justify={areaSeleccionada ? 'start' : 'center'} style={{ marginBottom: '1rem' }}>
                {areas.map((area) => (
                    <Col
                        key={area}
                        xs={24}
                        sm={areaSeleccionada ? 8 : 12}
                        md={areaSeleccionada ? 6 : 8}
                        lg={areaSeleccionada ? 4 : 6}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',


                        }}

                    >
                        <Button
                            type="primary"
                            onClick={() => cargarColaboradores(area)}
                            style={{
                                width: areaSeleccionada ? '100%' : '100%',
                                height: areaSeleccionada ? 'auto' : '100px',
                                fontSize: areaSeleccionada ? '0.8rem' : '1.2rem',
                                backgroundColor: modeImageButton,
                                color: modeText,

                            }}
                            icon={areaSeleccionada ? undefined : <EyeOutlined />}

                            size="large"
                        >
                            {area.toLocaleUpperCase().replace(/_/g, ' ')}
                        </Button>
                    </Col>
                ))}
            </Row>




            {areaSeleccionada && (
                <>
                    <h3>👤 Colaboradores en {areaSeleccionada.toUpperCase().replace(/_/g, ' ')}</h3>
                    <ul>
                        {colaboradores.map((colaborador) => (
                            <li key={colaborador}>
                                <Typography.Link
                                    onClick={() => cargarArchivos(areaSeleccionada, colaborador)}
                                    style={{ cursor: 'pointer', color: 'blue' }}
                                >
                                    {colaborador.toLocaleUpperCase().replace(/_/g, ' ')}
                                </Typography.Link>

                            </li>
                        ))}
                    </ul>
                </>
            )}

            {colaboradorSeleccionado && (
                <>
                    <h3>📄 Actas de {colaboradorSeleccionado}</h3>
                    {loading ? (
                        <p>Cargando archivos...</p>
                    ) : actas.length === 0 ? (
                        <p>No se encontraron archivos PDF.</p>
                    ) : (
                        <ul>
                            {actas.map((acta) => (
                                <li key={acta.name}>
                                    <a href={acta.url} target="_blank" rel="noopener noreferrer">
                                        {acta.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};
