require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // <-- Agregado para servir imágenes
const Database = require("better-sqlite3"); // Paquete para manejar SQLite
const userRoutes = require("./routes/userRoutes"); // Importar las rutas de usuario
const recipeRoutes = require("./routes/recipeRoutes"); // <--- ¡Agregado!

const app = express();

// Configuración de SQLite
const db = new Database("./database.sqlite", { verbose: console.log });

// Crear tabla de usuarios si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`).run();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:4321", // Permite solicitudes solo desde el frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Métodos HTTP permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Cabeceras permitidas
};

// Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`Solicitud desde el origen: ${req.headers.origin}`);
  next();
});

// ---------- ¡¡ESTA LÍNEA SIRVE LA CARPETA DE IMÁGENES!! ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas de usuario
app.use("/api/users", userRoutes); // Prefijo para las rutas de usuario
// Rutas de recetas
app.use("/api/recipes", recipeRoutes); // <--- ¡Agregado!

// Ruta para registrar usuarios
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  // Validación de campos
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    // Insertar usuario en la base de datos
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `);
    stmt.run(name, email, password);

    console.log("Usuario registrado:", { name, email });
    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (err) {
    console.error("Error al registrar el usuario:", err);
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      // Error de duplicación (email único)
      res.status(400).json({ error: "El correo electrónico ya está registrado." });
    } else {
      res.status(500).json({ error: "Error al registrar el usuario." });
    }
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API" });
});

// Puerto
const PORT = process.env.PORT || 4322;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});