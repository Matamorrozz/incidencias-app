import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, message, Button, Upload } from "antd";
import dayjs from "dayjs";
import { FormInstance } from "antd";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

type FormValues = {
  persona_emisor: string;
  nombre_emisor: string;
  jefe_inmediato: string;
  tipo_registro: string;
  fecha_permiso: any;
  info_registro: string;
  status_acta: string;
  area: string;
  downloadURL?: string; // Añadido
};

interface Incidencia {
  id: string;
  marca_temporal: string;
  persona_emisor: string;
  nombre_emisor: string;
  jefe_inmediato: string;
  tipo_registro: string;
  fecha_permiso: string;
  info_registro: string;
  status_acta: string;
  area: string;
}

interface UsuarioData {
  displayName: string;
  email: string;
  area: string;
}

export const jefesInmediatos = [
  { value: "Luis Jaime Martínez Arredondo", label: "Luis Jaime Martínez Arredondo - Líder de Operaciones" },
  { value: "Carlos Antonio Rivas Martínez", label: "Carlos Antonio Rivas Martínez - Líder de Soporte Técnico Call Center / NPI" },
  { value: "Ana Rosa Lira Ortíz", label: "Ana Rosa Lira Ortíz - Líder de Logística" },
  { value: "Armando de la Rosa García", label: "Armando de la Rosa García - Líder de Desarrollo Tecnológico  " },
  { value: "Ma. del Refugio Arroyo", label: "Ma. del Refugio Arroyo - Gerente Contabilidad, Finanza y RRHH" },
  { value: "Rubén Muñoz González", label: "Rubén Muñoz González - Lider de Soporte Técnico Presencial" },
  { value: "Laura Beatriz Arroyo Salcedo", label: "Laura Beatriz Arroyo Salcedo - Líder de Contabilidad" },
  { value: "Esteban Ramírez", label: "Esteban Ramírez - Gerente General" },
  { value: "Karen Ibarra Ramírez", label: "Karen Ibarra Ramírez - Encargada Ventas de Refacciones y Servicios" },
  { value: "Biviana Tirado Burgueño", label: "Biviana Tirado Burgueño - Encargada Satisfacción al cliente" },
  { value: "Ana Sánchez Murúa", label: "Ana Sánchez Murúa - Generalista RRHH" },
  { value: "Mariana Flores Ibarra", label: "Mariana Flores Ibarra - Jefe de Crédito y Cobranza" },
  { value: "Lucero Ávila Cortes", label: "Lucero Ávila Cortes - Gerente de Mercadotecnia" },
  { value: "Alonso Saúl Sandoval López", label: "Alonso Saúl Sandoval López - Supervisor de Producción" },
  { value: "Sergio Alejandro García Trejo", label: "Sergio Alejandro García Trejo - Jefe de Procesos y Calidad" },
  { value: "Adrián Carlos Guerrero", label: "Adrián Carlos Guerrero - Planeador de Materiales" },
  { value: "Gerardo Reynoso López", label: "Gerardo Reynoso López - Supervisor de Producción" },
  { value: "Jaime Daniel Flores Hernández", label: "Jaime Daniel Flores Hernández - Supervisor de Calidad" },
  { value: "Paola Sarahí Ayala Camacho", label: "Paola Sarahí Ayala Camacho - Analista de Seguridad e Higiene / Mantenimiento" },
  { value: "Christian Mendoza Nepomuceno", label: "Christian Mendoza Nepomuceno - Jefe de Almacén" },
  { value: "Gustavo Gallegos Cortés", label: "Gustavo Gallegos Cortés - Subjefe de Soporte Técnico Presencial / Encargado de Sucursal CDMX" },
  { value: "Saúl Espinoza Silva", label: "Saúl Espinoza Silva - Encargado de Logística Internacional" },
  { value: "Esmeralda Ramírez Díaz", label: "Esmeralda Ramírez Díaz - Subjefe Crédito y Cobranza" },
];

export const BlogPostCreate = () => {
  const { formProps, saveButtonProps, form } = useForm<FormValues>();
  const [userData, setUserData] = useState<Partial<FormValues>>({});
  const [loading, setLoading] = useState(true); // Estado para mostrar carga inicial
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // Usuario seleccionado
  const [tipoRegistro, setTipoRegistro] = useState<string | undefined>(); // Estado para el tipo de registro
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const navigate = useNavigate();

  const convertirTexto = (texto: string): string =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .toLowerCase()
      .replace(/\s+/g, "_"); // Espacios por guiones bajos

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const correo = user.email;
          const q = query(collection(db, "usuarios"), where("correo", "==", correo));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setUserData(userDoc);
            const nombreCompleto = `${userDoc.nombre} ${userDoc.apellido_paterno} ${userDoc.apellido_materno}`;
            const area = userDoc.area;
            await fetchUsersByArea(area);

            // Establecer valores iniciales en el formulario
            form.setFieldsValue({
              persona_emisor: nombreCompleto,
              area: area,
            });
          } else {
            message.error("No se encontró información del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          message.error("Hubo un error al cargar los datos del usuario.");
        } finally {
          setLoading(false); // Finalizar carga
        }
      }
    });

    return () => unsubscribe();
  }, [form]);

  var nombreCompleto



  const fetchUsersByArea = async (area: string) => {
    try {
      const q = query(collection(db, "usuarios"), where("area", "==", area));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsuarios(users); // Actualiza el estado con los usuarios obtenidos
    } catch (error) {
      console.error("Error al obtener usuarios por área:", error);
      message.error("Error al cargar los usuarios del área.");
    }
  };

  const handleFinish = async (values: FormValues) => {
    if (tipoRegistro === "Otro (negativo)." || tipoRegistro === "Otro (positivo).") {
      // No proceder con el envío predeterminado del formulario
      return;
    }

    if (values.fecha_permiso && dayjs.isDayjs(values.fecha_permiso)) {
      values.fecha_permiso = dayjs(values.fecha_permiso).format("YYYY-MM-DD");
    }

    console.log("Datos enviados a la API:", values);

    // Si hay un archivo para subir
    if (fileToUpload) {
      try {
        // Subir el archivo y obtener la URL de descarga
        const downloadURL = await handleUpload(fileToUpload, values.area, values.nombre_emisor);
        // Añadir la URL de descarga a los valores a guardar
        values.downloadURL = downloadURL;
      } catch (error) {
        console.error("Error al subir el archivo:", error);
        message.error("Hubo un error al subir el archivo.");
        return; // Detener el envío del formulario si falla la subida del archivo
      }
    }

    if (formProps.onFinish) {
      formProps.onFinish(values);
    }
  };

  const handleGenerarActa = () => {
    setShowUploadSection(true); // Mostrar la sección de subida de archivos
  };

  const adjustedSaveButtonProps = {
    ...saveButtonProps,
    disabled: tipoRegistro === "Otro (negativo)." || tipoRegistro === "Otro (positivo).",
  };

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

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        Cargando datos del usuario...
      </div>
    );
  }

  return (
    <Create saveButtonProps={adjustedSaveButtonProps}>
      <Form<FormValues>
        {...formProps}
        form={form as unknown as FormInstance<FormValues>}
        layout="vertical"
        onFinish={handleFinish}
      >
        {/* Campo `persona_emisor` prellenado y deshabilitado */}
        <Form.Item
          label="Persona que emite este reporte"
          name="persona_emisor"
          rules={[{ required: true, message: "El campo Persona Emisor es obligatorio" }]}
        >
          <Input disabled /> {/* Campo deshabilitado */}
        </Form.Item>

        <Form.Item
          label="Nombre del empleado al que se le registrará la incidencia"
          name="nombre_emisor"
          rules={[{ required: true, message: "El campo Nombre Emisor es obligatorio" }]}
        >
          <Select
            placeholder="Selecciona un usuario"
            options={usuarios.map((user) => ({
              value: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
              label: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
          }))}
          />
        </Form.Item>

        {/* Campo `area` prellenado y deshabilitado */}
        <Form.Item
          label="Área"
          name="area"
          rules={[{ required: true, message: "El campo Área es obligatorio" }]}
        >
          <Input disabled /> {/* Campo deshabilitado */}
        </Form.Item>

        <Form.Item
          label="Jefe inmediato del empleado"
          name="jefe_inmediato"
          rules={[{ required: true, message: "El campo Jefe Inmediato es obligatorio" }]}
        >
          <Select placeholder="Selecciona un jefe inmediato" options={jefesInmediatos} />
        </Form.Item>

        <Form.Item
          label="Tipo de registro"
          name="tipo_registro"
          rules={[{ required: true, message: "El campo Tipo de Registro es obligatorio" }]}
        >
          <Select
            onChange={(value) => {
              setTipoRegistro(value);
              form.setFieldsValue({ tipo_registro: value });
            }}
            options={[
              {
                value: "Mala actitud",
                label: "Reporte de actitud (irresponsabilidad, acciones negativas, daños, etc).",
              },
              {
                value: "Permiso de llegada tarde",
                label: "Permiso de llegada tarde por asuntos personales.",
              },
              {
                value: "Permiso de inasistencia a cuenta de vacaciones.",
                label: "Permiso de inasistencia a cuenta de vacaciones.",
              },
              { value: "Permiso de salida temprano.", label: "Permiso de salida temprano." },
              {
                value: "Llegada tarde no justificada.",
                label: "Llegada tarde no justificada.",
              },
              {
                value: "Permiso de llegada tarde por cita médica (IMSS).",
                label: "Permiso de llegada tarde por cita médica (IMSS).",
              },
              {
                value: "Falta justificada de acuerdo al Reglamento Interior de Trabajo.",
                label: "Falta justificada de acuerdo al Reglamento Interior de Trabajo.",
              },
              { value: "Falta injustificada.", label: "Falta injustificada." },
              {
                value: "Permiso tiempo x tiempo controlado",
                label: "Permiso tiempo x tiempo controlado",
              },
              {
                value: "Falta por incapacidad del IMSS.",
                label: "Falta por incapacidad del IMSS.",
              },
              {
                value: "Permiso de inasistencia sin goce de sueldo.",
                label: "Permiso de inasistencia sin goce de sueldo.",
              },
              { value: "Otro (negativo).", label: "Otro (negativo)." },
              { value: "Otro (positivo).", label: "Otro (positivo)." },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Ingrese la información del registro (causas de la falta, motivos del permiso, etc)."
          name="info_registro"
          rules={[{ required: true, message: "El campo Información del Registro es obligatorio" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* Condicionalmente renderizar `status_acta` */}
        {tipoRegistro !== "Otro (negativo)." && tipoRegistro !== "Otro (positivo)." && (
          <Form.Item
            label="Confirme la emisión física del Acta Administrativa:"
            name="status_acta"
            initialValue="Favor de emitir"
            rules={[{ required: false, message: "El campo Status del Acta es obligatorio" }]}
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

        {/* Mostrar botón "Generar Acta" condicionalmente */}
        {[
          "Reporte de actitud (irresponsabilidad, acciones negativas, daños, etc).",
          "Permiso de llegada tarde por asuntos personales.",
          "Permiso de inasistencia a cuenta de vacaciones.",
          "Permiso de salida temprano.",
          "Llegada tarde no justificada.",
          "Permiso de llegada tarde por cita médica (IMSS).",
          "Falta justificada de acuerdo al Reglamento Interior de Trabajo.",
          "Falta injustificada.",
          "Permiso tiempo x tiempo controlado",
          "Falta por incapacidad del IMSS.",
          "Permiso de inasistencia sin goce de sueldo.",
          "Mala actitud",
          "Permiso de llegada tarde",
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
    </Create>
  );
};
