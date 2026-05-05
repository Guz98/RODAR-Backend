const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },

    // "safe" = más segura | "short" = más corta | "flat" = más llana
    filter: { type: String, enum: ["safe", "short", "flat"], required: true },

    // Calculada automáticamente (1 fácil – 5 difícil)
    difficulty: { type: Number, min: 1, max: 5 },

    // Datos de OpenRouteService
    distanceKm: { type: Number },
    estimatedTime: { type: Number }, // minutos
    elevationGain: { type: Number }, // desnivel en metros

    // Trayecto completo
    path: {
      type: {
        type: String,
        enum: ["LineString"],
        default: "LineString",
      },
      coordinates: { type: [[Number]], default: [] },
    },

    // Origen y destino
    origin: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    destination: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

routeSchema.index({ origin: "2dsphere" });
routeSchema.index({ destination: "2dsphere" });

module.exports = routeSchema;
