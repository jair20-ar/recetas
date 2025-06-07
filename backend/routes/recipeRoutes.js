const express = require("express");
const multer = require("multer");
const path = require("path");
const recipeModel = require("../models/recipeModel");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";

// Configuración de Multer para imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Middleware de autenticación (ajústalo según tu lógica, puedes quitarlo para pruebas)
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No se envió un token." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(400).json({ error: "Token inválido." });
  }
};

// Crear receta
router.post("/", authMiddleware, upload.single("image"), (req, res) => {
  const { title, category, ingredients, instructions } = req.body;
  const image = req.file ? req.file.filename : null;
  const author_id = req.user?.id || null; // Si no usas auth, pon un número fijo

  if (!title || !category || !ingredients || !instructions) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  recipeModel.createRecipe(title, category, ingredients, instructions, image, author_id, (err, recipeId) => {
    if (err) return res.status(500).json({ error: "Error al crear la receta." });
    res.status(201).json({ message: "Receta creada exitosamente.", recipeId });
  });
});

// Listar recetas (puedes filtrar por categoría con ?category=categoria)
router.get("/", (req, res) => {
  const { category } = req.query;
  recipeModel.getRecipes(category, (err, recipes) => {
    if (err) return res.status(500).json({ error: "Error al obtener las recetas." });
    // Adjunta la URL completa de la imagen
    const withImages = recipes.map(r => ({
      ...r,
      image: r.image ? `${req.protocol}://${req.get("host")}/uploads/${r.image}` : null,
    }));
    res.json(withImages);
  });
});

// Actualizar receta
router.put("/:id", authMiddleware, upload.single("image"), (req, res) => {
  const { title, category, ingredients, instructions } = req.body;
  const image = req.file ? req.file.filename : null;
  const author_id = req.user?.id || null;
  const recipeId = req.params.id;

  recipeModel.updateRecipe(recipeId, title, category, ingredients, instructions, image, author_id, (err, updated) => {
    if (err) return res.status(500).json({ error: err.message || "Error al actualizar la receta." });
    if (!updated) return res.status(403).json({ error: "No tienes permiso para editar esta receta." });
    res.json({ message: "Receta actualizada correctamente." });
  });
});

// Borrar receta
router.delete("/:id", authMiddleware, (req, res) => {
  const recipeId = req.params.id;
  const author_id = req.user?.id || null;
  recipeModel.deleteRecipe(recipeId, author_id, (err, deleted) => {
    if (err) return res.status(500).json({ error: err.message || "Error al borrar la receta." });
    if (!deleted) return res.status(403).json({ error: "No tienes permiso para borrar esta receta." });
    res.json({ message: "Receta eliminada correctamente." });
  });
});

module.exports = router;