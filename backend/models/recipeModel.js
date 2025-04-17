const db = require("./database");

const createRecipe = (title, description, imagePath, userId, callback) => {
  const sql =
    "INSERT INTO recipes (title, description, image_path, user_id) VALUES (?, ?, ?, ?)";
  db.run(sql, [title, description, imagePath, userId], callback);
};

const getAllRecipes = (callback) => {
  const sql = "SELECT * FROM recipes";
  db.all(sql, [], callback);
};

const getRecipesByUser = (userId, callback) => {
  const sql = "SELECT * FROM recipes WHERE user_id = ?";
  db.all(sql, [userId], callback);
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipesByUser,
};