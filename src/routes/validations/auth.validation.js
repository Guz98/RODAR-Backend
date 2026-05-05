const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  // opcional al registro, por defecto "urban"
  role: Joi.string()
    .valid("urban", "recreational", "workshop_owner")
    .default("urban"),
});

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
});

module.exports = { signupSchema, loginSchema };
