const NewPipeline = require("../models/newPipelineModel");

// Get all new pipeline entries
const getAllNewPipelines = async (req, res) => {
  try {
    const pipelines = await NewPipeline.find();
    res.json(pipelines);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch new pipelines" });
  }
};

// Add a new pipeline (optional, for seeding or admin)
const addNewPipeline = async (req, res) => {
  try {
    const { label, description, icon } = req.body;
    const pipeline = new NewPipeline({ label, description, icon });
    await pipeline.save();
    res.status(201).json(pipeline);
  } catch (err) {
    res.status(400).json({ error: "Failed to add new pipeline" });
  }
};

module.exports = {
  getAllNewPipelines,
  addNewPipeline,
};
