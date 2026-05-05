const Joi = require("joi");

const createIncidentSchema = Joi.object({
    title:       Joi.string().min(3).max(60).required(),
    description: Joi.string().max(200),
    type:        Joi.string().valid("bad_road", "danger_zone", "poor_lighting", "other").default("other"),
    location: Joi.object({
        type:        Joi.string().valid("Point").default("Point"),
        coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
    }).required(),
});

module.exports = { createIncidentSchema };
