import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { FormInstance } from "antd";  // Asegúrate de importar FormInstance

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

export const personaEmiteCreate  = () => {
  // Aseguramos que el hook useForm esté tipado correctamente
  const { formProps, saveButtonProps, form } = useForm<FormValues>();

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
        form={form as unknown as FormInstance<FormValues>}  // Vinculamos el FormInstance a los tipos correctos
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Persona Emisor"
          name="persona_emisor"
          rules={[{ required: true, message: "El campo Persona Emisor es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nombre Emisor"
          name="nombre_emisor"
          rules={[{ required: true, message: "El campo Nombre Emisor es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Jefe Inmediato"
          name="jefe_inmediato"
          rules={[{ required: true, message: "El campo Jefe Inmediato es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Tipo de Registro"
          name="tipo_registro"
          rules={[{ required: true, message: "El campo Tipo de Registro es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Fecha de Permiso"
          name="fecha_permiso"
          rules={[{ required: true, message: "El campo Fecha de Permiso es obligatorio" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Información del Registro"
          name="info_registro"
          rules={[{ required: true, message: "El campo Información del Registro es obligatorio" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Status del Acta"
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
            style={{ width: 200 }}
          />
        </Form.Item>

        <Form.Item
          label="Área"
          name="area"
          rules={[{ required: true, message: "El campo Área es obligatorio" }]}
        >
          <Select
            options={[
              { value: "RRHH", label: "Recursos Humanos" },
              { value: "IT", label: "Tecnología de la Información" },
              { value: "Finanzas", label: "Finanzas" },
            ]}
            style={{ width: 200 }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
