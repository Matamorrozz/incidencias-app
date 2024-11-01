import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";
import { get } from "http";

const { Title } = Typography;

export const BlogPostShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Favor de emitir":
        return "red";
      case "Emitida y firmada (enviada a RH)":
        return "yellow";
      case "Emitida y firmada (pendiente de enviarse a RH)":
        return "orange";
      case "Emitida y en espera de recabar firmas":
        return "green";
      default:
        return "white"; // Color por defecto si el status no coincide
    }
  };
  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID de la Incidencia:"}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{"Fecha en que se emitió la incidencia:"}</Title>
      <DateField value={record?.marca_temporal} />
      
      <Title level={5}>{"Persona que emitió la incidencia:"}</Title>
      <TextField value={record?.persona_emisor} />
      
      <Title level={5}>{"Persona a la cuál se le registró la incidencia:"}</Title>
      <TextField value={record?.nombre_emisor} />
      
      <Title level={5}>{"Jefe Inmediato:"}</Title>
      <TextField value={record?.jefe_inmediato} />
      
      <Title level={5}>{"Categoría de la incidencia:"}</Title>
      <TextField value={record?.tipo_registro} />
      
      <Title level={5}>{"Fecha en qué se pidió el permiso:"}</Title>
      <DateField value={record?.fecha_permiso} />
      
      <Title level={5}>{"Comentarios adicionales del registro:"}</Title>
      <TextField value={record?.info_registro} />
      
      <Title level={5}>{"Status actual del acta:"}</Title>
      <TextField value={record?.status_acta} style={{color: getStatusColor(record?.status_acta)}} />
    
    </Show>
  );
};