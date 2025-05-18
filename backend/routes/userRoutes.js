const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("⚠️ JWT_SECRET no está configurado en las variables de entorno. Revisa tu archivo .env");
  process.exit(1); // Detiene el servidor si falta JWT_SECRET
}

// Función auxiliar para validar campos requeridos
const validateFields = (fields, res) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      res.status(400).json({ error: `El campo '${key}' es obligatorio.` });
      return false;
    }
  }
  return true;
};

// Registrar un usuario
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validar campos
  if (!validateFields({ name, email, password }, res)) return;

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido." });
  }

  // Validar longitud de la contraseña
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    userModel.createUser(name, email, hashedPassword, (err) => {
      if (err) {
        console.error("Error al registrar el usuario:", err);
        return res.status(500).json({ error: "Error al registrar el usuario." });
      }

      res.status(201).json({ message: "Usuario registrado exitosamente." });
    });
  } catch (err) {
    console.error("Error interno del servidor:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validar campos
  if (!validateFields({ email, password }, res)) return;

  try {
    // Buscar al usuario por email
    userModel.getUserByEmail(email, async (err, user) => {
      if (err || !user) {
        console.error("Error al buscar el usuario:", err);
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      // Generar el token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email }, // Información que estará en el token
        JWT_SECRET,
        { expiresIn: "1h" } // El token expira en 1 hora
      );

      res.status(200).json({
        message: "Inicio de sesión exitoso.",
        token,
      });
    });
  } catch (err) {
    console.error("Error interno del servidor:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;