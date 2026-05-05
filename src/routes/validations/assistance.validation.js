const Joi = require("joi");

const createAssistanceSchema = Joi.object({
  description: Joi.string().max(200),
  workshopId: Joi.string(), // opcional — si no se manda elige el más cercano
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
});

module.exports = { createAssistanceSchema };
