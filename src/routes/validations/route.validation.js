const Joi = require("joi");

// Schema para calcular una ruta (previsualización) — origin y destination como arrays simples
// El front manda las coordenadas directamente desde el mapa: [-56.19, -34.90]
const calculateRouteSchema = Joi.object({
  origin: Joi.array().items(Joi.number()).length(2).required(),
  destination: Joi.array().items(Joi.number()).length(2).required(),
  filter: Joi.string().valid("safe", "short", "flat").required(),
});

// Schema para guardar una ruta ya calculada
// origin y destination como arrays — el repository los convierte a GeoJSON antes de guardar
const createRouteSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().max(200),
  filter: Joi.string().valid("safe", "short", "flat").required(),
  origin: Joi.array().items(Joi.number()).length(2).required(),
  destination: Joi.array().items(Joi.number()).length(2).required(),
  distanceKm: Joi.number().min(0),
  estimatedTime: Joi.number().min(0),
  elevationGain: Joi.number().min(0),
  difficulty: Joi.number().min(1).max(5),
  path: Joi.object({
    type: Joi.string().valid("LineString"),
    coordinates: Joi.array().items(Joi.array().items(Joi.number())),
  }),
});

// Schema para editar una ruta guardada — solo permite cambiar título, descripción y favorita
const updateRouteSchema = Joi.object({
  title: Joi.string().min(3).max(60),
  description: Joi.string().max(200),
  isFavorite: Joi.boolean(),
}).min(1);

module.exports = { calculateRouteSchema, createRouteSchema, updateRouteSchema };
