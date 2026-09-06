const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createProduct);
router.get("/", authMiddleware, getProducts);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;