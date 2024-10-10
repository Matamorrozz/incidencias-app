import React, { useEffect, useState } from 'react';
import { Table, Spin, Input } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Search } = Input;

interface PiezasTableProps {
    selectedArea: string | null; // Prop para el área seleccionada
    selectedFecha: string | null; // Prop para la fecha seleccionada
    dates: [string | null, string | null]; // Prop para el rango de fechas
}

const PiezasTable: React.FC<PiezasTableProps> = ({ selectedArea, selectedFecha, dates }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(''); // Estado para el término de búsqueda

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://www.desarrollotecnologicoar.com/api3/incidencias');
                let filteredData = response.data;

                // Filtrar por área si se ha seleccionado
                if (selectedArea) {
                    filteredData = filteredData.filter((incidencia: any) => incidencia.area.toLowerCase() === selectedArea.toLowerCase());
                }

                // Filtrar por fecha si se ha seleccionado una
                if (selectedFecha) {
                    filteredData = filteredData.filter((incidencia: any) => incidencia.marca_temporal === selectedFecha.toLowerCase());
                }

                // Filtrar por rango de fechas si se han seleccionado
                if (dates[0] && dates[1]) {
                    const [startDate, endDate] = dates;
                    filteredData = filteredData.filter((incidencia: any) => {
                        const fechaPermiso = moment(incidencia.fecha_permiso);
                        return fechaPermiso.isSameOrAfter(moment(startDate)) && fechaPermiso.isSameOrBefore(moment(endDate));
                    });
                }

                setData(filteredData);
            } catch (error) {
                console.error("Error al obtener los datos de la API", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedArea, selectedFecha, dates]);

    // Filtrar los datos por el término de búsqueda (código o ticket)
    const searchedData = data.filter((pieza: any) => 
        pieza.persona_emisor?.toLowerCase().includes(search.toLowerCase()) || pieza.nombre_emisor?.toLowerCase().includes(search.toLowerCase())
    );

    // Configurar las columnas de la tabla
    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            key: 'id',
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Marca Temporal', 
            dataIndex: 'marca_temporal', 
            key: 'marca_temporal', 
            render: (fecha: any) => moment(fecha).format('YYYY-MM-DD HH:mm:ss') 
        },
        { 
            title: 'Persona Emisora', 
            dataIndex: 'persona_emisor', 
            key: 'persona_emisor', 
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Nombre Emisor', 
            dataIndex: 'nombre_emisor', 
            key: 'nombre_emisor', 
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Jefe Inmediato', 
            dataIndex: 'jefe_inmediato', 
            key: 'jefe_inmediato', 
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Tipo de Registro', 
            dataIndex: 'tipo_registro', 
            key: 'tipo_registro', 
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Fecha de Permiso', 
            dataIndex: 'fecha_permiso', 
            key: 'fecha_permiso', 
            render: (fecha: any) => fecha !== '1899-12-30T00:00:00.000Z' ? moment(fecha).format('YYYY-MM-DD') : 'No disponible' 
        },
        { 
            title: 'Información del Registro', 
            dataIndex: 'info_registro', 
            key: 'info_registro', 
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Estatus del Acta', 
            dataIndex: 'status_acta', 
            key: 'status_acta', 
            render: (text: any) => text || 'No disponible' 
        },
        { 
            title: 'Área', 
            dataIndex: 'area', 
            key: 'area', 
            render: (text: any) => text || 'No disponible' 
        }
    ];

    if (loading) return <Spin size="large" />;

    return (
        <div>
            {/* Barra de búsqueda */}
            <Search 
                placeholder="Buscar por persona emisora o nombre del emisor" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} // Actualiza el estado de búsqueda
                style={{ marginBottom: 16 }} // Espacio entre la barra de búsqueda y la tabla
            />

            {/* Tabla con los datos filtrados */}
            <Table 
                columns={columns} 
                dataSource={searchedData} // Usamos los datos filtrados por búsqueda
                rowKey="id" // Asegúrate de que la API tiene una propiedad 'id' única
                pagination={{ pageSize: 5 }} 
            />
        </div>
    );
};

export default PiezasTable;
