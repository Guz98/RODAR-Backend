const {
  createAssistance,
  getAssistancesByCyclist,
  getAssistancesByWorkshop,
  updateAssistanceStatus,
  cancelAssistance,
} = require("../models/repositories/assistance.repository");

const {
  getWorkshopsNearby,
} = require("../models/repositories/workshop.repository");

// El ciclista solicita asistencia — busca el taller más cercano automáticamente
const postAssistanceController = async (req, res) => {
  const { location, description, workshopId } = req.body;
  try {
    // Si el ciclista no eligió un taller específico,
    // busca automáticamente el más cercano (radio 5km)
    let tallerElegido = workshopId;
    if (!tallerElegido) {
      const [lng, lat] = location.coordinates;
      const tallersCercanos = await getWorkshopsNearby(lng, lat, 5);
      if (tallersCercanos.length === 0) {
        return res
          .status(404)
          .json({ message: "No hay talleres cercanos disponibles" });
      }
      // Elige el más cercano (ORS ya los devuelve ordenados por distancia)
      tallerElegido = tallersCercanos[0]._id;
    }

    const assistance = await createAssistance(req.user.id, {
      workshopId: tallerElegido,
      location,
      description,
    });

    res.status(201).json(assistance);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// El ciclista ve sus solicitudes
const getCyclistAssistancesController = async (req, res) => {
  try {
    const assistances = await getAssistancesByCyclist(req.user.id);
    res.status(200).json(assistances);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// El taller ve las solicitudes que le llegaron
const getWorkshopAssistancesController = async (req, res) => {
  try {
    const assistances = await getAssistancesByWorkshop(req.params.workshopId);
    res.status(200).json(assistances);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// El taller acepta la solicitud
const acceptAssistanceController = async (req, res) => {
  try {
    const assistance = await updateAssistanceStatus(req.params.id, "accepted");
    if (!assistance)
      return res.status(404).json({ message: "Solicitud no encontrada" });
    res.status(200).json(assistance);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// El taller marca la solicitud como resuelta
const resolveAssistanceController = async (req, res) => {
  try {
    const assistance = await updateAssistanceStatus(req.params.id, "resolved");
    if (!assistance)
      return res.status(404).json({ message: "Solicitud no encontrada" });
    res.status(200).json(assistance);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// El ciclista cancela su solicitud
const cancelAssistanceController = async (req, res) => {
  try {
    const assistance = await cancelAssistance(req.params.id, req.user.id);
    if (!assistance)
      return res.status(404).json({ message: "Solicitud no encontrada" });
    res.status(200).json(assistance);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  postAssistanceController,
  getCyclistAssistancesController,
  getWorkshopAssistancesController,
  acceptAssistanceController,
  resolveAssistanceController,
  cancelAssistanceController,
};
