import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table, Input, Row, Col } from "antd";
import { useState } from "react";
import { type BaseRecord } from "@refinedev/core";

export const BlogPostList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  // Estado para el término de búsqueda
  const [searchText, setSearchText] = useState("");

  // Función para manejar el cambio en el input de búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value.toLowerCase());
  };

  // Filtrar los datos en base al término de búsqueda
  const filteredData = tableProps?.dataSource?.filter((item: any) =>
    item.persona_emisor.toLowerCase().includes(searchText) ||
    item.nombre_emisor.toLowerCase().includes(searchText) ||
    item.tipo_registro.toLowerCase().includes(searchText)
  );

  return (
    <List>
      {/* Campo de búsqueda */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Buscar por Persona Emisor, Nombre o Tipo de Registro"
            value={searchText}
            onChange={handleSearch}
          />
        </Col>
      </Row>

      {/* Tabla con los datos filtrados */}
      <Table
        {...tableProps}
        dataSource={filteredData} // Pasar los datos filtrados
        rowKey="id"
      >
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="persona_emisor" title={"Persona Emisor"} />
        <Table.Column dataIndex="nombre_emisor" title={"Nombre Emisor"} />
        <Table.Column dataIndex="tipo_registro" title={"Tipo de Registro"} />
        <Table.Column
          dataIndex="info_registro"
          title={"Información de Registro"}
          render={(value: any) => {
            if (!value) return "-";
            return value.slice(0, 80) + "...";
          }}
        />
        <Table.Column dataIndex="status_acta" title={"Status del Acta"} />
        <Table.Column
          dataIndex={["marca_temporal"]}
          title={"Fecha de Creación"}
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title={"Acciones"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
