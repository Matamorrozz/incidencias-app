import React, { useState } from 'react';
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBIcon, MDBInput } from 'mdb-react-ui-kit';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './Login.css';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>(''); 
  const [password, setPassword] = useState<string>(''); 

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    setError(null); 
    try {
      await signInWithPopup(auth, googleProvider); 
    } catch (err: any) {
      setError(err.message); 
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("Email:", email, "Password:", password);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message); 
    }
  };

  return (
    <MDBContainer fluid className='background-radial-gradient overflow-hidden d-flex justify-content-center align-items-center vh-100'>
      <MDBRow className='w-100 align-items-center justify-content-center'>
        <MDBCol className='d-flex justify-content-center'>
          <img src="/ar_logo.png" alt="Logo" style={{ maxWidth: '25%', height: 'auto' }} />
        </MDBCol>

        <MDBCol md='6' className='d-flex flex-column justify-content-center align-items-start'>
          <h1 className="my-3 display-4 fw-bold text-start" style={{ color: 'hsl(218, 81%, 95%)' }}>
            INCIDENCIAS AR
          </h1>
        </MDBCol>

        <MDBCol md='6' className='d-flex flex-column justify-content-center align-items-start' style={{ textAlign: "justify" }}>
          <p className='text-start' style={{ color: 'hsl(218, 81%, 85%)', maxWidth: '400px' }}>
            Sistema de gestión de incidencias que te ayuda a organizar y seguir el progreso de tus reportes de manera eficiente y sencilla.
          </p>
        </MDBCol>

        <MDBCol md='6' className='d-flex flex-column justify-content-center align-items-start' style={{ textAlign: "justify" }}>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {/* Formulario alineado verticalmente */}
          <form onSubmit={handleEmailPasswordLogin} className="w-100 d-flex flex-column align-items-center">
            <MDBInput
              label='Correo Electrónico'
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mb-3'
              style={{ maxWidth: '300px', color: 'black' }}
            />

            <MDBInput
              label='Contraseña'
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mb-4'
              style={{ maxWidth: '300px', color: 'black' }}
            />

            <MDBBtn
              type="submit"
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                padding: '10px 40px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                width: '100%',
                maxWidth: '300px',
                height: '50px',
                marginBottom: '10px'
              }}
              className="d-flex align-items-center justify-content-center"
            >
              Iniciar Sesión
            </MDBBtn>
          </form>
          </MDBCol>
          <MDBCol md='6' className='d-flex flex-column justify-content-center align-items-start' style={{ textAlign: "justify" }}>
          <MDBBtn
            onClick={handleGoogleLogin}
            style={{
              backgroundColor: '#4285F4',
              color: 'white',
              padding: '10px 40px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '300px',
              height: '50px'
            }}
            className="d-flex align-items-center justify-content-center"
          >
            <MDBIcon fab icon='google' size="lg" className="me-2" /> Iniciar con Google
          </MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Login;
