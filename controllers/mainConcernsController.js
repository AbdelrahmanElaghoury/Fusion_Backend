const MainConcerns = require("../models/mainConcernsModel");

// Get all main concerns
const getAllMainConcerns = async (req, res) => {
  try {
    const concerns = await MainConcerns.find();
    res.json(concerns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch main concerns" });
  }
};

// Add a main concern (optional, for seeding)
const addMainConcerns = async (req, res) => {
  try {
    const { main_concern_name, subConcerns } = req.body;
    const mainConcern = new MainConcerns({ main_concern_name, subConcerns });
    await mainConcern.save();
    res.status(201).json(mainConcern);
  } catch (err) {
    res.status(400).json({ error: "Failed to add main concern" });
  }
};

module.exports = {
  getAllMainConcerns,
  addMainConcerns,
};
