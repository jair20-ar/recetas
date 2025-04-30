const express = require("express");
const jwt = require("jsonwebtoken");
const recipeModel = require("../models/recipeModel");

const router = express.Router();
const JWT_SECRET = "mySecretKey";

// Middleware para proteger rutas
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No se envió un token." });

  try {
    req.user = jwt.verify(token, JWT_SECRET); // Decodifica y verifica el token
    next();
  } catch {
    res.status(400).json({ error: "Token inválido." });
  }
};

// Ruta protegida para crear una receta
router.post("/", authMiddleware, (req, res) => {
  const { title, description, userId } = req.body;

  recipeModel.createRecipe(title, description, null, userId, (err) => {
    if (err) return res.status(500).json({ error: "Error al crear la receta." });
    res.status(201).json({ message: "Receta creada exitosamente." });
  });
});

module.exports = router;