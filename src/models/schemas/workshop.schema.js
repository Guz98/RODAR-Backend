const mongoose = require("mongoose");

// Bike workshops / repair shops
const workshopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    schedule: { type: String }, // ej "Lun-Vie 9:00-18:00"
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    active: { type: Boolean, default: true },
    rating: {
      average: { type: Number, default: 0 }, // promedio de estrellas
      count: { type: Number, default: 0 }, // cantidad de reseñas
    },
    avatar: { type: String, default: null }, // URL de la foto de perfil (Cloudinary)
  },
  { timestamps: true },
);

workshopSchema.index({ location: "2dsphere" });

module.exports = workshopSchema;
