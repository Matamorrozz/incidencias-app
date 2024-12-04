import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const PDFEditor = () => {
  const [isLoading, setIsLoading] = useState(false);

  const factura = {
    numero: '12345',
    producto: 'Pizza',
    cantidad: 5,
    precio: 20,
    fecha: '2023-09-11',
    cliente: 'Angelo',
    total: 100.0,
  };

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


      // Paso 4: Serializar el PDF modificado a bytes
      const pdfBytes = await pdfDoc.save();

      // Paso 5: Crear un blob y descargar el PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Factura_${factura.numero}.pdf`;
      link.click();

      setIsLoading(false);
    } catch (error) {
      console.error('Error al generar el PDF', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>GENERAR ACTA</h1>
      <h3>Llena los siguientes datos para imprimir el acta pre llenada. (opcional)</h3>

      <button onClick={generarPDF} disabled={isLoading}>
        {isLoading ? 'Generando PDF...' : 'Generar PDF'}
      </button>
    </div>
  );
};

export default PDFEditor;
