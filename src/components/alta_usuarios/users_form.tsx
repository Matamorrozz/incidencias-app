import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Table, Popconfirm } from "antd";
import { Create, useForm } from "@refinedev/antd";
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UserCreate: React.FC = () => {
    const { formProps, saveButtonProps, form } = useForm();
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<any[]>([]); 


    const onFinish = async (values: any) => {
        try {
            console.log('Datos enviados:', values);

            const apiKey ='AIzaSyDArlaidbMgHfMvy4U6HcaNS3B9j59pN60'; // Tu API Key de Firebase
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
                throw new Error(errorData.error.message || 'Error al registrar el usuario');
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
            });

            message.success('Usuario registrado exitosamente.');
            form.resetFields();
            fetchUsuarios(); // Refrescar la lista de usuarios
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            message.error('Error al registrar el usuario.');
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
                    <Button danger>Eliminar</Button>
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
                    <Input placeholder="Área de Trabajo" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Registrar Usuario
                    </Button>
                </Form.Item>
            </Form>

            <Table dataSource={usuarios} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
        </Create>
    );
};

export default UserCreate;
