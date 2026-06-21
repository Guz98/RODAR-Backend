const { Route } = require("../index");

// Devuelve todas las rutas guardadas del usuario autenticado
// Solo expone los campos del listado — el path con coordenadas no se incluye
// para no sobrecargar la respuesta cuando el usuario solo quiere ver sus rutas
const getRoutes = async (userId) => {
  return await Route.find({ userId }).select(
    "title filter difficulty distanceKm estimatedTime isFavorite createdAt",
  );
};

// Devuelve una ruta específica verificando que pertenezca al usuario autenticado
// Si el routeId existe pero el userId no coincide, devuelve null — el controller responde 404
// Así un usuario no puede ver las rutas de otro aunque conozca el id
const findRoute = async (routeId, userId) => {
  return await Route.findOne({ _id: routeId, userId });
};

// Guarda una ruta ya calculada por ORS
// El userId viene del token JWT — no del body — para garantizar que sea el dueño real
const createRoute = async (userId, payload) => {
  // Convierte origin y destination de array a GeoJSON
  // El front manda [-56.19, -34.90] y MongoDB necesita { type: "Point", coordinates: [...] }
  const routeData = {
    ...payload,
    origin: {
      type: "Point",
      coordinates: payload.origin,
    },
    destination: {
      type: "Point",
      coordinates: payload.destination,
    },
  };
  const newRoute = new Route({ userId, ...routeData });
  return await newRoute.save();
};

// Actualiza los campos de una ruta verificando que pertenezca al usuario autenticado
// Solo permite editar title, description e isFavorite según el updateRouteSchema de Joi
// Si la ruta no pertenece al usuario, findOne devuelve null y no se modifica nada
const updateRoute = async (routeId, userId, payload) => {
  const route = await Route.findOne({ _id: routeId, userId });
  if (route) {
    Object.entries(payload).forEach(([key, value]) => {
      route[key] = value;
    });
    await route.save();
  }
  return route; // devuelve null si no encontró la ruta — el controller responde 404
};

// Elimina una ruta verificando que pertenezca al usuario autenticado
// Si el userId no coincide, deleteOne no borra nada
const deleteRoute = async (routeId, userId) => {
  return await Route.deleteOne({ _id: routeId, userId });
};

// Devuelve solo las rutas marcadas como favoritas del usuario autenticado
// Se usa en el endpoint GET /api/routes/favorites
// No incluye el path con coordenadas para mantener la respuesta liviana
const getFavoriteRoutes = async (userId) => {
  return await Route.find({ userId, isFavorite: true }).select(
    "title filter difficulty distanceKm estimatedTime",
  );
};

module.exports = {
  getRoutes,
  findRoute,
  getFavoriteRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
};
