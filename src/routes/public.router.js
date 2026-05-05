const express = require("express");
const publicRouter = express.Router();

const {
  healthController,
  pingController,
} = require("../controllers/public.controller");

//Publicas no requiere Auth
publicRouter.get("/health", healthController);
publicRouter.get("/ping", pingController);

module.exports = publicRouter;
