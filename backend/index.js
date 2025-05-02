const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes"); // Importar las rutas

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/api/users", userRoutes); // Agregar las rutas de usuario

// Ruta para la página de inicio de sesión
app.get("/", (req, res) => {
  res.send(`
    <h1>Inicio de Sesión</h1>
    <form action="/api/users/login" method="POST">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required><br>
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Iniciar Sesión</button>
    </form>
    <p>¿No tienes una cuenta? <a href="/api/users/register">Regístrate aquí</a></p>
  `);
});

// Puerto
const PORT = 4321;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});