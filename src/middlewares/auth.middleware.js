const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "UnAuthorized - token no proporcionado" });
    }

    try {
        const verified = jwt.verify(token, process.env.AUTH_SECRET_KEY);
        req.user = verified;
        next();
    } catch {
        res.status(401).json({ message: "UnAuthorized - token inválido" });
    }
};

module.exports = authMiddleware;
