// ── Inicio del servidor ───────────────────────────────────────────────────────
const app = require("../src/app");
const PORT = process.env.PORT; // uso el puerto del .env

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Database: ${process.env.STORAGE_TYPE || "mongoose"}`);
});
