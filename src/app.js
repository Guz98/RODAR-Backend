require("dotenv").config(); // carga las variables de entorno del archivo .env
const express = require("express");
const connectMongoDB = require("./models/mongo.client");

const loggerMiddleware = require("./middlewares/logger.middleware");
const authMiddleware = require("./middlewares/auth.middleware");

const publicRouter = require("./routes/public.router");
const authRouter = require("./routes/auth.router");
const privateRouter = require("./routes/private.router");

const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

// ── Middlewares globales ───────────────────────────────────────────────────────
// Se ejecutan en orden para TODOS los requests antes de llegar a cualquier ruta
app.use(express.json()); // parsea el body de los requests a objeto JavaScript
app.use(cors()); // permite requests desde otros orígenes (frontend, Postman)
app.use(mongoSanitize()); // elimina operadores de MongoDB del body — previene inyecciones
app.use(loggerMiddleware); // registra cada request en consola y en el archivo de logs

// ── Rutas ─────────────────────────────────────────────────────────────────────
// Orden importante: public y auth van sin protección, private requiere token JWT
app.use("/api", publicRouter); // GET /api/health, /api/ping — sin auth
app.use("/api/auth", authRouter); // POST /api/auth/signup, /api/auth/login — sin auth
app.use("/api", authMiddleware, privateRouter); // todos los endpoints privados — requieren token válido

// ── Inicio del servidor ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000; // uso el puerto del .env o 3000 por defecto

const start = async () => {
  try {
    await connectMongoDB(); // conecta a MongoDB Atlas antes de abrir el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    // Si la conexión a MongoDB falla, detiene la app — no tiene sentido correr sin base de datos
    console.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
};

start();
