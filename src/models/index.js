const mongoose = require("mongoose");
const userSchema = require("./schemas/user.schema");
const routeSchema = require("./schemas/route.schema");
const incidentSchema = require("./schemas/incident.schema");
const workshopSchema = require("./schemas/workshop.schema");
const parkingSchema = require("./schemas/parking.schema");
const assistanceSchema = require("./schemas/assistance.schema");
const reviewSchema = require("./schemas/review.schema");

const User = mongoose.model("User", userSchema);
const Route = mongoose.model("Route", routeSchema);
const Incident = mongoose.model("Incident", incidentSchema);
const Workshop = mongoose.model("Workshop", workshopSchema);
const Parking = mongoose.model("Parking", parkingSchema);
const Assistance = mongoose.model("Assistance", assistanceSchema);
const Review = mongoose.model("Review", reviewSchema);

module.exports = {
  User,
  Route,
  Incident,
  Workshop,
  Parking,
  Assistance,
  Review,
};
