import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { FormInstance } from "antd"; 
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Importa tu configuración de Firebase

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

export const BlogPostCreate = () => {
  const { formProps, saveButtonProps, form } = useForm<FormValues>();
  const [userData, setUserData] = useState<{ nombreCompleto: string } | null>(null);

  // Obtener el nombre completo del usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const correo = user.email;
          const q = query(collection(db, "usuarios"), where("correo", "==", correo));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            const nombreCompleto = `${userDoc.nombre} ${userDoc.apellido_paterno} ${userDoc.apellido_materno}`;
            setUserData({ nombreCompleto });

            // Autocompletar el campo `persona_emisor`
            form.setFieldsValue({
              persona_emisor: nombreCompleto,
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

  const handleFinish = (values: FormValues) => {
    if (values.fecha_permiso && dayjs.isDayjs(values.fecha_permiso)) {
      values.fecha_permiso = dayjs(values.fecha_permiso).format("YYYY-MM-DD");
    }

    console.log("Datos enviados a la API:", values);

    if (formProps.onFinish) {
      formProps.onFinish(values);
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
          <Input />
        </Form.Item>

        <Form.Item
          label="Área"
          name="area"
          rules={[{ required: true, message: "El campo Área es obligatorio" }]}
        >
          <Select
            options={[
              { value: "Desarrollo Tecnológico", label: "Desarrollo Tecnológico" },
              { value: "Logística", label: "Logística" },
              { value: "Producción", label: "Producción" },
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
            ]}
            style={{ width: 1050 }}
          />
        </Form.Item>

        <Form.Item
          label="Jefe inmediato del empleado"
          name="jefe_inmediato"
          rules={[{ required: true, message: "El campo Jefe Inmediato es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        {/* Campo `tipo_registro` como `Select` */}
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
              { value: "Permiso de salida temprano", label: "Permiso de salida temprano" },
              { value: "Permiso de inasistencia sin goce de sueldo", label: "Permiso de inasistencia sin goce de sueldo" },
              { value: "Permiso de inasistencia a cuenta de vacaciones", label: "Permiso de inasistencia a cuenta de vacaciones" },
              { value: "Falta por incapacidad del IMSS", label: "Falta por incapacidad del IMSS" },
              { value: "Falta injustificada", label: "Falta injustificada" },
              { value: "Permiso sin goce de sueldo", label: "Permiso sin goce de sueldo" },
              { value: "Permiso de inasistencia", label: "Permiso de inasistencia" },
              { value: "Reporte de actitud (irresponsabilidad, acciones negativas, daños, etc)", label: "Reporte de actitud (irresponsabilidad, acciones negativas, daños, etc)" },
              { value: "Permiso de llegada tarde (no se presentó)", label: "Permiso de llegada tarde (no se presentó)" },
              { value: "Falta justificada de acuerdo al Reglamento Interior de Trabajo", label: "Falta justificada de acuerdo al Reglamento Interior de Trabajo" },
              { value: "Permiso para faltar toda la semana", label: "Permiso para faltar toda la semana" },
              { value: "Permiso de salida temprano", label: "Permiso de salida temprano" },
              { value: "Permiso Inasistencia sin goce de sueldo", label: "Permiso Inasistencia sin goce de sueldo" },
              { value: "Suspensión por faltas o retardos", label: "Suspensión por faltas o retardos" },
              { value: "Home Office", label: "Home Office" },
            ]}
            style={{ width: 1050 }}
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
            defaultValue="Favor de emitir"
            options={[
              { value: "Favor de emitir", label: "Favor de emitir" },
              { value: "Emitida y firmada", label: "Emitida y firmada" },
              { value: "Pendiente de envío", label: "Pendiente de envío" },
            ]}
            style={{ width: 1050 }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
