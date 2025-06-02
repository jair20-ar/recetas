const db = require("./database");

// Crear una receta
function createRecipe(title, category, ingredients, instructions, image, author_id, callback) {
  const sql = `
    INSERT INTO recipes (title, category, ingredients, instructions, image, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [title, category, ingredients, instructions, image, author_id], function (err) {
    callback(err, this ? this.lastID : null);
  });
}

// Obtener recetas (opcionalmente filtradas por categoría)
function getRecipes(category, callback) {
  let sql = "SELECT * FROM recipes";
  let params = [];
  if (category) {
    sql += " WHERE category = ?";
    params.push(category);
  }
  db.all(sql, params, callback);
}

// Editar receta SOLO si es del autor
function updateRecipe(id, title, category, ingredients, instructions, image, author_id, callback) {
  // Verificar si el usuario es el autor
  db.get("SELECT author_id FROM recipes WHERE id = ?", [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Receta no encontrada"));
    if (parseInt(row.author_id) !== parseInt(author_id)) {
      return callback(null, false);
    }
    // Actualizar solo los campos enviados
    let fields = [];
    let params = [];
    if (title) { fields.push("title = ?"); params.push(title); }
    if (category) { fields.push("category = ?"); params.push(category); }
    if (ingredients) { fields.push("ingredients = ?"); params.push(ingredients); }
    if (instructions) { fields.push("instructions = ?"); params.push(instructions); }
    if (image) { fields.push("image = ?"); params.push(image); }
    params.push(id);
    const sql = `UPDATE recipes SET ${fields.join(", ")} WHERE id = ?`;
    db.run(sql, params, function (err) {
      if (err) return callback(err);
      callback(null, this.changes > 0);
    });
  });
}

// Borrar receta SOLO si es del autor
function deleteRecipe(id, author_id, callback) {
  db.get("SELECT author_id FROM recipes WHERE id = ?", [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Receta no encontrada"));
    if (parseInt(row.author_id) !== parseInt(author_id)) {
      return callback(null, false);
    }
    db.run("DELETE FROM recipes WHERE id = ?", [id], function (err) {
      if (err) return callback(err);
      callback(null, this.changes > 0);
    });
  });
}

module.exports = {
  createRecipe,
  getRecipes,
  updateRecipe,
  deleteRecipe,
};