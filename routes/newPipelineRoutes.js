const express = require("express");
const router = express.Router();
const {
  getAllNewPipelines,
  addNewPipeline,
} = require("../controllers/newPipelineController");

// GET all new pipelines
router.get("/", getAllNewPipelines);

// POST a new pipeline (optional, use for admin or seeding)
router.post("/", addNewPipeline);

module.exports = router;
