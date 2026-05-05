// Usage: roleMiddleware("workshop_owner")
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Acceso denegado - rol no permitido" });
        }
        next();
    };
};

module.exports = roleMiddleware;
