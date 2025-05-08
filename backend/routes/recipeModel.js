const db = require("../db"); // Asume que tienes un archivo `db.js` para manejar la conexión a la base de datos

// Crear una receta
const createRecipe = (title, description, imageUrl, userId, callback) => {
  const query = `
    INSERT INTO recipes (title, description, image_url, user_id)
    VALUES (?, ?, ?, ?)
  `;
  const values = [title, description, imageUrl, userId];
  db.run(query, values, callback);
};

module.exports = {
  createRecipe,
};