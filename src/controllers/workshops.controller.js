const {
  getWorkshops,
  findWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopsNearby,
} = require("../models/repositories/workshop.repository");

const getWorkshopsController = async (req, res) => {
  try {
    const workshops = await getWorkshops();
    res.status(200).json(workshops);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getWorkshopController = async (req, res) => {
  try {
    const workshop = await findWorkshop(req.params.id);
    if (!workshop)
      return res.status(404).json({ message: "Taller no encontrado" });
    res.status(200).json(workshop);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postWorkshopController = async (req, res) => {
  try {
    const workshop = await createWorkshop(req.user.id, req.body);
    res.status(201).json(workshop);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putWorkshopController = async (req, res) => {
  try {
    const workshop = await updateWorkshop(req.params.id, req.user.id, req.body);
    if (!workshop)
      return res.status(404).json({ message: "Taller no encontrado" });
    res.status(200).json(workshop);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteWorkshopController = async (req, res) => {
  try {
    await deleteWorkshop(req.params.id, req.user.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getWorkshopsNearbyController = async (req, res) => {
  const { lng, lat, km = 5 } = req.query; // km tiene default 5 si no se manda

  if (!lng || !lat) {
    return res
      .status(400)
      .json({ message: "Se requieren los parámetros lng y lat" });
  }

  try {
    const workshops = await getWorkshopsNearby(
      parseFloat(lng),
      parseFloat(lat),
      parseFloat(km),
    );
    res.status(200).json(workshops);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};
module.exports = {
  getWorkshopsController,
  getWorkshopController,
  postWorkshopController,
  putWorkshopController,
  deleteWorkshopController,
  getWorkshopsNearbyController,
};
