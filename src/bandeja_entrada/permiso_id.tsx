import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, message, Typography, Tag, Space, Modal, Form, Input, DatePicker, Select } from "antd";
import axios from "axios";
import { auth } from "../firebaseConfig";
import dayjs from "dayjs";
const { Text } = Typography;

interface Permiso {
  id: string;
  fecha_solicitud: string;
  nombre_completo: string;
  correo: string;
  jefe_inmediato: string;
  area: string;
  tipo_permiso: string;
  urgencia: boolean;
  comentarios: string;
  status: string;
  fecha_permiso: string;
}

export const DetallePermiso = () => {
  const { id } = useParams<{ id: string }>(); // Obtener ID de la URL
  const navigate = useNavigate(); // Navegar entre rutas
  const [loading, setLoading] = useState(true); // Estado de carga
  const [permiso, setPermiso] = useState<Permiso | null>(null); // Estado del permiso
  const [user, setUser] = useState<any>(null); // Usuario autenticado
  const [isModalVisible, setIsModalVisible] = useState(false); // Control del modal
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [nuevoStatus, setNuevoStatus] = useState<string>(""); // Estado del nuevo status

  const [form] = Form.useForm(); // Crear una instancia del formulario

  // Función para obtener los datos del permiso
  const fetchPermiso = async () => {
    try {
      const response = await axios.get(
        `https://desarrollotecnologicoar.com/api3/permisos/${id}`
      );
      setPermiso(response.data); // Guardamos el permiso
    } catch (error) {
      console.error("Error al obtener el permiso:", error);
      message.error("Hubo un error al cargar el permiso.");
    } finally {
      setLoading(false); // Terminamos la carga
    }
  };

  // Validar datos del usuario
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // Guardar el usuario autenticado
      } else {
        message.error("Usuario no autenticado");
        navigate("/login");
      }
    });

    return () => unsubscribe(); // Limpiar el listener
  }, [navigate]);

  // useEffect para cargar los datos al montar el componente
  useEffect(() => {
    fetchPermiso();
  }, [id]);

  const showModal = (status: string) => {
    setNuevoStatus(status); // Guardamos el nuevo status (Aprobado o Rechazado)
    if (permiso && user) {
      form.setFieldsValue({
        persona_emisor: user.displayName || user.email,
        nombre_emisor: permiso.nombre_completo,
        jefe_inmediato: permiso.jefe_inmediato,
        area: permiso.area,
        fecha_permiso: dayjs(permiso.fecha_permiso).format("YYYY-MM-DD")
      });
    }
    setIsModalVisible(true); // Mostrar el modal
  };

  const handleCancel = () => setIsModalVisible(false); // Cerrar el modal
  const handleRejectCancel = () => setIsRejectModalVisible(false);

  // Función para enviar el formulario
  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // Validar los campos del formulario
      console.log("Valores del formulario:", values);

      // Llamada a la API para actualizar el estado
      await axios.put(
        `https://desarrollotecnologicoar.com/api3/actualizar_status/${id}`,
        { status: nuevoStatus, ...values }
      );
      message.success(`El permiso ha sido ${nuevoStatus.toLowerCase()} correctamente.`);
      navigate("/bandeja_entrada"); // Redirigir a la bandeja
    } catch (error) {
      console.error("Error al actualizar el permiso:", error);
      message.error("Hubo un error al actualizar el permiso.");
    }
    try {
      const values = await form.validateFields(); // Validar los campos del formulario
      console.log("Valores del formulario:", values);
      await axios.post(`https://desarrollotecnologicoar.com/api3/incidencias`, values);
      message.success("El permiso se ha registrado correctamente.");
      navigate("/bandeja_entrada");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      message.error("Hubo un error al registrar el permiso.");
    }


  };

    // Modal para confirmar el rechazo
    const confirmRejection = async () => {
      try {
        await axios.put(
          `https://desarrollotecnologicoar.com/api3/actualizar_status/${id}`,
          { status: "Rechazado" }
        );
        message.success("El permiso ha sido rechazado.");
        navigate("/bandeja_entrada");
      } catch (error) {
        console.error("Error al rechazar el permiso:", error);
        message.error("Hubo un error al rechazar el permiso.");
      }
    };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  }

  if (!permiso) {
    return <div>No se encontró el permiso.</div>;
  }

  return (
    <Card
      title={`Permiso de ${permiso.nombre_completo}`}
      bordered={false}
      style={{ width: 600, margin: "50px auto", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Text strong>ID:</Text>
        <Text>{permiso.id}</Text>

        <Text strong>Correo:</Text>
        <Text>{permiso.correo}</Text>

        <Text strong>Fecha de Solicitud:</Text>
        <Text>{permiso.fecha_solicitud}</Text>

        <Text strong>Tipo de Permiso:</Text>
        <Text>{permiso.tipo_permiso}</Text>

        <Text strong>Urgencia:</Text>
        <Tag color={permiso.urgencia ? "red" : "green"}>
          {permiso.urgencia ? "Urgente" : "No Urgente"}
        </Tag>

        <Text strong>Comentarios:</Text>
        <Text>{permiso.comentarios}</Text>

        <Text strong>Status Actual:</Text>
        <Tag color={
          permiso.status === "Pendiente" ? "orange" :
            permiso.status === "Aprobado" ? "green" : "red"
        }>
          {permiso.status}
        </Tag>

        <Space size="middle" style={{ marginTop: "20px" }}>
          <Button
            type="primary"
            onClick={() => showModal("Aprobado")}
            disabled={permiso.status === "Aprobado"}
          >
            Aprobar Permiso
          </Button>
          <Button
            danger
            onClick={() => showModal("Rechazado")}
            disabled={permiso.status === "Rechazado"}
          >
            Rechazar Permiso
          </Button>
        </Space>
      </Space>

      <Modal
        title="Confirmar Cambio de Permiso"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">

          <Form.Item label="Persona Emisora" name="persona_emisor">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Nombre Emisor" name="nombre_emisor">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Jefe Inmediato" name="jefe_inmediato">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Tipo de Registro" name="tipo_registro" rules={[{ required: true, message: 'Campo requerido' }]}>
          <Select options={[
            { value: "Mala actitud", label: "Reporte de actitud (irresponsabilidad, acciones negativas, daños, etc)." },
            { value: "Permiso de llegada tarde", label: "Permiso de llegada tarde por asuntos personales." },
            { value: "Permiso de inasistencia a cuenta de vacaciones.", label: "Permiso de inasistencia a cuenta de vacaciones." },
            { value: "Permiso de salida temprano.", label: "Permiso de salida temprano." },
            { value: "Llegada tarde no justificada.", label: "Llegada tarde no justificada." },
            { value: "Permiso de llegada tarde por cita médica (IMSS).", label: "Permiso de llegada tarde por cita médica (IMSS)." },
            { value: "Falta justificada de acuerdo al Reglamento Interior de Trabajo.", label: "Falta justificada de acuerdo al Reglamento Interior de Trabajo." },
            { value: "Falta injustificada.", label: "Falta injustificada." },
            { value: "Permiso tiempo x tiempo controlado", label: "Permiso tiempo x tiempo controlado" },
            { value: "Falta por incapacidad del IMSS.", label: "Falta por incapacidad del IMSS." },
            { value: "Permiso de inasistencia sin goce de sueldo.", label: "Permiso de inasistencia sin goce de sueldo." },
          ]} />
          </Form.Item>

          <Form.Item label="Fecha del Permiso" name="fecha_permiso">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Información del Registro" name="info_registro">
            <Input.TextArea rows={5} />
          </Form.Item>

          <Form.Item label="Status del Acta" name="status_acta" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Select options={[
              {value:"Favor de emitir" , label:"Favor de emitir" },
              {value:"Emitida y firmada (enviada a RH)" , label:"Emitida y firmada (enviada a RH)" },
              {value:"Emitida y firmada (pendiente de enviarse a RH)" , label:"Emitida y firmada (pendiente de enviarse a RH)" },
              {value:"Emitida y en espera de recabar firmas" , label:"Emitida y en espera de recabar firmas" },

            ]}/>
          </Form.Item>

          <Form.Item label="Área" name="area">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Confirmar Rechazo" visible={isRejectModalVisible} onOk={confirmRejection} onCancel={handleRejectCancel}>
        <p>¿Estás seguro de rechazar este permiso?</p>
      </Modal>
    </Card>
  );
};
