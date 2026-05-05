const { Assistance } = require("../index");

// Crea una solicitud de asistencia
const createAssistance = async (cyclistId, payload) => {
  const newAssistance = new Assistance({ cyclistId, ...payload });
  return await newAssistance.save();
};

// El ciclista ve sus solicitudes
const getAssistancesByCyclist = async (cyclistId) => {
  return await Assistance.find({ cyclistId })
    .populate("workshopId", "name phone address") // trae los datos del taller
    .select("status description location createdAt");
};

// El taller ve las solicitudes que le llegaron
const getAssistancesByWorkshop = async (workshopId) => {
  return await Assistance.find({ workshopId })
    .populate("cyclistId", "name username") // trae los datos del ciclista
    .select("status description location createdAt");
};

// Cambia el estado de la solicitud
const updateAssistanceStatus = async (assistanceId, status) => {
  const assistance = await Assistance.findById(assistanceId);
  if (assistance) {
    assistance.status = status;
    await assistance.save();
  }
  return assistance;
};

// El ciclista cancela su solicitud
const cancelAssistance = async (assistanceId, cyclistId) => {
  const assistance = await Assistance.findOne({ _id: assistanceId, cyclistId });
  if (assistance) {
    assistance.status = "cancelled";
    await assistance.save();
  }
  return assistance;
};

module.exports = {
  createAssistance,
  getAssistancesByCyclist,
  getAssistancesByWorkshop,
  updateAssistanceStatus,
  cancelAssistance,
};
