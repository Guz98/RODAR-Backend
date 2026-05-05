const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    isPublic: { type: Boolean, default: true }, // público o privado
    capacity: { type: Number }, // capacidad estimada
    covered: { type: Boolean, default: false }, // techado o no
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

parkingSchema.index({ location: "2dsphere" });

module.exports = parkingSchema;
