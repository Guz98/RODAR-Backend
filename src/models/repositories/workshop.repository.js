const { Workshop } = require("../index");
const cacheService = require("../../services/cache").cacheService;

// Devuelve todos los talleres activos
// Solo expone los campos necesarios para el listado — no devuelve ownerId ni datos internos
// Usa cache para no consultar MongoDB en cada request — se invalida cuando hay cambios
const getWorkshops = async () => {
  const cacheKey = cacheService.generateKey("workshops", "all");
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const workshops = await Workshop.find({ active: true }).select(
    "name phone address schedule location rating image",
  );

  await cacheService.set(cacheKey, workshops);
  return workshops;
};

// Devuelve un taller específico por su id con todos sus campos
// Se usa para ver el detalle completo incluyendo rating y reseñas
const findWorkshop = async (workshopId) => {
  return await Workshop.findById(workshopId);
};

// Crea un nuevo taller vinculado al usuario autenticado
// El ownerId viene del token JWT — no del body — para garantizar que sea el dueño real
// Invalida el cache para que el nuevo taller aparezca en el listado inmediatamente
const createWorkshop = async (ownerId, payload) => {
  const newWorkshop = new Workshop({ ownerId, ...payload });
  const result = await newWorkshop.save();
  await cacheService.delete(cacheService.generateKey("workshops", "all"));
  return result;
};

// Actualiza los datos de un taller verificando que el ownerId coincida
// Si el taller no pertenece al usuario autenticado, findOne devuelve null
// y no se modifica nada — así un dueño no puede editar el taller de otro
// Invalida el cache para que los datos actualizados sean visibles de inmediato
const updateWorkshop = async (workshopId, ownerId, payload) => {
  const workshop = await Workshop.findOne({ _id: workshopId, ownerId });
  if (workshop) {
    Object.entries(payload).forEach(([key, value]) => {
      workshop[key] = value;
    });
    await workshop.save();
    await cacheService.delete(cacheService.generateKey("workshops", "all"));
  }
  return workshop; // devuelve null si no encontró el taller — el controller responde 404
};

// Elimina un taller verificando que el ownerId coincida
// Si el ownerId no coincide, deleteOne no borra nada — mismo principio que updateWorkshop
// Invalida el cache para que el taller eliminado no siga apareciendo en el listado
const deleteWorkshop = async (workshopId, ownerId) => {
  const result = await Workshop.deleteOne({ _id: workshopId, ownerId });
  await cacheService.delete(cacheService.generateKey("workshops", "all"));
  return result;
};

// Devuelve los talleres activos cercanos a una ubicación dada
// Usa el operador $near de MongoDB con el índice 2dsphere definido en el schema
// Los resultados vienen ordenados de más cercano a más lejano automáticamente
// km * 1000 porque MongoDB trabaja en metros y el usuario manda kilómetros
// La clave del cache incluye las coordenadas y el radio para que cada búsqueda tenga su propio cache
const getWorkshopsNearby = async (lng, lat, km) => {
  const cacheKey = cacheService.generateKey(
    "workshops",
    "nearby",
    lng,
    lat,
    km,
  );
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const workshops = await Workshop.find({
    active: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: km * 1000, // convierte km a metros
      },
    },
  }).select("name phone address schedule location rating image");

  await cacheService.set(cacheKey, workshops);
  return workshops;
};

const findMyWorkshop = async (ownerId) => {
  return await Workshop.findOne({ ownerId, active: true });
};

module.exports = {
  getWorkshops,
  findWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopsNearby,
  findMyWorkshop,
};
