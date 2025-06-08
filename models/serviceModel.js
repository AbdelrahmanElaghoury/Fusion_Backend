const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // e.g., "Hormone Replacement Therapy"
});

const Service = mongoose.model("Service", ServiceSchema, "services");

module.exports = Service;
