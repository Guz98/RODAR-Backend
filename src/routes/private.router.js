const express = require("express");
const router = express.Router();

const payloadMiddleware = require("../middlewares/payload.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Importo todos los controllers — en cada uno manejo la lógica de su entidad
const {
  getRoutesController,
  getRouteController,
  calculateRouteController,
  postRouteController,
  putRouteController,
  getFavoriteRoutesController,
  deleteRouteController,
} = require("../controllers/routes.controller");

const {
  getIncidentsController,
  getIncidentController,
  postIncidentController,
  resolveIncidentController,
  deleteIncidentController,
  getIncidentsNearbyController,
} = require("../controllers/incidents.controller");

const {
  getWorkshopsController,
  getWorkshopController,
  postWorkshopController,
  putWorkshopController,
  deleteWorkshopController,
  getWorkshopsNearbyController,
  getMyWorkshopController,
} = require("../controllers/workshops.controller");

const {
  getParkingsController,
  getParkingsNearbyController,
  getParkingController,
  postParkingController,
  putParkingController,
  deleteParkingController,
} = require("../controllers/parking.controller");

const {
  createParkingSchema,
  updateParkingSchema,
} = require("./validations/parking.validation");

const {
  postAssistanceController,
  getCyclistAssistancesController,
  getWorkshopAssistancesController,
  acceptAssistanceController,
  resolveAssistanceController,
  cancelAssistanceController,
} = require("../controllers/assistance.controller");

const {
  postReviewController,
  getReviewsController,
  getMyReviewController,
  putReviewController,
  deleteReviewController,
} = require("../controllers/review.controller");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("./validations/review.validation");

const {
  createAssistanceSchema,
} = require("./validations/assistance.validation");

// Importo los schemas de Joi para validar el body de cada request
const {
  createRouteSchema,
  updateRouteSchema,
  calculateRouteSchema,
} = require("./validations/route.validation");
const { createIncidentSchema } = require("./validations/incident.validation");
const {
  createWorkshopSchema,
  updateWorkshopSchema,
} = require("./validations/workshop.validation");

const { getMeController } = require("../controllers/usuario.controller");

// ── Rutas ciclistas ───────────────────────────────────────────────────────────
// /calculate va antes que /:id para que Express no confunda "calculate" con un id
router.post(
  "/routes/calculate",
  payloadMiddleware(calculateRouteSchema),
  calculateRouteController,
);
router.get("/routes/favorites", getFavoriteRoutesController); // rutas favoritas del usuario
router.get("/routes", getRoutesController); // todas las rutas del usuario
router.get("/routes/:id", getRouteController); // una ruta específica
router.post(
  "/routes",
  payloadMiddleware(createRouteSchema),
  postRouteController, // guarda una ruta calculada
);
router.put(
  "/routes/:id",
  payloadMiddleware(updateRouteSchema),
  putRouteController, // edita título, descripción o favorita
);
router.delete("/routes/:id", deleteRouteController); // elimina una ruta guardada

// ── Incidentes ────────────────────────────────────────────────────────────────
// Cualquier usuario autenticado puede leer, crear y resolver incidentes
// /nearby va antes que /:id para que Express no confunda "nearby" con un id
router.get("/incidents/nearby", getIncidentsNearbyController); // incidentes cercanos a una ubicación
router.get("/incidents", getIncidentsController); // todos los incidentes activos
router.get("/incidents/:id", getIncidentController); // un incidente específico
router.post(
  "/incidents",
  payloadMiddleware(createIncidentSchema),
  postIncidentController, // reporta un nuevo incidente
);
router.patch("/incidents/:id/resolve", resolveIncidentController); // marca el incidente como resuelto
router.delete("/incidents/:id", deleteIncidentController); // elimina un incidente

// ── Talleres ──────────────────────────────────────────────────────────────────
// GET: cualquier usuario autenticado puede ver los talleres
// POST, PUT, DELETE: solo usuarios con rol "workshop_owner" pueden modificarlos
// /nearby y /my van antes que /:id para que Express no los confunda con un id
router.get("/workshops/nearby", getWorkshopsNearbyController); // talleres cercanos a una ubicación
router.get(
  "/workshops/my",
  roleMiddleware("workshop_owner"),
  getMyWorkshopController,
); // el dueño ve su propio taller
router.get("/workshops", getWorkshopsController); // todos los talleres activos
router.get("/workshops/:id", getWorkshopController); // un taller específico
router.post(
  "/workshops",
  roleMiddleware("workshop_owner"),
  payloadMiddleware(createWorkshopSchema),
  postWorkshopController,
);
router.put(
  "/workshops/:id",
  roleMiddleware("workshop_owner"),
  payloadMiddleware(updateWorkshopSchema),
  putWorkshopController,
);
router.delete(
  "/workshops/:id",
  roleMiddleware("workshop_owner"),
  deleteWorkshopController,
);
// ── Estacionamientos ──────────────────────────────────────────────────────────
// Cualquier usuario autenticado puede ver, crear y gestionar estacionamientos
// /nearby va antes que /:id para que Express no confunda "nearby" con un id
router.get("/parkings/nearby", getParkingsNearbyController); // estacionamientos cercanos a una ubicación
router.get("/parkings", getParkingsController); // todos los estacionamientos activos
router.get("/parkings/:id", getParkingController); // un estacionamiento específico
router.post(
  "/parkings",
  payloadMiddleware(createParkingSchema),
  postParkingController, // registra un nuevo estacionamiento
);
router.put(
  "/parkings/:id",
  payloadMiddleware(updateParkingSchema),
  putParkingController, // edita los datos del estacionamiento
);
router.delete("/parkings/:id", deleteParkingController); // da de baja un estacionamiento

// ── Solicitudes de asistencia ─────────────────────────────────────────────────
// Los ciclistas crean solicitudes — los talleres las aceptan y resuelven
// /my-requests y /workshop/:id van antes que /:id para evitar conflictos con Express
router.get("/assistance/my-requests", getCyclistAssistancesController); // el ciclista ve sus solicitudes
router.get(
  "/assistance/workshop/:workshopId",
  roleMiddleware("workshop_owner"), // solo el taller ve sus solicitudes entrantes
  getWorkshopAssistancesController,
);
router.post(
  "/assistance",
  payloadMiddleware(createAssistanceSchema),
  postAssistanceController, // el ciclista solicita asistencia
);
router.patch(
  "/assistance/:id/accept",
  roleMiddleware("workshop_owner"), // solo el taller puede aceptar
  acceptAssistanceController,
);
router.patch(
  "/assistance/:id/resolve",
  roleMiddleware("workshop_owner"), // solo el taller puede marcar como resuelto
  resolveAssistanceController,
);
router.patch("/assistance/:id/cancel", cancelAssistanceController); // el ciclista cancela su solicitud

// ── Reseñas de talleres ───────────────────────────────────────────────────────
// Cualquier ciclista autenticado puede dejar, editar y eliminar su propia reseña
// /my-review va antes que /:reviewId para evitar conflictos con Express
router.get("/workshops/:workshopId/reviews/my-review", getMyReviewController); // ver mi reseña en un taller
router.get("/workshops/:workshopId/reviews", getReviewsController); // todas las reseñas de un taller
router.post(
  "/workshops/:workshopId/reviews",
  payloadMiddleware(createReviewSchema),
  postReviewController, // deja una reseña en un taller
);
router.put(
  "/workshops/:workshopId/reviews/:reviewId",
  payloadMiddleware(updateReviewSchema),
  putReviewController, // edita mi reseña
);
router.delete(
  "/workshops/:workshopId/reviews/:reviewId",
  deleteReviewController, // elimina mi reseña
);

router.get("/usuario/me", getMeController);

module.exports = router;
