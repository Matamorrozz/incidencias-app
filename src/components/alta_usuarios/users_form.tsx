import React from 'react';
import { Form, Input, Select, Button } from "antd";
import { Create, useForm } from "@refinedev/antd";

const UserCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm();

    // Opciones para el dropdown de "fila"
    const filaOptions = [
        { label: 'Calidad', value: 'calidad' },
        { label: 'Procesos', value: 'procesos' },
        { label: 'Producción', value: 'producción' },
        { label: 'Desarrollo Tecnológico', value: 'desarrollo_tecnologico' },
        { label: 'Contabilidad', value: 'contabilidad' },
        { label: 'Reparaciones', value: 'reparaciones' },
    ];

    // Función que se ejecuta al enviar el formulario
    const onFinish = async (values: any) => {
        try {
            // Acomodar los valores según sea necesario
            const formattedValues = {
                usuario: values.usuario,
                contraseña: values.contraseña,  // Si el backend espera "password" en vez de "contraseña"
                nombre: values.nombre,
                apellido_paterno: values.apellido_paterno,
                apellido_materno: values.apellido_materno,
                fila: values.fila,
            };

            // Imprime los datos formateados que vas a enviar
            console.log('Datos enviados:', formattedValues);

            const response = await fetch('https://desarrollotecnologicoar.com/api3/incidencias_usuarios', {
                method: 'POST',  // Cambiar a PUT si es necesario
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedValues),  // Enviar los datos del formulario como JSON
            });

            if (!response.ok) {
                const errorResponse = await response.text(); // Captura el error devuelto por el servidor
                throw new Error(errorResponse || 'Error al registrar usuario');
            }

            const result = await response.json();
            console.log('Usuario registrado con éxito:', result);
        } catch (error: unknown) {  // El tipo de error se marca como 'unknown'
            // Verifica si el error es una instancia de Error
            if (error instanceof Error) {
                console.error('Error al registrar el usuario:', error.message);
            } else {
                console.error('Error inesperado:', error);
            }
        }
    };

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical" onFinish={onFinish}>
                {/* Campo de usuario */}
                <Form.Item
                    label="Usuario"
                    name="usuario"
                    rules={[{ required: true, message: 'Por favor, ingresa un usuario' }]}
                >
                    <Input placeholder="Usuario" />
                </Form.Item>

                {/* Campo de contraseña */}
                <Form.Item
                    label="Contraseña"
                    name="contraseña"
                    rules={[{ required: true, message: 'Por favor, ingresa una contraseña' }]}
                >
                    <Input.Password placeholder="Contraseña" />
                </Form.Item>

                {/* Campo de nombre */}
                <Form.Item
                    label="Nombre"
                    name="nombre"
                    rules={[{ required: true, message: 'Por favor, ingresa un nombre' }]}
                >
                    <Input placeholder="Nombre" />
                </Form.Item>

                {/* Campo de apellido paterno */}
                <Form.Item
                    label="Apellido Paterno"
                    name="apellido_paterno"
                    rules={[{ required: true, message: 'Por favor, ingresa el apellido paterno' }]}
                >
                    <Input placeholder="Apellido Paterno" />
                </Form.Item>

                {/* Campo de apellido materno */}
                <Form.Item
                    label="Apellido Materno"
                    name="apellido_materno"
                    rules={[{ required: true, message: 'Por favor, ingresa el apellido materno' }]}
                >
                    <Input placeholder="Apellido Materno" />
                </Form.Item>

                {/* Campo de fila (lista desplegable) */}
                <Form.Item
                    label="Fila"
                    name="fila"
                    rules={[{ required: true, message: 'Por favor, selecciona una fila' }]}
                >
                    <Select
                        placeholder="Selecciona una fila"
                        options={filaOptions}   // Pasar las opciones aquí
                    />
                </Form.Item>

                {/* Botón de enviar */}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Registrar Usuario
                    </Button>
                </Form.Item>
            </Form>
        </Create>
    );
};

export default UserCreate;
