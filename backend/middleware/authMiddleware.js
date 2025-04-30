const jwt = require("jsonwebtoken");
const JWT_SECRET = "mySecretKey"; // Asegúrate de que esta clave coincida con la del login

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado. No se envió un token." });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Agrega los datos del usuario verificados al request
    next(); // Continúa al siguiente middleware o controlador
  } catch {
    res.status(400).json({ error: "Token inválido." });
  }
};