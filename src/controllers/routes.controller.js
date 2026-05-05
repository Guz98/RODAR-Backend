const {
  getRoutes,
  findRoute,
  createRoute,
  updateRoute,
  getFavoriteRoutes,
  deleteRoute,
} = require("../models/repositories/route.repository");
const { calcularRuta } = require("../utils/openrouteservice.js");
const {
  getIncidentsAlongRoute,
} = require("../models/repositories/incident.repository");

const getRoutesController = async (req, res) => {
  try {
    const routes = await getRoutes(req.user.id);
    res.status(200).json(routes);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getFavoriteRoutesController = async (req, res) => {
  try {
    const favoriteRoutes = await getFavoriteRoutes(req.user.id);
    res.status(200).json(favoriteRoutes);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getRouteController = async (req, res) => {
  try {
    const route = await findRoute(req.params.id, req.user.id);
    if (!route) return res.status(404).json({ message: "Ruta no encontrada" });
    res.status(200).json(route);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Calcula la ruta sin guardarla (previsualización)
// ORS devuelve directamente el tipo de vía via extra_info waytype
const calculateRouteController = async (req, res) => {
  const { origin, destination, filter } = req.body;
  try {
    const resultado = await calcularRuta(origin, destination, filter);

    // Busca incidentes sobre el trayecto calculado
    const incidentes = await getIncidentsAlongRoute(resultado.path.coordinates);

    res.status(200).json({
      ...resultado,
      incidents: incidentes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error al calcular la ruta" });
  }
};

const postRouteController = async (req, res) => {
  try {
    const route = await createRoute(req.user.id, req.body);
    res.status(201).json(route);
  } catch (error) {
    console.error("ERROR AL CREAR RUTA:", error.message);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putRouteController = async (req, res) => {
  try {
    const route = await updateRoute(req.params.id, req.user.id, req.body);
    if (!route) return res.status(404).json({ message: "Ruta no encontrada" });
    res.status(200).json(route);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteRouteController = async (req, res) => {
  try {
    await deleteRoute(req.params.id, req.user.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getRoutesController,
  getRouteController,
  calculateRouteController,
  postRouteController,
  putRouteController,
  deleteRouteController,
  getFavoriteRoutesController,
};
