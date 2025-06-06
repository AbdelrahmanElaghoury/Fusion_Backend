const mongoose = require("mongoose");

const newPipelineSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // e.g., "/assets/steroids.png"
});

const NewPipeline = mongoose.model("NewPipeline", newPipelineSchema);
module.exports = NewPipeline;
