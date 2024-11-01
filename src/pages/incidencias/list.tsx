import React, { useState, useEffect, useCallback } from "react";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table, Input, Row, Col, Spin, message, Pagination } from "antd";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { usuariosPermitidos } from "../../user_config"; 
import { BaseRecord } from "@refinedev/core";

export const BlogPostList = () => {
  const { tableProps } = useTable({ syncWithLocation: true });

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userArea, setUserArea] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<BaseRecord[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [pageSize] = useState(5); // Tamaño de la página

  const convertirTexto = (texto: string): string =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_");

  const filtrarDatos = useCallback(
    (area: string | null, data: BaseRecord[]) => {
      const dataMutable = [...data];

      if (usuariosPermitidos.includes(userEmail || "")) {
        setFilteredData(dataMutable);
      } else {
        const areaFiltrada = convertirTexto(area || "");
        const datosFiltrados = dataMutable.filter(
          (incidencia: any) => convertirTexto(incidencia.area) === areaFiltrada
        );
        setFilteredData(datosFiltrados);
      }
    },
    [userEmail]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          const q = query(collection(db, "usuarios"), where("correo", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            const area = convertirTexto(userDoc.area);
            setUserArea(area);

            filtrarDatos(area, tableProps.dataSource ? [...tableProps.dataSource] : []);
          } else {
            message.error("No se encontró información del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          message.error("Error al cargar los datos del usuario.");
        }
      } else {
        message.error("Usuario no autenticado.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filtrarDatos, tableProps.dataSource]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value.toLowerCase());
  };

  const searchedData = filteredData.filter((item: any) =>
    item.persona_emisor.toLowerCase().includes(searchText) ||
    item.nombre_emisor.toLowerCase().includes(searchText) ||
    item.tipo_registro.toLowerCase().includes(searchText)
  );

  // Datos paginados según el estado `currentPage`
  const paginatedData = searchedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page); // Actualizar la página actual
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  }

  if (paginatedData.length === 0) {
    return <div>No se encontraron registros.</div>;
  }

  return (
    <List>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Buscar por Persona Emisor, Nombre o Tipo de Registro"
            value={searchText}
            onChange={handleSearch}
          />
        </Col>
      </Row>

      <Table
        dataSource={paginatedData} 
        rowKey="id"
        pagination={false}
        scroll={{ x: 800, y: 300 }}
      >
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="persona_emisor" title="Persona Emisor" />
        <Table.Column dataIndex="nombre_emisor" title="Nombre Emisor" />
        <Table.Column dataIndex="tipo_registro" title="Tipo de Registro" />
        <Table.Column
          dataIndex="info_registro"
          title="Información de Registro"
          render={(value: any) => (value ? `${value.slice(0, 80)}...` : "-")}
        />
        <Table.Column dataIndex="status_acta" title="Status del Acta" />
        <Table.Column
          dataIndex="marca_temporal"
          title="Fecha de Creación"
          render={(value: any) => <DateField value={value} format="DD/MM/YYYY" />}
        />
        <Table.Column
          title="Acciones"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>

      {/* Paginación controlada manualmente */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={searchedData.length}
        onChange={handlePageChange}
        style={{ marginTop: 16, textAlign: "right" }}
      />
    </List>
  );
};
