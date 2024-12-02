import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, message} from "antd";
import dayjs from "dayjs";
import { FormInstance } from "antd";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import axios from "axios";

type FormValues = {
  persona_emisor: string;
  nombre_emisor: string;
  jefe_inmediato: string;
  tipo_registro: string;
  fecha_permiso: any;
  info_registro: string;
  status_acta: string;
  area: string;
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

const jefesInmediatos = [
  { value: "Luis Jaime Martínez Arredondo", label: "Luis Jaime Martínez Arredondo - Operaciones" },
  { value: "Carlos Antonio Rivas Martínez", label: "Carlos Antonio Rivas Martínez - Soporte Técnico Call Center / NPI" },
  { value: "Ana Rosa Lira Ortíz", label: "Ana Rosa Lira Ortíz - Logística" },
  { value: "Armando de la Rosa García", label: "Armando de la Rosa García - Jefe de Desarrollo Tecnológico  " },
  { value: "Ma. del Refugio Arroyo", label: "Ma. del Refugio Arroyo - Gerente Contabilidad, Finanza y RRHH" },
  { value: "Rubén Muñoz González", label: "Rubén Muñoz González - Soporte Técnico Presencial" },
  { value: "Laura Beatriz Arroyo Salcedo", label: "Laura Beatriz Arroyo Salcedo - Jefe de Contabilidad" },
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
  const [usuarios, setUsuarios] = useState<string[]>([]); // Lista de usuarios únicos
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // Usuario seleccionado

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
            await fetchUsuariosUnicos(area);

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


  const fetchUsuariosUnicos = async (userArea: string) => {
    try {
      const areaNormalizada = convertirTexto(userArea);
      console.log('El area normalizada es: ', areaNormalizada)
      const url = `https://desarrollotecnologicoar.com/api3/incidencias_area?area=${encodeURIComponent(areaNormalizada)}`;

      const response = await axios.get<Incidencia[]>(url);
      const incidencias = response.data;

      const nombresUnicos = Array.from(
        new Set(incidencias.map((i) => i.nombre_emisor as string))
      );

      setUsuarios(nombresUnicos);

    } catch (error) {
      console.error("Error al obtener los usuarios únicos:", error);
      message.error("Error al cargar los usuarios.");
    }
  };

  const handleFinish = (values: FormValues) => {
    if (values.fecha_permiso && dayjs.isDayjs(values.fecha_permiso)) {
      values.fecha_permiso = dayjs(values.fecha_permiso).format("YYYY-MM-DD");
    }

    console.log("Datos enviados a la API:", values);

    if (formProps.onFinish) {
      formProps.onFinish(values);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "20%" }}>Cargando datos del usuario...</div>;
  }

  return (
    <Create saveButtonProps={saveButtonProps}>
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
            options={usuarios.map((usuario) => ({
              value: usuario,
              label: usuario,
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
          <Select
            placeholder="Selecciona un jefe inmediato"
            options={jefesInmediatos}
          />
        </Form.Item>

        <Form.Item
          label="Tipo de registro"
          name="tipo_registro"
          rules={[{ required: true, message: "El campo Tipo de Registro es obligatorio" }]}
        >
          <Select
            options={[
              { value: "Permiso tiempo x tiempo controlado", label: "Permiso tiempo x tiempo controlado" },
              { value: "Llegada tarde no justificada", label: "Llegada tarde no justificada" },
              { value: "Permiso de llegada tarde por asuntos personales", label: "Permiso de llegada tarde por asuntos personales" },
              { value: "Permiso de llegada tarde por cita médica (IMSS)", label: "Permiso de llegada tarde por cita médica (IMSS)" },
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

        <Form.Item
          label="Confirme la emisión física del Acta Administrativa:"
          name="status_acta"
          initialValue="Favor de emitir"
          rules={[{ required: true, message: "El campo Status del Acta es obligatorio" }]}
        >
          <Select
            options={[
              { value: "Favor de emitir", label: "Favor de emitir" },
              { value: "Emitida y firmada", label: "Emitida y firmada" },
              { value: "Pendiente de envío", label: "Pendiente de envío" },
            ]}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
