import React, { useState } from 'react';
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Asegúrate de que este archivo esté correctamente configurado
import './Login.css'; // Asegúrate de que el path es correcto

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  // Proveedor de Google
  const googleProvider = new GoogleAuthProvider();

  // Iniciar sesión con Google
  const handleGoogleLogin = async () => {
    setError(null); // Limpia el error previo
    try {
      // Inicia sesión con Firebase usando Google
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message); // Captura y muestra cualquier error
    }
  };

  return (
    <MDBContainer fluid className='background-radial-gradient overflow-hidden d-flex justify-content-center align-items-center vh-100'>
      {/* Logo en la parte superior */}


      <MDBRow className='w-100 align-items-center justify-content-center'>
        <MDBCol className='d-flex justify-content-center'>
          {/* Logo cargado desde public */}
          <img src="/ar_logo.png" alt="Logo" style={{ maxWidth: '25%', height: 'auto' }} />
        </MDBCol>
        <br />

        <MDBCol md='6' className='d-flex flex-column justify-content-center align-items-start'>
          <h1 className="my-3 display-4 fw-bold text-start" style={{ color: 'hsl(218, 81%, 95%)' }}>
            INCIDENCIAS AR
          </h1>
        </MDBCol>

        <MDBCol md='6' className='d-flex flex-column justify-content-center align-items-start' style={{textAlign: "justify"}}>
          <p className='text-start' style={{ color: 'hsl(218, 81%, 85%)', maxWidth: '400px' }}>
            Sistema de gestión de incidencias que te ayuda a organizar y seguir el progreso de tus reportes de manera eficiente y sencilla.
          </p>
        </MDBCol>
        <br />

        {/* Columna para el botón */}
        <MDBCol md='4' className='d-flex justify-content-center'>
          {/* Mostrar errores si los hay */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          <MDBBtn
            onClick={handleGoogleLogin}
            style={{
              backgroundColor: '#4285F4',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
            className="d-flex align-items-center"
          >
            <MDBIcon fab icon='google' size="lg" className="me-2" /> Iniciar con Google
          </MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Login;
