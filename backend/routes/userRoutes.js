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
        // Actualización: Mensaje personalizado si el usuario no está registrado
        return res.status(404).json({ error: "No estás registrado dentro de la app. Por favor, regístrate." });
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      // Generar el token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" } 
      );

      res.status(200).json({
        message: "Inicio de sesión exitoso.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (err) {
    console.error("Error interno del servidor:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// --------- FAVORITOS --------- //
// Middleware de autenticación
function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// Añadir receta a favoritos
router.post("/:userId/favorites/:recipeId", authMiddleware, (req, res) => {
  const { userId, recipeId } = req.params;
  if (String(req.user.id) !== String(userId)) return res.status(403).json({ error: "No autorizado" });
  userModel.addFavorite(userId, recipeId, (err) => {
    if (err) return res.status(500).json({ error: "No se pudo agregar a favoritos" });
    res.json({ message: "Receta agregada a favoritos" });
  });
});

// Quitar de favoritos
router.delete("/:userId/favorites/:recipeId", authMiddleware, (req, res) => {
  const { userId, recipeId } = req.params;
  if (String(req.user.id) !== String(userId)) return res.status(403).json({ error: "No autorizado" });
  userModel.removeFavorite(userId, recipeId, (err) => {
    if (err) return res.status(500).json({ error: "No se pudo eliminar de favoritos" });
    res.json({ message: "Receta eliminada de favoritos" });
  });
});

// Obtener recetas favoritas (devuelve los datos completos de las recetas)
router.get("/:userId/favorites", authMiddleware, (req, res) => {
  const { userId } = req.params;
  if (String(req.user.id) !== String(userId)) return res.status(403).json({ error: "No autorizado" });
  userModel.getFavorites(userId, (err, favIds) => {
    if (err) return res.status(500).json({ error: "No se pudo obtener favoritos" });
    if (!favIds.length) return res.json([]);
    // Busca las recetas por ID
    const placeholders = favIds.map(() => '?').join(',');
    const db = require("../models/database");
    db.all(`SELECT * FROM recipes WHERE id IN (${placeholders})`, favIds, (err, rows) => {
      if (err) return res.status(500).json({ error: "No se pudieron obtener recetas favoritas" });
      res.json(rows);
    });
  });
});

module.exports = router;