import React, { useEffect, useState } from 'react';
import { Table, Spin, Input, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { usuariosPermitidos } from '../../user_config';

const { Search } = Input;

interface PiezasTableProps {
    selectedArea: string | null;
    selectedFecha: string | null;
    dates: [string | null, string | null];
}

const PiezasTable: React.FC<PiezasTableProps> = ({ selectedArea, dates }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(''); 

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [area, setArea] = useState<string | null>(null);

    const UsuariosPermitidos = usuariosPermitidos;

    const convertirTexto = (texto: string): string =>
        texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "_");

    // 🔥 Actualización: Asegurar que los datos se asignan correctamente.
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://www.desarrollotecnologicoar.com/api3/incidencias');
            let filteredData = response.data;


            if (dates[0] && dates[1]) {
                const [startDate, endDate] = dates;
                filteredData = filteredData.filter((incidencia: any) => {
                    const fechaPermiso = moment(incidencia.marca_temporal);
                    return fechaPermiso.isBetween(moment(startDate), moment(endDate), undefined, '[]');
                });
            }

            setData(filteredData);
        } catch (error) {
            console.error("Error al obtener los datos de la API", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsuariosUnicos = async (userArea: string) => {
        try {
            setLoading(true)

            
            const areaNormalizada = convertirTexto(userArea);
            const url = `https://desarrollotecnologicoar.com/api3/incidencias_area?area=${encodeURIComponent(areaNormalizada)}`;

            const response = await axios.get(url);
            let filteredData = response.data;
            

            if (dates[0] && dates[1]) {
                const [startDate, endDate] = dates;
                filteredData = filteredData.filter((incidencia: any) => {
                    const fechaPermiso = moment(incidencia.marca_temporal);
                    return fechaPermiso.isBetween(moment(startDate), moment(endDate), undefined, '[]');
                });
            }
            setData(filteredData);  // 🔥 Guardar los datos obtenidos
        } catch (error) {
            console.error("Error al obtener usuarios únicos:", error);
            message.error("Error al cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async (currentUser: any) => {
            try {
                const correo = currentUser.email;
                setUserEmail(correo);
    
                const q = query(collection(db, "usuarios"), where("correo", "==", correo));
                const querySnapshot = await getDocs(q);
    
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0].data();
                    const userArea = convertirTexto(userDoc.area);
                    setArea(userArea); // Guardamos el área en el estado
    
                    if (UsuariosPermitidos.includes(correo)) {
                        await fetchData(); // Acceso completo
                    } else {
                        await fetchUsuariosUnicos(userArea); // Filtrar por área del usuario
                    }
                } else {
                    message.error("No se encontró información del usuario.");
                }
            } catch (error) {
                console.error("Error al obtener datos del usuario:", error);
                message.error("Error al cargar los datos del usuario.");
            }
        };

        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                fetchUserData(currentUser);
            } else {
                message.error("Usuario no autenticado.");
                setLoading(false);
            }
        });
    }, [dates, selectedArea]);

    const searchedData = data.filter((pieza: any) =>
        pieza.persona_emisor?.toLowerCase().includes(search.toLowerCase()) ||
        pieza.nombre_emisor?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Marca Temporal', dataIndex: 'marca_temporal', key: 'marca_temporal', render: (fecha: any) => moment(fecha).format('DD/MM/YYYY HH:mm:ss') },
        { title: 'Persona Emisora', dataIndex: 'persona_emisor', key: 'persona_emisor' },
        { title: 'Nombre Emisor', dataIndex: 'nombre_emisor', key: 'nombre_emisor' },
        { title: 'Jefe Inmediato', dataIndex: 'jefe_inmediato', key: 'jefe_inmediato' },
        { title: 'Tipo de Registro', dataIndex: 'tipo_registro', key: 'tipo_registro' },
        { title: 'Fecha de Permiso', dataIndex: 'fecha_permiso', key: 'fecha_permiso', render: (fecha: any) => moment(fecha).format('DD/MM/YYYY') },
        { title: 'Información del Registro', dataIndex: 'info_registro', key: 'info_registro' },
        { title: 'Estatus del Acta', dataIndex: 'status_acta', key: 'status_acta' },
        { title: 'Área', dataIndex: 'area', key: 'area' },
    ];

    if (loading) return <Spin size="large" />;

    return (
        <div>
            <Search
                placeholder="Buscar por persona o nombre del emisor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table scroll={{ x: 800, y: 300 }} columns={columns} dataSource={searchedData} rowKey="id" pagination={{ pageSize: 5 }} />
        </div>
    );
};

export default PiezasTable;
