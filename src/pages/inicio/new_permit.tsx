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
  correo_lider: string;
};

const jefesInmediatos = [
  { value: "Luis Jaime Martínez Arredondo", label: "Luis Jaime Martínez Arredondo - Operaciones" },
  { value: "Carlos Antonio Rivas Martínez", label: "Carlos Antonio Rivas Martínez - Soporte Técnico Call Center / NPI" },
  { value: "Ana Rosa Lira Ortíz", label: "Ana Rosa Lira Ortíz - Logística" },
  { value: "Armando de la Rosa García", label: "Armando de la Rosa García - Jefe de Desarrollo Tecnológico  " },
  { value: "Citlali Coseth De León", label: "Citlali Coseth De León - Jefe de Producción Láser" },
  { value: "Ma. del Refugio Arroyo", label: "Ma. del Refugio Arroyo - Gerente Contabilidad, Finanza y RRHH" },
  { value: "Tulio Alberto Martinez Medina", label: "Tulio Alberto Martinez Medina - Soporte Técnico Presencial" },
  { value: "Laura Beatriz Arroyo Salcedo", label: "Laura Beatriz Arroyo Salcedo - Jefe de Contabilidad" },
  { value: "Esteban Ramírez", label: "Esteban Ramírez - Gerente General" },
  { value: "Karen Ibarra Ramírez", label: "Karen Ibarra Ramírez - Encargada Ventas de Refacciones y Servicios" },
  { value: "Ana Sánchez Murúa", label: "Ana Sánchez Murúa - Generalista RRHH" },
  { value: "Esmeralda Ramírez Díaz", label: "Esmeralda Ramírez Díaz - Jefe de Crédito y Cobranza" },
  { value: "Lucero Ávila Cortes", label: "Lucero Ávila Cortes - Gerente de Mercadotecnia" },
  { value: "Alonso Saúl Sandoval López", label: "Alonso Saúl Sandoval López - Supervisor de Producción" },
  { value: "Sergio Alejandro García Trejo", label: "Sergio Alejandro García Trejo - Jefe de Procesos y Calidad" },

  { value: "Jaime Daniel Flores Hernández", label: "Jaime Daniel Flores Hernández - Supervisor de Calidad" },
  { value: "Jorge Antonio Lías Lopez", label: "Jorge Antonio Lías Lopez - Analista de Seguridad e Higiene / Mantenimiento" },
  { value: "Pablo Ramírez Diaque", label: "Pablo Ramírez Diaque - Gerente de Ingeniería" },
  { value: "Christian Mendoza Nepomuceno", label: "Christian Mendoza Nepomuceno - Jefe de Almacén" },
  { value: "Gustavo Gallegos Cortés", label: "Gustavo Gallegos Cortés - Subjefe de Soporte Técnico Presencial / Encargado de Sucursal CDMX" },
  { value: "Saúl Espinoza Silva", label: "Saúl Espinoza Silva - Encargado de Logística Internacional" },
  { value: "Jared Guerra García", label: "Jared Guerra García - Jefe de Reparaciones" },
];

const CorreosLideres = [
  { value: 'luis.martinez@asiarobotica.com', label: "Luis Jaime Martínez Arredondo"},
  { value: "carlos.rivas@asiarobotica.com", label: "Carlos Antonio Rivas Martínez"},
  { value: "ana.lira@asiarobotica.com", label: "Ana Rosa Lira Ortíz"},
  { value: 'armando.delarosa@asiarobotica.com', label: "Armando de la Rosa García"},
  { value: 'citlali.coseth@asiarobotica.com', label: "Citlali Coseth De León"},
  { value: 'marada@asiarobotica.com', label: "Ma. del Refugio Arroyo"},       
  { value: "laura.arroyo@asiarobotica.com", label: "Laura Beatriz Arroyo Salcedo"},
  { value: 'esteban@asiarobotica.com', label: "Esteban Ramírez"},
  { value: "karen@asiarobotica.com", label: "Karen Ibarra Ramírez"},
  { value: "lucero.avila@asiarobotica.com", label: "Lucero Ávila Cortes"},
  { value: 'ana.sanchez@asiarobotica.com', label: "Ana Sánchez Murúa"},
  { value: "esmeralda.ramirez@asiarobotica.com", label: "Esmeralda Ramírez Díaz"},
  { value: "saul.sandoval@asiarobotica.com", label: "Alonso Saúl Sandoval López"},
  { value: "sergio.garcia@asiarobotica.com", label: "Sergio Alejandro García Trejo"},
  { value: "jaime.flores@asiarobotica.com", label: "Jaime Daniel Flores Hernández"},
  { value: "Jorge Antonio Lías Lopez", label: "Jorge Antonio Lías Lopez"},
  { value: "pablo@asiarobotica.com", label: "Pablo Ramírez Diaque"},
  { value: "christian.mendoza@asiarobotica.com", label: "Christian Mendoza Nepomuceno"},
  { value: "gustavo.gallegos@asiarobotica.com", label: "Gustavo Gallegos Cortés"},
  { value: "saul.espinoza@asiarobotica.com", label: "Saúl Espinoza Silva"},
  { value: "Tulio Alberto Martinez Medina", label: "Tulio Alberto Martinez Medina" },
  {value: 'jared.guerra@asiarobotica.com', label: "Jared Guerra García"}
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

      const correo_lider = CorreosLideres.find((lider) => lider.label === values.jefe_inmediato)?.value;


      // Establecer el status como "Pendiente"
      const dataToSend = { ...values, status: "Pendiente", correo_lider: correo_lider };

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
            { value: "Permiso para cambio de horario temporal", label: "Permiso para cambio de horario temporal" }
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
