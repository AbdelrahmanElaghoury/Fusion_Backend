const express = require("express");
const { getAllServices, addService } = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getAllServices);
router.post("/", addService); // Optional: for admin/seeding

module.exports = router;

