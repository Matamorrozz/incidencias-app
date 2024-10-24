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
    <MDBContainer fluid className='background-radial-gradient overflow-hidden vh-100 d-flex justify-content-center align-items-center'>
      {/* Contenedor del formulario con tamaño uniforme */}
      <div 
        className="p-5 rounded-3 shadow-lg"
        style={{
          maxWidth: '500px',  // Ancho máximo del contenedor
        
        }}
      >
        <div className="text-center mb-4">
          <img 
            src="/ar_logo.png" 
            alt="Logo" 
            style={{ width: '80px', marginBottom: '10px' }} 
          />
          <h1 className="display-6 fw-bold" style={{ color: 'hsl(218, 81%, 95%)' }}>
            INCIDENCIAS AR
          </h1>
          <p style={{ color: 'hsl(218, 81%, 85%)' }}>
            Sistema de gestión de incidencias que te ayuda a organizar y seguir el progreso de tus reportes de manera eficiente y sencilla.
          </p>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleEmailPasswordLogin} className="d-flex flex-column gap-3">
          <p>Correo Electrónico</p>
          <MDBInput
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%' , borderRadius: '10px'}}
          />

           <p>Contraseña</p>
          <MDBInput
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' , borderRadius: '10px'}}
          />

          {/* Botones alineados en una fila horizontal */}
          <br></br>
          <div className="d-flex justify-content-between gap-2">
            <MDBBtn
              type="submit"
              className="w-100"
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                padding: '10px 0',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                height: '50px',
              }}
            >
              Iniciar Sesión
            </MDBBtn>
<br></br>
            <MDBBtn
              onClick={handleGoogleLogin}
              className="w-100"
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
                padding: '10px 0',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                height: '50px'
              }}
            >
              <MDBIcon fab icon='google' size="lg" className="me-2" /> Google
            </MDBBtn>
          </div>
        </form>
      </div>
    </MDBContainer>
  );
};

export default Login;
