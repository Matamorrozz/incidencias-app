import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, message, Typography, Tag, Space, Modal, Form, Input, Select, Upload } from "antd";
import axios from "axios";
import { auth, storage } from "../../firebaseConfig";
import dayjs from "dayjs";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { UploadOutlined } from "@ant-design/icons";

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
  motivo_rechazado: string;
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
  const [rechazoComentarios, setRechazoComentarios] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Estados agregados para replicar lógica del primer componente
  const [tipoRegistro, setTipoRegistro] = useState<string | undefined>();
  const [showUploadSection, setShowUploadSection] = useState(false);

  const convertirTexto = (texto: string): string =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .toLowerCase()
      .replace(/\s+/g, "_"); // Espacios por guiones bajos

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

  const showModalRechazo = (status: string) => {
    setNuevoStatus(status);
    if (permiso && user) {
      form.setFieldsValue({
        motivo_rechazado: ""
      });
    }
    setIsRejectModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false); // Cerrar el modal
  const handleRejectCancel = () => setIsRejectModalVisible(false);

  // Función para subir el archivo a Firebase Storage
  const handleUpload = (file: File, area: string, nombre_emisor: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      try {
        setUploading(true);

        const areaNormalized = convertirTexto(area);
        const nombreEmisorNormalized = convertirTexto(nombre_emisor);

        const storagePath = `${areaNormalized}/${nombreEmisorNormalized}/${file.name}`;

        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Subiendo: ${progress}%`);
          },
          (error) => {
            console.error("Error al subir archivo:", error);
            message.error("Hubo un error al subir el archivo.");
            setUploading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Archivo disponible en:", downloadURL);
            message.success("Archivo subido correctamente.");
            setUploading(false);
            resolve(downloadURL);
          }
        );
      } catch (error) {
        console.error("Error al subir archivo:", error);
        message.error("Hubo un error al subir el archivo.");
        setUploading(false);
        reject(error);
      }
    });
  };

  const handleOk = async () => {
    // Antes de proceder revisamos el tipoRegistro
    if (tipoRegistro === "Otro (negativo)." || tipoRegistro === "Otro (positivo).") {
      // No proceder si es "Otro"
      message.warning("No se puede registrar el permiso con este tipo de registro.");
      return;
    }

    try {
      const values = await form.validateFields(); // Validar los campos del formulario

      // Subida de archivo si se adjuntó
      if (fileToUpload) {
        try {
          const downloadURL = await handleUpload(fileToUpload, values.area, values.nombre_emisor);
          values.downloadURL = downloadURL;
        } catch (error) {
          console.error("Error al subir archivo:", error);
          message.error("Error al subir el archivo. No se puede continuar.");
          return;
        }
      }

      // Actualizar status del permiso en la API
      await axios.put(
        `https://desarrollotecnologicoar.com/api3/actualizar_status/${id}`,
        { status: nuevoStatus, ...values }
      );

      // Registrar la incidencia (similar a como se hace en el primer componente)
      await axios.post(`https://desarrollotecnologicoar.com/api3/incidencias`, values);

      message.success(`El permiso ha sido ${nuevoStatus.toLowerCase()} y registrado correctamente.`);
      navigate("/bandeja_entrada"); // Redirigir a la bandeja
    } catch (error) {
      console.error("Error al actualizar o registrar el permiso:", error);
      message.error("Hubo un error al actualizar o registrar el permiso.");
    }
  };

  const confirmRejection = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(
        `https://desarrollotecnologicoar.com/api3/actualizar_status/${id}`,
        {
          status: "Rechazado",
          motivo_rechazado: values.motivo_rechazado
        }
      );
      message.success("El permiso ha sido rechazado.");
      navigate("/bandeja_entrada");
    } catch (error) {
      console.error("Error al rechazar el permiso:", error);
      message.error("Hubo un error al rechazar el permiso.");
    }
  };

  const handleGenerarActa = () => {
    setShowUploadSection(true); // Mostrar la sección de subida de archivos
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
            onClick={() => showModalRechazo("Rechazado")}
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

          {/* Tipo de registro con onChange para setear estado */}
          <Form.Item 
            label="Tipo de Registro" 
            name="tipo_registro" 
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select 
              onChange={(value) => {
                setTipoRegistro(value);
                form.setFieldsValue({ tipo_registro: value });
              }}
              options={[
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
                { value: "Otro (negativo).", label: "Otro (negativo)." },
                { value: "Otro (positivo).", label: "Otro (positivo)." },
              ]} 
            />
          </Form.Item>

          <Form.Item label="Fecha del Permiso" name="fecha_permiso">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Información del Registro" name="info_registro">
            <Input.TextArea rows={5} />
          </Form.Item>

          {/* Mostrar `status_acta` solo si tipo_registro NO es "Otro" */}
          {tipoRegistro !== "Otro (negativo)." && tipoRegistro !== "Otro (positivo)." && (
            <Form.Item
              label="Confirme la emisión física del Acta Administrativa:"
              name="status_acta"
              initialValue="Favor de emitir"
            >
              <Select
                options={[
                  { value: "Favor de emitir", label: "Favor de emitir" },
                  { value: "Emitida y firmada", label: "Emitida y firmada" },
                  { value: "Pendiente de envío", label: "Pendiente de envío" },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item label="Área" name="area">
            <Input disabled />
          </Form.Item>

          {/* Mostrar botón "Adjuntar Acta" si el tipo_registro no es Otro */}
          {[
            "Mala actitud",
            "Permiso de llegada tarde",
            "Permiso de inasistencia a cuenta de vacaciones.",
            "Permiso de salida temprano.",
            "Llegada tarde no justificada.",
            "Permiso de llegada tarde por cita médica (IMSS).",
            "Falta justificada de acuerdo al Reglamento Interior de Trabajo.",
            "Falta injustificada.",
            "Permiso tiempo x tiempo controlado",
            "Falta por incapacidad del IMSS.",
            "Permiso de inasistencia sin goce de sueldo.",
          ].includes(tipoRegistro || "") && (
            <Form.Item>
              <Button type="primary" onClick={handleGenerarActa}>
                Adjuntar Acta
              </Button>
              <span style={{ marginLeft: "10px" }}>
                <a
                  onClick={() => navigate("/impresion_acta")}
                  style={{ color: "#1890ff", cursor: "pointer" }}
                >
                  ¿No cuentas con acta? Llénala aquí!
                </a>
              </span>
            </Form.Item>
          )}

          {/* Sección de subida de archivos condicional */}
          {showUploadSection && (
            <Form.Item label="Subir Acta Administrativa">
              <Upload
                accept=".pdf,.jpg,.png,.jpeg"
                beforeUpload={(file) => {
                  setFileToUpload(file); // Guardar archivo en el estado
                  return false; // Prevenir la subida automática
                }}
                showUploadList={true}
              >
                <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Confirmar Rechazo"
        visible={isRejectModalVisible}
        onOk={confirmRejection}
        onCancel={handleRejectCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Escribe el motivo del rechazo"
            name="motivo_rechazado"
            rules={[{ required: true, message: "Por favor, escribe el motivo del rechazo." }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

    </Card>
  );
};
