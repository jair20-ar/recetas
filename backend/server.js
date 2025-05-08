require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/api/users", userRoutes); // Rutas relacionadas con usuarios
app.use("/api/recipes", recipeRoutes); // Rutas relacionadas con recetas

// Ruta raíz para verificar que la API funciona
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenido a la API",
    routes: {
      users: ["/api/users/login", "/api/users/register"],
      recipes: ["/api/recipes"],
    },
  });
});

// Puerto
const PORT = 4322;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});