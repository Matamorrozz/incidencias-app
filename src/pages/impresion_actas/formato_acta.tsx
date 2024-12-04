import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useLocation } from "react-router-dom";

// Declaramos el objeto para el prellenado del acta
type ActaValues = {
  fecha: string;
  asunto: string;
  empleado: string;
  rol: string;
  fecha_permiso: string;
  info_registro: string;
  status_acta: string;
  area: string;
};

const initialActaValues: ActaValues = {
  fecha: '',
  asunto: '',
  empleado: '',
  rol: '',
  fecha_permiso: '',
  info_registro: '',
  status_acta: '',
  area: '',
};

export const PDFEditor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const formData = location.state || {};

  // Inicializar actaValues con los datos recibidos
  const [actaValues, setActaValues] = useState<ActaValues>({
    ...initialActaValues,
    ...formData,
    fecha_permiso: formData.fecha_permiso || '',
    info_registro: formData.info_registro || '',
    area: formData.area || '',
    empleado: formData.nombre_emisor || '',
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setActaValues({
      ...actaValues,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const generatePdfPreview = async () => {
      try {
        // Paso 1: Cargar el PDF existente
        const existingPdfBytes = await fetch('/acta.pdf').then((res) =>
          res.arrayBuffer()
        );

        // Paso 2: Cargar el PDF en pdf-lib
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Paso 3: Modificar el PDF
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Embeder una fuente
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Agregar texto al PDF
        const { width, height } = firstPage.getSize();

        // Solo agregar texto si el campo no está vacío
        if (actaValues.fecha) {
          firstPage.drawText(`${actaValues.fecha}`, {
            x: 320,
            y: height - 117,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
        if (actaValues.asunto) {
          firstPage.drawText(`Asunto: ${actaValues.asunto}`, {
            x: 50,
            y: height - 120,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
        if (actaValues.empleado) {
          firstPage.drawText(`Empleado: ${actaValues.empleado}`, {
            x: 50,
            y: height - 140,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
        if (actaValues.area) {
          firstPage.drawText(`Área: ${actaValues.area}`, {
            x: 50,
            y: height - 160,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
        // Agrega el resto de campos de manera similar...

        // Paso 4: Serializar el PDF modificado a bytes
        const pdfBytes = await pdfDoc.save();

        // Paso 5: Crear una URL para mostrar el PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error al generar la previsualización del PDF', error);
      }
    };

    generatePdfPreview();
  }, [actaValues]);

  const generarPDF = async () => {
    setIsLoading(true);
    try {
      // Paso 1: Cargar el PDF existente
      const existingPdfBytes = await fetch('/acta.pdf').then((res) =>
        res.arrayBuffer()
      );

      // Paso 2: Cargar el PDF en pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Paso 3: Modificar el PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Embeder una fuente
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Agregar texto al PDF
      const { width, height } = firstPage.getSize();

      // Solo agregar texto si el campo no está vacío
      if (actaValues.fecha) {
        firstPage.drawText(`${actaValues.fecha}`, {
          x: 320,
          y: height - 117,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
      if (actaValues.asunto) {
        firstPage.drawText(`Asunto: ${actaValues.asunto}`, {
          x: 50,
          y: height - 120,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
      if (actaValues.empleado) {
        firstPage.drawText(`Empleado: ${actaValues.empleado}`, {
          x: 50,
          y: height - 140,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
      if (actaValues.area) {
        firstPage.drawText(`Área: ${actaValues.area}`, {
          x: 50,
          y: height - 160,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
      // Agrega el resto de campos...

      // Paso 4: Serializar el PDF modificado a bytes
      const pdfBytes = await pdfDoc.save();

      // Descargar el PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Acta_${actaValues.fecha || 'sin_fecha'}.pdf`;
      link.click();

      setIsLoading(false);
    } catch (error) {
      console.error('Error al generar el PDF', error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', padding: 24 }}>
      {/* Formulario */}
      <div style={{ flex: 1, marginRight: 20 }}>
        <h1>GENERAR ACTA</h1>
        <h3>Llena los siguientes datos para imprimir el acta pre llenada. (opcional)</h3>
        <form>
          <div>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={actaValues.fecha}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Asunto:</label>
            <input
              type="text"
              name="asunto"
              value={actaValues.asunto}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Empleado:</label>
            <input
              type="text"
              name="empleado"
              value={actaValues.empleado}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Rol:</label>
            <input
              type="text"
              name="rol"
              value={actaValues.rol}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Fecha de permiso:</label>
            <input
              type="date"
              name="fecha_permiso"
              value={actaValues.fecha_permiso}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Información de registro:</label>
            <textarea
              name="info_registro"
              value={actaValues.info_registro}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div>
            <label>Status del acta:</label>
            <input
              type="text"
              name="status_acta"
              value={actaValues.status_acta}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Área:</label>
            <input
              type="text"
              name="area"
              value={actaValues.area}
              onChange={handleInputChange}
            />
          </div>
          <button type="button" onClick={generarPDF} disabled={isLoading}>
            {isLoading ? 'Generando PDF...' : 'Generar PDF'}
          </button>
        </form>
      </div>

      {/* Previsualización del PDF */}
      <div style={{ flex: 1 }}>
        <h3>Previsualización del PDF</h3>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            title="Previsualización del PDF"
          ></iframe>
        ) : (
          <p>No hay previsualización disponible.</p>
        )}
      </div>
    </div>
  );
};

export default PDFEditor;
