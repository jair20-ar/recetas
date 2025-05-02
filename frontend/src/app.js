import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

// Componente de protección de rutas privadas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Verifica si el token existe
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública para el inicio de sesión */}
        <Route path="/login" element={<Login />} />

        {/* Ruta privada para el dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;