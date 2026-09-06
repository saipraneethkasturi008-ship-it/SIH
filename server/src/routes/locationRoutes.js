const express = require("express");
const router = express.Router();

const {
  saveLocation,
  getLocation,
  reverseGeocode,
  getBusinessLocation
} = require("../controllers/locationController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, saveLocation);
router.get("/", authMiddleware, getLocation);
router.post("/reverse-geocode", authMiddleware, reverseGeocode);
router.get("/business", authMiddleware, getBusinessLocation);
module.exports = router;