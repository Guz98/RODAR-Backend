const Joi = require("joi");

const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(300),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  comment: Joi.string().max(300),
}).min(1);

module.exports = { createReviewSchema, updateReviewSchema };
