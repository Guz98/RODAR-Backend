const fs = require("fs");
const path = require("path");

const loggerMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${req.method} ${req.url}\n`;

    const logPath = path.join(__dirname, "../utils/logs/requests.log");
    fs.appendFile(logPath, log, (err) => {
        if (err) console.error("Error escribiendo log:", err);
    });

    console.log(log.trim());
    next();
};

module.exports = loggerMiddleware;
