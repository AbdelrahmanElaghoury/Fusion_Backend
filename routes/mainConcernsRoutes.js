const express = require("express");
const {
  getAllMainConcerns,
  addMainConcerns,
} = require("../controllers/mainConcernsController");

const router = express.Router();

router.get("/", getAllMainConcerns);
router.post("/", addMainConcerns); // Optional: for admin/seeding

module.exports = router;
