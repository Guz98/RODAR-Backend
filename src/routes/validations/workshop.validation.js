const Joi = require("joi");

const createWorkshopSchema = Joi.object({
  name: Joi.string().min(3).max(60).required(),
  phone: Joi.string().max(20),
  address: Joi.string().max(100),
  schedule: Joi.string().max(60),
  image: Joi.string().uri(),
  location: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
  }).required(),
});

const updateWorkshopSchema = Joi.object({
  name: Joi.string().min(3).max(60),
  phone: Joi.string().max(20),
  address: Joi.string().max(100),
  schedule: Joi.string().max(60),
  image: Joi.string().uri(),
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }),
}).min(1);

module.exports = { createWorkshopSchema, updateWorkshopSchema };
