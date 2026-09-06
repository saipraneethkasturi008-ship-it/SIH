const express = require("express");

const router = express.Router();

const {
  chatWithAI,
  getBusinessRecommendation,
  getBusinessAreaOpportunities,
  generateMarketingContent
} = require("../controllers/aicontroller");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/chat", authMiddleware, chatWithAI);
router.post(
  "/business-area-opportunities",
  authMiddleware,
  getBusinessAreaOpportunities
);

router.post(
  "/business-recommendation",
  authMiddleware,
  getBusinessRecommendation
);

router.post(
  "/marketing",
  authMiddleware,
  generateMarketingContent
);

module.exports = router;