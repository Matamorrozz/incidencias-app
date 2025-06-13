import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Table, Popconfirm, Select } from "antd";
import { Create, useForm } from "@refinedev/antd";
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { usuariosPermitidos } from '../../user_config';
import moment from 'moment';

export const opciones = [
    { value: "Desarrollo Tecnológico", label: "Desarrollo Tecnológico" },
    { value: "Logística", label: "Logística" },
    { value: "Producción CNC", label: "Producción CNC" },
    { value: "Calidad y Procesos", label: "Calidad y Procesos" },
    { value: "Garantías y Satisfacción al cliente", label: "Garantías y Satisfacción al cliente" },
    { value: "Almacén", label: "Almacén" },
    { value: "Mercadotecnia", label: "Mercadotecnia" },
    { value: "Soporte Técnico Presencial", label: "Soporte Técnico Presencial" },
    { value: "Crédito y Cobranza", label: "Crédito y Cobranza" },
    { value: "Compras", label: "Compras" },
    { value: "Ventas de refacciones y servicios", label: "Ventas de refacciones y servicios" },
    { value: "Servicio Técnico Telefónico", label: "Servicio Técnico Telefónico" },
    { value: "Contabilidad y Finanzas", label: "Contabilidad y Finanzas" },
    { value: "Recursos Humanos", label: "Recursos Humanos" },
    {value: "Seguridad e Higiene", label: "Seguridad e Higiene"},
    {value: "Reparaciones", label: "Reparaciones"},
    {value: "Laser Express", label: "Laser Express"}

] 
const UserCreate: React.FC = () => {
    const { formProps, saveButtonProps, form } = useForm();
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [isUserAllowed, setIsUserAllowed] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);



    useEffect(() => {
        const unsuscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserEmail(user.email || null);
                setIsUserAllowed(usuariosPermitidos.includes(user.email || ""))
            } else {
                setIsUserAllowed(false);
                setCurrentUserEmail(null);
            }
        });
        return () => unsuscribe();
    }, []);

    const onFinish = async (values: any) => {
        try {
            console.log('Datos enviados:', values);

            const apiKey = 'AIzaSyDArlaidbMgHfMvy4U6HcaNS3B9j59pN60'; // Tu API Key de Firebase
            const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: values.correo,
                    password: values.contraseña,
                    returnSecureToken: false, // Evita que el usuario se autentique automáticamente
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `Error al registrar el usuario`);
            }

            const { localId } = await response.json(); // Obtener el UID del usuario

            // Guardar en Firestore
            await setDoc(doc(db, 'usuarios', localId), {
                nombre: values.nombreCompleto,
                apellido_paterno: values.apellidoPaterno,
                apellido_materno: values.apellidoMaterno,
                area: values.areaTrabajo,
                correo: values.correo,
                fecha_creado: serverTimestamp(),
                numero_empleado:  values.numeroEmpleado
            });

            message.success('Usuario registrado exitosamente.');
            form.resetFields();
            fetchUsuarios(); // Refrescar la lista de usuarios
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            // Check if error is an instance of Error and handle accordingly
            if (error instanceof Error) {
                message.error(`Error al registrar el usuario: ${error.message}`);
            } else {
                message.error('Error desconocido al registrar el usuario');
            }
        }
    };

    // Obtener usuarios de Firestore
    const fetchUsuarios = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            const usuariosData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsuarios(usuariosData);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            message.error('Error al cargar los usuarios.');
        }
    };

    // Eliminar usuario de Firestore
    const handleDelete = async (userId: string) => {
        try {
            await deleteDoc(doc(db, 'usuarios', userId));
            message.success('Usuario eliminado con éxito.');
            fetchUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            message.error('Error al eliminar usuario.');
        }
    };

    useEffect(() => {
        fetchUsuarios();
        form.resetFields();
    }, [form]);

    const filteredUsuarios = selectedArea ?
        usuarios.filter(user => user.area === selectedArea)
        : usuarios;

    const columns = [
        { title: 'Correo', dataIndex: 'correo', key: 'correo' },
        { title: 'Nombre Completo', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Apellido Paterno', dataIndex: 'apellido_paterno', key: 'apellido_paterno' },
        { title: 'Apellido Materno', dataIndex: 'apellido_materno', key: 'apellido_materno' },
        { title: 'Área de Trabajo', dataIndex: 'area', key: 'area' },
        {
            title: 'Fecha Creado',
            dataIndex: 'fecha_creado',
            key: 'fecha_creado',
            render: (text: any) => text?.toDate().toLocaleString(),
        },
        { title: 'Numero de empleado', dataIndex: 'numero_empleado', key: 'numero_empleado' },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (text: any, record: any) => (
                <Popconfirm
                    title="¿Estás seguro de eliminar este usuario?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Sí"
                    cancelText="No"
                >
                    <Button danger disabled={!isUserAllowed}>Eliminar</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Correo Electrónico"
                    name="correo"
                    rules={[
                        { required: true, message: 'Por favor, ingresa un correo electrónico' },
                        { type: 'email', message: 'Por favor, ingresa un correo válido' },
                    ]}
                >
                    <Input placeholder="Correo Electrónico" />
                </Form.Item>

                <Form.Item
                    label="Contraseña"
                    name="contraseña"
                    rules={[{ required: true, message: 'Por favor, ingresa una contraseña' }]}
                >
                    <Input.Password placeholder="Contraseña" />
                </Form.Item>

                <Form.Item
                    label="Nombre Completo"
                    name="nombreCompleto"
                    rules={[{ required: true, message: 'Por favor, ingresa el nombre completo' }]}
                >
                    <Input placeholder="Nombre Completo" />
                </Form.Item>

                <Form.Item
                    label="Apellido Paterno"
                    name="apellidoPaterno"
                    rules={[{ required: true, message: 'Por favor, ingresa el apellido paterno' }]}
                >
                    <Input placeholder="Apellido Paterno" />
                </Form.Item>

                <Form.Item
                    label="Apellido Materno"
                    name="apellidoMaterno"
                    rules={[{ required: true, message: 'Por favor, ingresa el apellido materno' }]}
                >
                    <Input placeholder="Apellido Materno" />
                </Form.Item>

                <Form.Item
                    label="Área de Trabajo"
                    name="areaTrabajo"
                    rules={[{ required: true, message: 'Por favor, ingresa el área de trabajo' }]}
                >
                    <Select options={opciones} />
                </Form.Item>

                <Form.Item
                    label="Numero de empleado"
                    name="numeroEmpleado"
                    rules={[{ required: true, message: 'Por favor, ingresa el anumero de empleadoo' }]}
                >
                    <Input placeholder="# de empleado" />
                </Form.Item>


                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={!isUserAllowed}>
                        Registrar Usuario
                    </Button>
                </Form.Item>
                
        
            </Form>
            <Select
                    placeholder="Filtrar por área"
                    style={{ marginBottom: 16, width: 200 }}
                    onChange={(value) => setSelectedArea(value)}
                    allowClear
                    options = {opciones}
                >
            </Select>

            <Table dataSource={filteredUsuarios} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} scroll={{ x: 800, y: 300 }} />
        </Create>
    );
};

export default UserCreate;
