import React from "react";
import { Button } from "antd"; // Importamos el componente Button
import { useNavigate } from "react-router-dom"; // Para redireccionar al hacer clic en el botón

const HomePage: React.FC = () => {
  const navigate = useNavigate(); // Hook para redirigir a otra página

  // Función que se ejecutará al hacer clic en el botón
  const handleNewIncidentClick = () => {
    navigate("/incidencias/create"); // Redirige a la página de creación de una nueva incidencia
  };

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>Bienvenido a la página de incidencias</h1>

      {/* Botón grande para crear una nueva incidencia */}
      <Button 
        type="primary" 
        size="large" 
        onClick={handleNewIncidentClick}
        style={{
          marginTop: "20px", 
          padding: "10px 40px", 
          fontSize: "18px",
        }}
      >
        Nueva Incidencia/Permiso
      </Button>
    </div>
  );
};

export default HomePage;
