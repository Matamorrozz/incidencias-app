import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import { FormInstance } from "antd";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";


type FormValues = {
  nombre_completo: string;
  correo: string;
  jefe_inmediato: string;
  area: string;
  tipo_permiso: string;
  urgencia: boolean;
  comentarios: string;
  status: string;
};

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



export const CreatePermit = () => {
  const { formProps, saveButtonProps, form } = useForm<FormValues>();
  const [userData, setUserData] = useState<Partial<FormValues>>({});

  const [loading, setLoading] = useState(false); // Estado para deshabilitar el botón de envío
  const isSubmitting = useRef(false); // Flag para evitar múltiples envíos
  const [user, setUser] = useState('')
  
  const convertirTexto = (texto: string): string => {
    return texto
      .normalize("NFD")                    // Descompone caracteres Unicode (Ej: á -> a + ́)
      .replace(/[\u0300-\u036f]/g, "")     // Elimina los diacríticos (acentos)
      .toLowerCase()                       // Convierte a minúsculas
      .replace(/\s+/g, '_');               // Reemplaza espacios por guiones bajos
  };
  
  // Escucha los cambios de autenticación y busca los datos del usuario en Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const correo = user.email;
          const q = query(
            collection(db, "usuarios"),
            where("correo", "==", correo)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setUserData(userDoc);
            const nombreCompleto = `${userDoc.nombre} ${userDoc.apellido_paterno} ${userDoc.apellido_materno}`;

            form.setFieldsValue({
              nombre_completo: nombreCompleto,
              correo: userDoc.correo,
              jefe_inmediato: userDoc.jefe_inmediato,
              area: convertirTexto(userDoc.area),
            });
          } else {
            message.error("No se encontró información del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          message.error("Hubo un error al cargar los datos del usuario.");
        }
      }
    });

    return () => unsubscribe();
  }, [form]);


  const handleFinish = async (values: FormValues) => {
    if (isSubmitting.current) return; // Evitar múltiples envíos
    isSubmitting.current = true; // Establecer flag de envío

    try {
      setLoading(true); // Mostrar estado de carga en el botón


      // Establecer el status como "Pendiente"
      const dataToSend = { ...values, status: "Pendiente" };

      console.log("Datos enviados al servidor:", dataToSend);

      const response = await fetch(
        "https://www.desarrollotecnologicoar.com/api3/crear_permiso",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.ok) {
        message.success("Permiso registrado con éxito");
        form.resetFields();
        
      } else {
        const errorData = await response.json();
        message.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      message.error("Hubo un error al registrar el permiso.");
    } finally {
      setLoading(false); // Restaurar el estado de carga
      isSubmitting.current = false; // Reiniciar el flag de envío
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form<FormValues>
        {...formProps}
        form={form as unknown as FormInstance<FormValues>}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Nombre Completo"
          name="nombre_completo"
          rules={[{ required: true, message: "El campo Nombre Completo es obligatorio" }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Correo"
          name="correo"
          rules={[{ required: true, message: "El campo Correo es obligatorio" }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Jefe Inmediato del empleado"
          name="jefe_inmediato"
          rules={[{ required: true, message: "El campo Jefe Inmediato es obligatorio" }]}
        >
          <Select
            placeholder="Selecciona un jefe inmediato"
            options={jefesInmediatos}
          />
        </Form.Item>

        <Form.Item
          label="Área"
          name="area"
          rules={[{ required: true, message: "El campo Área es obligatorio" }]}
        >
          <Select disabled options={[
            { value: "RRHH", label: "Recursos Humanos" },
            { value: "IT", label: "Tecnología de la Información" },
            { value: "Finanzas", label: "Finanzas" },
          ]} />
        </Form.Item>

        <Form.Item
          label="Tipo de Permiso"
          name="tipo_permiso"
          rules={[{ required: true, message: "El campo Tipo de Permiso es obligatorio" }]}
        >
          <Select options={[
            { value: "Permiso de llegada tarde", label: "Permiso de llegada tarde" },
            { value: "Permiso de salida temprano", label: "Permiso de salida temprano" },
            { value: "Permiso de inasistencia ", label: "Día Personal / Inasistencia a toma de vacaciones" },
            { value: "Trabajo Remoto", label: "Trabajo Remoto" },
            { value: "Permiso de inasistencia por salud", label: "Permiso de inasistencia por cuestiones de salud" },
          ]} />
        </Form.Item>

        <Form.Item
          label="Urgencia"
          name="urgencia"
          rules={[{ required: true, message: "Selecciona si es urgente o no" }]}
        >
          <Select options={[
            { value: true, label: "Urgente" },
            { value: false, label: "No Urgente" },
          ]} />
        </Form.Item>

        <Form.Item
          label="Comentarios"
          name="comentarios"
          rules={[{ required: true, message: "El campo Comentarios es obligatorio" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Fecha de Permiso"
          name="fecha_permiso"
          rules={[{ required: true, message: "El campo Fecha de Permiso es obligatorio" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} {...saveButtonProps}>
            Enviar
          </Button>
        </Form.Item>
      </Form>
    </Create>
  );
};
