const Service = require("../models/serviceModel");

// GET all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// Add a service (for admin/seeding)
const addService = async (req, res) => {
  try {
    const { name, category } = req.body;
    const service = new Service({ name, category });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: "Failed to add service" });
  }
};

module.exports = {
  getAllServices,
  addService,
};
