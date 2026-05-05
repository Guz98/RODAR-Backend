const mongoose = require("mongoose");

// Incidents reported by users (bad road, danger zone, etc.)
const incidentSchema = new mongoose.Schema(
    {
        userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title:       { type: String, required: true },
        description: { type: String },
        // "bad_road" | "danger_zone" | "poor_lighting" | "other"
        type: {
            type: String,
            enum: ["bad_road", "danger_zone", "poor_lighting", "other"],
            default: "other",
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
        },
        resolved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

incidentSchema.index({ location: "2dsphere" });

module.exports = incidentSchema;
