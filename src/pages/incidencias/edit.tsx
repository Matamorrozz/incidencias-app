import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { values } from "pdf-lib";

export const BlogPostEdit = () => {
  const { formProps, saveButtonProps, queryResult, formLoading } = useForm({});

  const blogPostsData = queryResult?.data?.data;

  const handleFormSubmit = (values: any) => {
    console.log("Formulario enviado con los valores:", values);
    // Puedes realizar otras acciones aquí en lugar de enviar a la API
  };

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical" onFinish={(values) => handleFormSubmit(values)}>
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
        <Form.Item
          label={"Área"}
          name={["area"]}
          rules={[
            {
              required: true,
              message: "El campo Área es obligatorio",
            },
          ]}
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
    </Edit>
  );
};
