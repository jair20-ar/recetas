const db = require("./models/database");

console.log("Iniciando el archivo init.js...");

const initDB = () => {
  db.serialize(() => {
    console.log("Iniciando la creación de tablas...");

    // Crear tabla de usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error("Error al crear la tabla 'users':", err.message);
      } else {
        console.log("Tabla 'users' creada correctamente.");
      }
    });

    // Crear tabla de recetas
    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_path TEXT,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error("Error al crear la tabla 'recipes':", err.message);
      } else {
        console.log("Tabla 'recipes' creada correctamente.");
      }
    });

    console.log("Finalizada la creación de tablas.");
  });
};

initDB();