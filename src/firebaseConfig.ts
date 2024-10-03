// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Importa el módulo de autenticación
import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDArlaidbMgHfMvy4U6HcaNS3B9j59pN60",
  authDomain: "incidencias-a781e.firebaseapp.com",
  projectId: "incidencias-a781e",
  storageBucket: "incidencias-a781e.appspot.com",
  messagingSenderId: "567280156809",
  appId: "1:567280156809:web:bb5156f7ea49597cd78658",
  measurementId: "G-NYW0PJ0TL4"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firebase Authentication y Analytics
export const auth = getAuth(app);  // Exporta la instancia de auth
const analytics = getAnalytics(app);
