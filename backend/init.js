const db = require("../models/database");

console.log("Iniciando la creación de tablas...");

const initDB = () => {
  const tables = [
    {
      name: "users",
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
        )
      `,
    },
    {
      name: "recipes",
      sql: `
        CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          image_path TEXT,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `,
    },
  ];

  db.serialize(() => {
    tables.forEach(({ name, sql }) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error al crear la tabla '${name}':`, err.message);
        } else {
          console.log(`Tabla '${name}' creada correctamente.`);
        }
      });
    });
  });
};

initDB();