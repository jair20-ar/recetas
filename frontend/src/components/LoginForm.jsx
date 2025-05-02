import React, { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Inicio de sesión exitoso");
        console.log("Datos del usuario:", data);
      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Error de conexión");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Iniciar Sesión</h1>
      <label>
        Correo Electrónico:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu correo"
          required
        />
      </label>
      <br />
      <label>
        Contraseña:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
        />
      </label>
      <br />
      <button type="submit">iniciar seccion</button>
    </form>
  );
}

export default LoginForm;