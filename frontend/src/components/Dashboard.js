const Dashboard = () => {
    const handleLogout = () => {
      localStorage.removeItem("token"); // Elimina el token
      window.location.href = "/login"; // Redirige al inicio de sesión
    };
  
    return (
      <div>
        <h1>Bienvenido al Dashboard</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
    );
  };
  
  export default Dashboard;