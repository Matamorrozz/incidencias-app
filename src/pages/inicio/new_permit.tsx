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
          label="Jefe Inmediato"
          name="jefe_inmediato"
          rules={[{ required: true, message: "El campo Jefe Inmediato es obligatorio" }]}
        >
          <Input />
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
            { value: "Vacaciones", label: "Vacaciones" },
            { value: "Permiso Médico", label: "Permiso Médico" },
            { value: "Día Personal", label: "Día Personal" },
            { value: "Trabajo Remoto", label: "Trabajo Remoto" },
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
