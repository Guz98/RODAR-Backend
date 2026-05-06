const fs = require("fs");
const path = require("path");

const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${req.method} ${req.url}`;

  // Siempre muestra en consola — en Vercel aparece en el dashboard de Logs
  console.log(log);

  // Solo escribe en archivo cuando corre localmente
  // En producción (Vercel) el sistema de archivos no es escribible
  if (process.env.NODE_ENV !== "production") {
    const logPath = path.join(__dirname, "../utils/logs/requests.log");
    fs.appendFile(logPath, log + "\n", (err) => {
      if (err) console.error("Error escribiendo log:", err);
    });
  }

  next();
};

module.exports = loggerMiddleware;
