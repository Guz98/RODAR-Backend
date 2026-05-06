// ── Inicio del servidor ───────────────────────────────────────────────────────

require("dotenv").config();
const connectMongoDB = require("../src/models/mongo.client");
const createApp = require("../src/app");

const PORT = process.env.PORT || 3000; // uso el puerto del .env o 3000 por defecto

const start = async () => {
  try {
    await connectMongoDB(); // conecta a MongoDB Atlas antes de abrir el servidor
    const app = createApp();
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
