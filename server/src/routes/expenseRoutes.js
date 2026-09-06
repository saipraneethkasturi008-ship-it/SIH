const express = require("express");

const router = express.Router();

const {
  createExpense,
  getExpenses,
  deleteExpense
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getExpenses);
router.delete("/:id", authMiddleware, deleteExpense);

module.exports = router;