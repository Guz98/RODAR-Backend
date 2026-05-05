const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name:     { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email:    { type: String, required: true, unique: true },
        password: { type: String, required: true },
        // "urban" | "recreational" | "workshop_owner"
        role:     { type: String, enum: ["urban", "recreational", "workshop_owner"], default: "urban" },
        active:   { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = userSchema;
