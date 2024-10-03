import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebaseConfig"; // Asegúrate de tener este archivo configurado correctamente

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Proveedor de Google
  const googleProvider = new GoogleAuthProvider();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Limpia el error previo
    try {
      // Inicia sesión con Firebase Authentication usando email y contraseña
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message); // Captura y muestra cualquier error
    }
  };

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
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Botón para iniciar sesión con Google */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleGoogleLogin}>Login with Google</button>
      </div>
    </div>
  );
};

export default Login;
