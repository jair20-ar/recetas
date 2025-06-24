const db = require("./database");

// Helper para parsear y serializar favoritos
function parseFavorites(favoritesString) {
  if (!favoritesString) return [];
  return favoritesString.split(',').filter(id => id);
}
function stringifyFavorites(favoritesArray) {
  return favoritesArray.join(',');
}

const createUser = (name, email, password, callback) => {
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.run(sql, [name, email, password], callback);
};

const getUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email], callback);
};

const getUserById = (id, callback) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  db.get(sql, [id], callback);
};

// FAVORITOS
const addFavorite = (userId, recipeId, callback) => {
  getUserById(userId, (err, user) => {
    if (err || !user) return callback(err || new Error("Usuario no encontrado"));
    let favorites = parseFavorites(user.favorites);
    if (!favorites.includes(String(recipeId))) {
      favorites.push(String(recipeId));
    }
    const sql = "UPDATE users SET favorites = ? WHERE id = ?";
    db.run(sql, [stringifyFavorites(favorites), userId], callback);
  });
};

const removeFavorite = (userId, recipeId, callback) => {
  getUserById(userId, (err, user) => {
    if (err || !user) return callback(err || new Error("Usuario no encontrado"));
    let favorites = parseFavorites(user.favorites);
    favorites = favorites.filter(id => id !== String(recipeId));
    const sql = "UPDATE users SET favorites = ? WHERE id = ?";
    db.run(sql, [stringifyFavorites(favorites), userId], callback);
  });
};

const getFavorites = (userId, callback) => {
  getUserById(userId, (err, user) => {
    if (err || !user) return callback(err || new Error("Usuario no encontrado"));
    callback(null, parseFavorites(user.favorites));
  });
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  addFavorite,
  removeFavorite,
  getFavorites,
};