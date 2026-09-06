const express = require("express");
const router = express.Router();

const {
  getNearbyMarket
} = require("../controllers/marketController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/nearby", authMiddleware, getNearbyMarket);

module.exports = router;