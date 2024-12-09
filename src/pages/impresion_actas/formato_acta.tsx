import React, { useState, useEffect, act } from 'react';
import { useForm } from "@refinedev/antd";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useLocation } from "react-router-dom";
import { Form, Card, Avatar, Typography, Spin, message, List, Space, Select, DatePicker, Button, Row, Col } from "antd";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { jefesInmediatos } from '../incidencias';
import { opciones } from '../alta_usuarios/users_form';
import warning from 'antd/es/_util/warning';
import { cedeConfigurations } from './pdf_config';


// Declaramos el objeto para el prellenado del acta
type ActaValues = {
    cede: string;
    fecha: string;
    hora: string;
    asunto: string;
    lider_inmediato: string;
    area_lider: string;
    empleado: string;
    rol: string;
    fecha_suceso: string;
    info_registro: string;
    status_acta: string;
    area: string;
};

const initialActaValues: ActaValues = {
    cede: 'luis_molina',
    fecha: '',
    hora: '',
    asunto: '',
    lider_inmediato: '',
    area_lider: '',
    empleado: '',
    rol: '',
    fecha_suceso: '',
    info_registro: '',
    status_acta: '',
    area: '',
};

export const PDFEditor = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const formData = location.state || {};
    const [userData, setUserData] = useState<any>(null);
    const [areaUsers, setAreaUsers] = useState<any[]>([]);
    const [Cede, setCede] = useState("")

    const jefesInmediatosOptions = jefesInmediatos.map((jefe) => ({
        value: jefe.label, // El `label` completo será el `value` en este caso
        label: jefe.label,
    }));

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


    // Función para obtener los datos del usuario autenticado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const q = query(collection(db, "usuarios"), where("correo", "==", user.email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0].data();
                        setUserData(userDoc);

                        // Obtener usuarios por área
                        await fetchUsersByArea(userDoc.area);
                    } else {
                        message.error("No se encontró información del usuario.");
                    }
                } catch (error) {
                    console.error("Error al obtener datos del usuario:", error);
                    message.error("Error al cargar los datos del usuario.");
                }
            }
        });

        return () => unsubscribe();
    }, []);
    const fetchUsersByArea = async (area: string) => {
        try {
            const q = query(collection(db, "usuarios"), where("area", "==", area));
            const querySnapshot = await getDocs(q);

            const users = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setAreaUsers(users); // Actualiza el estado con los usuarios obtenidos
        } catch (error) {
            console.error("Error al obtener usuarios por área:", error);
            message.error("Error al cargar los usuarios del área.");
        }
    };


    const drawFields = async (pdfDoc: PDFDocument, actaValues: ActaValues, cede: string) => {
        const config = cedeConfigurations[cede];
        if (!config) {
            throw new Error(`No hay configuración definida para la cede: ${cede}`);
        }
    
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
        const fieldsToDraw = {
            fecha: actaValues.fecha.slice(0, 10),
            hora: actaValues.fecha.slice(10, 16),
            asunto: actaValues.asunto,
            lider_recortado: actaValues.lider_inmediato.includes('-')
                ? actaValues.lider_inmediato.slice(0, actaValues.lider_inmediato.indexOf('-'))
                : actaValues.lider_inmediato,
            caracter_recortado: actaValues.lider_inmediato.includes('-')
                ? actaValues.lider_inmediato.slice(actaValues.lider_inmediato.indexOf('-') + 1)
                : actaValues.lider_inmediato,
            empleado: actaValues.empleado,
            fecha_suceso: actaValues.fecha_suceso,
            area: actaValues.area,
        };
    
        Object.entries(fieldsToDraw).forEach(([field, value]) => {
            if (value && config[field]) {
                let { x, y, size = 10 } = config[field];
                if (value.length > 30){
                    size = 8;
                    value = value.slice(0, value.indexOf('/'))
                } if (value.length > 35){
                    size = 7;
                    value = value.slice(0, value.indexOf('/'))
                }
                firstPage.drawText(value, { x, y: firstPage.getHeight() - y, size, font: helveticaFont, color: rgb(0, 0, 0) });
            }
        });
    };


    useEffect(() => {
        const generatePdfPreview = async () => {
            const lider_recortado = actaValues.lider_inmediato.includes('-')
                ? actaValues.lider_inmediato.slice(0, actaValues.lider_inmediato.indexOf('-'))
                : actaValues.lider_inmediato; // Si no hay '-', usa toda la cadena

            const caracter_recortado = actaValues.lider_inmediato.includes('-')
                ? actaValues.lider_inmediato.slice(actaValues.lider_inmediato.indexOf('-') + 1, actaValues.lider_inmediato.length)
                : actaValues.lider_inmediato; // Si no hay '-', usa toda la cadena
                try {
                    const pdfPath = cede();
                    if (!pdfPath) {
                        throw new Error("Ruta de PDF no encontrada. Selecciona una cede válida.");
                    }
                    const existingPdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer());
                    const pdfDoc = await PDFDocument.load(existingPdfBytes);
                
                    // Dibujar los campos en el PDF
                    await drawFields(pdfDoc, actaValues, actaValues.cede);
                
                    // Generar el PDF modificado
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: "application/pdf" });
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                } catch (error) {
                    console.error("Error al generar el PDF:", error);
                }
        };

        generatePdfPreview();
    }, [actaValues]);

    const generarPDF = async () => {
        setIsLoading(true);
        const lider_recortado = actaValues.lider_inmediato.includes('-')
        ? actaValues.lider_inmediato.slice(0, actaValues.lider_inmediato.indexOf('-'))
        : actaValues.lider_inmediato; // Si no hay '-', usa toda la cadena

    const caracter_recortado = actaValues.lider_inmediato.includes('-')
        ? actaValues.lider_inmediato.slice(actaValues.lider_inmediato.indexOf('-') + 1, actaValues.lider_inmediato.length)
        : actaValues.lider_inmediato; // Si no hay '-', usa toda la cadena
        const pdfPath = cede();
        if (!pdfPath) {
            throw new Error("Ruta de PDF no encontrada. Selecciona una cede válida.");
        }
        try {
            const pdfPath = cede();
            if (!pdfPath) {
                throw new Error("Ruta de PDF no encontrada. Selecciona una cede válida.");
            }
            const existingPdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
            // Dibujar los campos en el PDF
            await drawFields(pdfDoc, actaValues, actaValues.cede);
        
            // Generar el PDF modificado
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
        }
    };

    const handleChange = (field: keyof ActaValues, value: any) => {
        setActaValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const cede = () =>{
        if (actaValues.cede === "luis_molina"){
            return "/acta_lm.pdf"
        } else if (actaValues.cede === "8_de_julio"){
            return "/acta_8julio.pdf"
        } else if (actaValues.cede === "españoles"){
            return "/acta_españoles.pdf"
        } else if (actaValues.cede === "cdmx"){
            return "/acta_cdmx.pdf"
        } else if (actaValues.cede === "mty"){
            return "/acta_mty.pdf"
        } else if (actaValues.cede === "ocotlan"){
            return "/acta_ocotlan.pdf"
        }
        return "/acta_lm.pdf"
    }

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     setActaValues({
    //         ...actaValues,
    //         [e.target.name]: e.target.value,
    //     });
    // };

    return (
        <Row gutter={16} style={{ padding: 24 }}>
            <Col span={12}>
                <Card title="GENERAR ACTA" bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", margin: "auto", textAlign: 'center' }} >
                    <h3>Llena los siguientes datos para imprimir el acta prellenada. (opcional)</h3>
                    <Form>
                    <Form.Item label='Selecciona la cede del acta: ' name='cede' initialValue={"luis_molina"}>
                            <Select options={[
                                { value: "luis_molina", label: "Luis Molina No. 2505 Col. Echeverría, Guadalajara Jal" },
                                { value: "8_de_julio", label: "Av. 8 de Julio 1626, Morelos Guadalajara Jal." },
                                { value: "españoles", label: "Españoles 91 la Duraznera, San Pedro Tlaquepaque Jal" },
                                { value: "cdmx", label: "Hacienda Escolástica #131, Hacienda del Rosario, Azcapotzalco CDMX" },
                                { value: "mty", label: "Vicente Suarez 962, Col. Obrera, Monterrey, N.L" },
                                { value: "ocotlan", label: "Noviembre 187 A, Col. Pedro Moreno, Ocotlan Jal" },
                            ]} onChange={(value) => handleChange("cede", value)} />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}
                        <Form.Item label='Ingresa la fecha y hora en que se levantará el acta:' name='fecha'>
                            <DatePicker style={{ width: "100%" }} showTime onChange={(date, dateString) => handleChange("fecha", dateString)} />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}
                        <Form.Item label='Ingresa el asunto relacionado al acta: ' name='asunto'>
                            <Select options={[
                                { value: "Mala actitud", label: "Reporte de actitud (irresponsabilidad, acciones negativas, daños, etc)." },
                                { value: "Permiso de llegada tarde", label: "Permiso de llegada tarde por asuntos personales." },
                                { value: "Permiso de inasistencia a cuenta de vacaciones.", label: "Permiso de inasistencia a cuenta de vacaciones." },
                                { value: "Permiso de salida temprano.", label: "Permiso de salida temprano." },
                                { value: "Llegada tarde no justificada.", label: "Llegada tarde no justificada." },
                                { value: "Permiso de llegada tarde por cita médica (IMSS).", label: "Permiso de llegada tarde por cita médica (IMSS)." },
                                { value: "Falta justificada de acuerdo al Reglamento Interior de Trabajo.", label: "Falta justificada de acuerdo al Reglamento Interior de Trabajo." },
                                { value: "Falta injustificada.", label: "Falta injustificada." },
                                { value: "Permiso tiempo x tiempo controlado", label: "Permiso tiempo x tiempo controlado" },
                                { value: "Falta por incapacidad del IMSS.", label: "Falta por incapacidad del IMSS." },
                                { value: "Permiso de inasistencia sin goce de sueldo.", label: "Permiso de inasistencia sin goce de sueldo." },
                            ]} onChange={(value) => handleChange("asunto", value)} />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}
                        <Form.Item label='Nombre del lider inmediato del afectado: ' name='lider_inmediato'>
                            <Select options={jefesInmediatosOptions} onChange={(label) => handleChange("lider_inmediato", label)} />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}
                        <Form.Item label='Selecciona a quién se le aplicará el acta: ' name='empleado'>
                            <Select placeholder="Selecciona un nombre" style={{ width: "100%", marginBottom: 16 }}
                                options={areaUsers.map((user) => ({
                                    value: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
                                    label: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
                                }))}
                                onChange={(value) => handleChange("empleado", value)}

                            />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}
                        <Form.Item label='Ingresa la fecha en la que ocurrió el inicidente:' name='fecha_suceso'>
                            <DatePicker style={{ width: "100%" }} onChange={(date, dateString) => handleChange("fecha_suceso", dateString)} />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}
                        <Form.Item label='Ingresa la fecha de lo ocurrido:' name='area'>
                            <Select 
                            options={opciones}
                            onChange={(value) => handleChange("area", value)} />
                        </Form.Item>
                        {/* --------------------------------------------------------------------------------------------------------------- */}


                    </Form>
                    <Button onClick={generarPDF}>Descargar PDF</Button>
                </Card>
            </Col>
            <Col span={12}>
                <Card title="Previsualización del PDF" bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", margin: "auto", textAlign: 'center' }} >
                    <div style={{ flex: 1 }}>
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
                </Card>

            </Col>
        </Row >
    );
};

export default PDFEditor;
