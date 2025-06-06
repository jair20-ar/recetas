const sqlite3 = require("sqlite3").verbose();
const path = require("path");

console.log("Cargando el módulo database.js...");

const dbPath = path.resolve(__dirname, "../database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conexión a la base de datos SQLite exitosa.");
  }
});

module.exports = db;