const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";

// Registrar un usuario
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Todos los campos son obligatorios." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    userModel.createUser(name, email, hashedPassword, (err) =>
      err ? res.status(500).json({ error: "Error al registrar el usuario." }) : res.status(201).json({ message: "Usuario registrado exitosamente." })
    );
  } catch {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Iniciar sesión
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Todos los campos son obligatorios." });

  userModel.getUserByEmail(email, async (err, user) => {
    if (err || !user) return res.status(404).json({ error: "Usuario no encontrado." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Contraseña incorrecta." });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Inicio de sesión exitoso.", token });
  });
});

module.exports = router;