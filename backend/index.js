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

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡El servidor está funcionando correctamente!");
});

// Puerto
const PORT = 4321;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});