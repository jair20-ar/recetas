const express = require("express");
const multer = require("multer");
const recipeModel = require("../models/recipeModel");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Ruta para crear una receta
router.post("/", upload.single("image"), (req, res) => {
  const { title, description, userId } = req.body;
  const imagePath = req.file ? req.file.path : null;

  recipeModel.createRecipe(title, description, imagePath, userId, (err) => {
    if (err) {
      res.status(500).json({ error: "Error al crear la receta." });
    } else {
      res.status(201).json({ message: "Receta creada exitosamente." });
    }
  });
});

// Ruta para obtener todas las recetas
router.get("/", (req, res) => {
  recipeModel.getAllRecipes((err, recipes) => {
    if (err) {
      res.status(500).json({ error: "Error al obtener recetas." });
    } else {
      res.status(200).json(recipes);
    }
  });
});

module.exports = router;