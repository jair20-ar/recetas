//este archivo middleware es para la logica de atenticacion se me olvida despues

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";

// Middleware para proteger rutas
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No se envió un token." });

  try {
    req.user = jwt.verify(token, JWT_SECRET); // Decodifica y verifica el token
    next();
  } catch {
    res.status(400).json({ error: "Token inválido." });
  }
};

module.exports = authMiddleware;