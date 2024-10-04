import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";  // Asegúrate de tener instalada esta librería para formatear las fechas

export const BlogPostCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    // Aquí puedes configurar si quieres manejar alguna lógica adicional
    // como predefinir valores o modificar el comportamiento del submit
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Persona Emisor"}
          name={["persona_emisor"]}
          rules={[
            {
              required: true,
              message: "El campo Persona Emisor es obligatorio",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Nombre Emisor"}
          name={["nombre_emisor"]}
          rules={[
            {
              required: true,
              message: "El campo Nombre Emisor es obligatorio",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Jefe Inmediato"}
          name={["jefe_inmediato"]}
          rules={[
            {
              required: true,
              message: "El campo Jefe Inmediato es obligatorio",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Tipo de Registro"}
          name={["tipo_registro"]}
          rules={[
            {
              required: true,
              message: "El campo Tipo de Registro es obligatorio",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"Fecha de Permiso"}
          name={["fecha_permiso"]}
          rules={[
            {
              required: true,
              message: "El campo Fecha de Permiso es obligatorio",
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label={"Información del Registro"}
          name="info_registro"
          rules={[
            {
              required: true,
              message: "El campo Información del Registro es obligatorio",
            },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={"Status del Acta"}
          name={["status_acta"]}
          initialValue={"Favor de emitir"}
          rules={[
            {
              required: true,
              message: "El campo Status del Acta es obligatorio",
            },
          ]}
        >
          <Select
            defaultValue={"Favor de emitir"}
            options={[
              { value: "Favor de emitir", label: "Favor de emitir" },
              { value: "Emitida y firmada", label: "Emitida y firmada" },
              { value: "Pendiente de envío", label: "Pendiente de envío" },
            ]}
            style={{ width: 200 }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
