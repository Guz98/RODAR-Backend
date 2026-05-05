const {
  getParkings,
  getParkingsNearby,
  findParking,
  createParking,
  updateParking,
  deleteParking,
} = require("../models/repositories/parking.repository");

const getParkingsController = async (req, res) => {
  try {
    const parkings = await getParkings();
    res.status(200).json(parkings);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getParkingsNearbyController = async (req, res) => {
  const { lng, lat, km = 1 } = req.query;
  if (!lng || !lat) {
    return res
      .status(400)
      .json({ message: "Se requieren los parámetros lng y lat" });
  }
  try {
    const parkings = await getParkingsNearby(
      parseFloat(lng),
      parseFloat(lat),
      parseFloat(km),
    );
    res.status(200).json(parkings);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const getParkingController = async (req, res) => {
  try {
    const parking = await findParking(req.params.id);
    if (!parking)
      return res.status(404).json({ message: "Estacionamiento no encontrado" });
    res.status(200).json(parking);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const postParkingController = async (req, res) => {
  try {
    const parking = await createParking(req.user.id, req.body);
    res.status(201).json(parking);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const putParkingController = async (req, res) => {
  try {
    const parking = await updateParking(req.params.id, req.user.id, req.body);
    if (!parking)
      return res.status(404).json({ message: "Estacionamiento no encontrado" });
    res.status(200).json(parking);
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

const deleteParkingController = async (req, res) => {
  try {
    await deleteParking(req.params.id, req.user.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

module.exports = {
  getParkingsController,
  getParkingsNearbyController,
  getParkingController,
  postParkingController,
  putParkingController,
  deleteParkingController,
};
