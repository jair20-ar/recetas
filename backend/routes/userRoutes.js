const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const router = express.Router();
const JWT_SECRET = "mySecretKey"; // Cambia esto por una clave más segura

// Ruta para la página de inicio de sesión
router.get("/", (req, res) => {
  res.send(`
    <h1>Inicio de Sesión</h1>
    <form action="/login" method="POST">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required><br>
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Iniciar Sesión</button>
    </form>
    <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
  `);
});

// Ruta para devolver información en el navegador en /register (formulario de registro)
router.get("/register", (req, res) => {
  res.send(`
    <h1>Formulario de Registro</h1>
    <form action="/register" method="POST">
      <label for="name">Nombre:</label>
      <input type="text" id="name" name="name" required><br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required><br>
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Registrar</button>
    </form>
  `);
});

// Ruta para registrar un usuario
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validar entrada
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Guardar el usuario en la base de datos
  userModel.createUser(name, email, hashedPassword, (err) => {
    if (err) {
      return res.status(500).json({ error: "Error al registrar el usuario." });
    }
    res.status(201).json({ message: "Usuario registrado exitosamente." });
  });
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  userModel.getUserByEmail(email, async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Inicio de sesión exitoso.", token });
  });
});

module.exports = router;