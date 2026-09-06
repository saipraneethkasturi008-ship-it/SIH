const express = require("express");
const router = express.Router();

const {
  getSchemes,
  recommendSchemes
} = require("../controllers/schemeController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getSchemes);

router.post("/recommend", authMiddleware, recommendSchemes);

module.exports = router;