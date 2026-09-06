const express = require("express");

const router = express.Router();

const {
  createBusiness,
  getBusiness,
  updateBusiness
} = require("../controllers/businessController");

const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.post("/", authMiddleware, createBusiness);
router.get("/", authMiddleware, getBusiness);
router.put("/", authMiddleware, updateBusiness);


module.exports = router;