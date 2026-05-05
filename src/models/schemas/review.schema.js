const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true }, // 1 a 5 estrellas
    comment: { type: String, max: 300 },
  },
  { timestamps: true },
);

// Un usuario solo puede dejar una reseña por taller
reviewSchema.index({ userId: 1, workshopId: 1 }, { unique: true });

module.exports = reviewSchema;
