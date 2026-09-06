const supabase = require("../config/supabase");

// Create sale
const createSale = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      sellingPrice,
      customerName
    } = req.body;

    if (
      productId === undefined ||
      quantity === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity and selling price are required"
      });
    }

    const numericQuantity = Number(quantity);
    const numericSellingPrice = Number(sellingPrice);

    if (
      !Number.isFinite(numericQuantity) ||
      !Number.isFinite(numericSellingPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity and selling price must be valid numbers"
      });
    }

    if (numericQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    if (!Number.isInteger(numericQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number"
      });
    }

    if (numericSellingPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Selling price cannot be negative"
      });
    }

    // Make sure product belongs to logged-in user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (productError) {
      console.error("Product check error:", productError);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const totalAmount =
      numericQuantity * numericSellingPrice;

    const { data: sale, error } = await supabase
      .from("sales")
      .insert([
        {
          user_id: req.user.userId,
          product_id: productId,
          quantity: numericQuantity,
          selling_price: numericSellingPrice,
          customer_name:
            customerName || "Walk-in Customer",
          total_amount: totalAmount
        }
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Create sale error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not record sale"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sale recorded successfully",
      sale
    });
  } catch (error) {
    console.error("Create sale error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get user's sales
const getSales = async (req, res) => {
  try {
    const { data: sales, error } = await supabase
      .from("sales")
      .select("*")
      .eq("user_id", req.user.userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Get sales error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    return res.json({
      success: true,
      sales
    });
  } catch (error) {
    console.error("Get sales error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createSale,
  getSales
};