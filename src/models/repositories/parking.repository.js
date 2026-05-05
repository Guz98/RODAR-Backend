const { Parking } = require("../index");
const cacheService = require("../../services/cache").cacheService;

// Devuelve todos los estacionamientos activos
// Usa cache para no consultar MongoDB en cada request — se invalida cuando hay cambios
const getParkings = async () => {
  const cacheKey = cacheService.generateKey("parkings", "all");
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const parkings = await Parking.find({ active: true }).select(
    "name isPublic capacity covered location",
  );

  await cacheService.set(cacheKey, parkings);
  return parkings;
};

// Devuelve estacionamientos cercanos a una ubicación
// La clave incluye las coordenadas y el radio para que cada búsqueda tenga su propio cache
const getParkingsNearby = async (lng, lat, km) => {
  const cacheKey = cacheService.generateKey("parkings", "nearby", lng, lat, km);
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const parkings = await Parking.find({
    active: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: km * 1000,
      },
    },
  }).select("name isPublic capacity covered location");

  await cacheService.set(cacheKey, parkings);
  return parkings;
};

const findParking = async (parkingId) => {
  return await Parking.findById(parkingId);
};

// Crea un estacionamiento e invalida el cache para que aparezca en el listado inmediatamente
const createParking = async (userId, payload) => {
  const newParking = new Parking({ userId, ...payload });
  const result = await newParking.save();
  await cacheService.delete(cacheService.generateKey("parkings", "all"));
  return result;
};

// Actualiza un estacionamiento e invalida el cache con los datos actualizados
const updateParking = async (parkingId, userId, payload) => {
  const parking = await Parking.findOne({ _id: parkingId, userId });
  if (parking) {
    Object.entries(payload).forEach(([key, value]) => {
      parking[key] = value;
    });
    await parking.save();
    await cacheService.delete(cacheService.generateKey("parkings", "all"));
  }
  return parking;
};

// Elimina un estacionamiento e invalida el cache
const deleteParking = async (parkingId, userId) => {
  const result = await Parking.deleteOne({ _id: parkingId, userId });
  await cacheService.delete(cacheService.generateKey("parkings", "all"));
  return result;
};

module.exports = {
  getParkings,
  getParkingsNearby,
  findParking,
  createParking,
  updateParking,
  deleteParking,
};
