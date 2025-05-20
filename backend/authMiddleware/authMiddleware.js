const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("⚠️ JWT_SECRET no está configurado en las variables de entorno. Revisa tu archivo .env.");
  process.exit(1); // Detiene el servidor si falta JWT_SECRET
}

// Middleware para proteger rutas
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Acceso denegado. No se envió un token." });
  }

  // Verificar si el token tiene el prefijo 'Bearer'
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7, authHeader.length) : authHeader;

  try {
    // Decodifica y verifica el token
    req.user = jwt.verify(token, JWT_SECRET);
    console.log("Usuario autenticado:", req.user); // Log para depuración
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message); // Log detallado del error
    res.status(400).json({ error: "Token inválido." });
  }
};

module.exports = authMiddleware;