const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const router = express.Router();

// Ruta para registrar usuarios
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  userModel.createUser(name, email, hashedPassword, (err) => {
    if (err) {
      res.status(500).json({ error: "Error al crear el usuario." });
    } else {
      res.status(201).json({ message: "Usuario creado exitosamente." });
    }
  });
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  userModel.getUserByEmail(email, async (err, user) => {
    if (err || !user) {
      res.status(404).json({ error: "Usuario no encontrado." });
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        res.status(200).json({ message: "Inicio de sesión exitoso." });
      } else {
        res.status(401).json({ error: "Contraseña incorrecta." });
      }
    }
  });
});

module.exports = router;