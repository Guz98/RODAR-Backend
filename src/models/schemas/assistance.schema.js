const mongoose = require("mongoose");

const assistanceSchema = new mongoose.Schema(
  {
    cyclistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
    },

    // Ubicación actual del ciclista cuando pidió ayuda
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    description: { type: String }, // qué le pasó a la bici

    // "pending" = esperando respuesta del taller
    // "accepted" = el taller aceptó
    // "resolved" = el problema fue resuelto
    // "cancelled" = el ciclista canceló
    status: {
      type: String,
      enum: ["pending", "accepted", "resolved", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

assistanceSchema.index({ location: "2dsphere" });

module.exports = assistanceSchema;
