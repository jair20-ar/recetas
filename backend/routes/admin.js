const express = require('express');
const router = express.Router();
const Database = require("better-sqlite3");

const db = new Database("./database.sqlite", { verbose: console.log });

// Obtener todas las categorías
router.get('/categories', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, name FROM categories');
    const categories = stmt.all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener categorías." });
  }
});

// Agregar una nueva categoría
router.post('/categories', (req, res) => {
  let { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Nombre requerido" });
  name = name.trim();
  if (!name) return res.status(400).json({ success: false, message: "Nombre debe tener contenido." });
  try {
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const info = stmt.run(name);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).json({ success: false, message: "La categoría ya existe" });
    } else {
      res.status(400).json({ success: false, message: "Error al agregar categoría" });
    }
  }
});

// Eliminar una categoría por id
router.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      res.status(404).json({ success: false, message: "Categoría no encontrada" });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Aquí está tu ruta "libre" de admin para recetas ---

// Obtener todas las recetas (sin autenticación, sin rol)
router.get('/recipes', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM recipes');
    const recipes = stmt.all();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener recetas.' });
  }
});

// Eliminar receta por id (sin autenticación, sin rol)
router.delete('/recipes/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      res.status(404).json({ success: false, message: "Receta no encontrada" });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;