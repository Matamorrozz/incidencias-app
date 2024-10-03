import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const BlogPostShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>{"Persona Emisor"}</Title>
      <TextField value={record?.persona_emisor} />
      
      <Title level={5}>{"Nombre Emisor"}</Title>
      <TextField value={record?.nombre_emisor} />
      
      <Title level={5}>{"Jefe Inmediato"}</Title>
      <TextField value={record?.jefe_inmediato} />
      
      <Title level={5}>{"Tipo de Registro"}</Title>
      <TextField value={record?.tipo_registro} />
      
      <Title level={5}>{"Fecha de Permiso"}</Title>
      <DateField value={record?.fecha_permiso} />
      
      <Title level={5}>{"Información del Registro"}</Title>
      <TextField value={record?.info_registro} />
      
      <Title level={5}>{"Status del Acta"}</Title>
      <TextField value={record?.status_acta} />
      
      <Title level={5}>{"Marca Temporal"}</Title>
      <DateField value={record?.marca_temporal} />
    </Show>
  );
};
