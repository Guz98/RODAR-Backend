const { Incident } = require("../index");
const cacheService = require("../../services/cache").cacheService;

// Devuelve todos los incidentes activos (no resueltos)
// Usa cache para no consultar MongoDB en cada request — se invalida cuando hay cambios
const getIncidents = async () => {
  const cacheKey = cacheService.generateKey("incidents", "all");
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const incidents = await Incident.find({ resolved: false }).select(
    "title type location createdAt",
  );

  await cacheService.set(cacheKey, incidents);
  return incidents;
};

const findIncident = async (incidentId) => {
  return await Incident.findById(incidentId);
};

// Crea un incidente e invalida el cache para que aparezca en el listado inmediatamente
const createIncident = async (userId, payload) => {
  const newIncident = new Incident({ userId, ...payload });
  const result = await newIncident.save();
  await cacheService.delete(cacheService.generateKey("incidents", "all"));
  return result;
};

// Marca el incidente como resuelto e invalida el cache para que desaparezca del listado
const resolveIncident = async (incidentId, userId) => {
  const incident = await Incident.findOne({ _id: incidentId, userId });
  if (incident) {
    incident.resolved = true;
    await incident.save();
    await cacheService.delete(cacheService.generateKey("incidents", "all"));
  }
  return incident;
};

// Elimina un incidente e invalida el cache
const deleteIncident = async (incidentId, userId) => {
  const result = await Incident.deleteOne({ _id: incidentId, userId });
  await cacheService.delete(cacheService.generateKey("incidents", "all"));
  return result;
};

const getIncidentsNearby = async (lng, lat, km) => {
  return await Incident.find({
    resolved: false,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: km * 1000,
      },
    },
  }).select("title type location createdAt");
};

const getIncidentsAlongRoute = async (coordinates, radiusMeters = 100) => {
  // En vez de $geoWithin con LineString (que MongoDB no soporta),
  // buscamos incidentes cercanos a cada punto del recorrido
  // usando $near con un radio pequeño y eliminando duplicados
  const incidentIds = new Set();
  const incidents = [];

  // Muestreamos 1 de cada 5 puntos para no hacer demasiadas consultas
  const muestreo = 5;

  for (let i = 0; i < coordinates.length; i += muestreo) {
    const [lng, lat] = coordinates[i];

    const cercanos = await Incident.find({
      resolved: false,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radiusMeters,
        },
      },
    }).select("title type location createdAt");

    // Evita duplicados usando el _id como clave
    cercanos.forEach((inc) => {
      if (!incidentIds.has(inc._id.toString())) {
        incidentIds.add(inc._id.toString());
        incidents.push(inc);
      }
    });
  }

  return incidents;
};

module.exports = {
  getIncidents,
  findIncident,
  createIncident,
  resolveIncident,
  deleteIncident,
  getIncidentsNearby,
  getIncidentsAlongRoute,
};
