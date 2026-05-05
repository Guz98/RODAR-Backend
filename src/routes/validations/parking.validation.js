const Joi = require("joi");

const createParkingSchema = Joi.object({
  name: Joi.string().min(3).max(60).required(),
  isPublic: Joi.boolean(),
  capacity: Joi.number().min(0),
  covered: Joi.boolean(),
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
});

const updateParkingSchema = Joi.object({
  name: Joi.string().min(3).max(60),
  isPublic: Joi.boolean(),
  capacity: Joi.number().min(0),
  covered: Joi.boolean(),
}).min(1);

module.exports = { createParkingSchema, updateParkingSchema };
