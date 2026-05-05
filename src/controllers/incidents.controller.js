const {
  getIncidents,
  findIncident,
  createIncident,
  resolveIncident,
  deleteIncident,
  getIncidentsNearby,
  getIncidentsAlongRoute,
} = require("../models/repositories/incident.repository");

const getIncidentsController = async (req, res) => {
  try {
    const incidents = await getIncidents();
    res.status(200).json(incidents);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getIncidentController = async (req, res) => {
  try {
    const incident = await findIncident(req.params.id);
    if (!incident)
      return res.status(404).json({ message: "Incidente no encontrado" });
    res.status(200).json(incident);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postIncidentController = async (req, res) => {
  try {
    const incident = await createIncident(req.user.id, req.body);
    res.status(201).json(incident);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const resolveIncidentController = async (req, res) => {
  try {
    const incident = await resolveIncident(req.params.id, req.user.id);
    if (!incident)
      return res.status(404).json({ message: "Incidente no encontrado" });
    res.status(200).json(incident);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteIncidentController = async (req, res) => {
  try {
    await deleteIncident(req.params.id, req.user.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getIncidentsNearbyController = async (req, res) => {
  const { lng, lat, km = 0.5 } = req.query; // radio default 500 metros
  if (!lng || !lat) {
    return res
      .status(400)
      .json({ message: "Se requieren los parámetros lng y lat" });
  }
  try {
    const incidents = await getIncidentsNearby(
      parseFloat(lng),
      parseFloat(lat),
      parseFloat(km),
    );
    res.status(200).json(incidents);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getIncidentsController,
  getIncidentController,
  postIncidentController,
  resolveIncidentController,
  deleteIncidentController,
  getIncidentsNearbyController,
};
