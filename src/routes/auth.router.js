const express = require("express");
const authRouter = express.Router();

const { postAuthLogin, postAuthSignup } = require("../controllers/auth.controller");
const payloadMiddleware = require("../middlewares/payload.middleware");
const { signupSchema, loginSchema } = require("./validations/auth.validation");

authRouter.post("/signup", payloadMiddleware(signupSchema), postAuthSignup);
authRouter.post("/login",  payloadMiddleware(loginSchema),  postAuthLogin);

module.exports = authRouter;
