const supabase = require("../config/supabase");

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      cost,
      selling_price,
      quantity
    } = req.body;

    if (
      !name ||
      cost === undefined ||
      selling_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, cost and selling price are required"
      });
    }

    const numericCost = Number(cost);
    const numericSellingPrice = Number(selling_price);

    const numericQuantity =
      quantity === undefined
        ? 0
        : Number(quantity);

    if (
      !Number.isFinite(numericCost) ||
      !Number.isFinite(numericSellingPrice) ||
      !Number.isFinite(numericQuantity)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost, selling price and quantity must be valid numbers"
      });
    }

    if (
      numericCost < 0 ||
      numericSellingPrice < 0 ||
      numericQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cost, selling price and quantity cannot be negative"
      });
    }

    if (!Number.isInteger(numericQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number"
      });
    }

    const { data: product, error } =
      await supabase
        .from("products")
        .insert([
          {
            user_id: req.user.userId,
            name: name.trim(),
            cost: numericCost,
            selling_price: numericSellingPrice,
            quantity: numericQuantity
          }
        ])
        .select("*")
        .single();

    if (error) {
      console.error("Create product error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not create product"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Get products
const getProducts = async (req, res) => {
  try {
    const { data: products, error } =
      await supabase
        .from("products")
        .select("*")
        .eq("user_id", req.user.userId)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error("Get products error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    return res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Update product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const {
      name,
      cost,
      selling_price,
      quantity
    } = req.body;

    const updates = {};

    // Name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty"
        });
      }

      updates.name = name.trim();
    }

    // Cost
    if (cost !== undefined) {
      const numericCost = Number(cost);

      if (
        !Number.isFinite(numericCost) ||
        numericCost < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cost must be a valid non-negative number"
        });
      }

      updates.cost = numericCost;
    }

    // Selling price
    if (selling_price !== undefined) {
      const numericSellingPrice =
        Number(selling_price);

      if (
        !Number.isFinite(numericSellingPrice) ||
        numericSellingPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selling price must be a valid non-negative number"
        });
      }

      updates.selling_price =
        numericSellingPrice;
    }

    // Quantity
    if (quantity !== undefined) {
      const numericQuantity = Number(quantity);

      if (
        !Number.isFinite(numericQuantity) ||
        numericQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be a valid non-negative number"
        });
      }

      if (!Number.isInteger(numericQuantity)) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be a whole number"
        });
      }

      updates.quantity = numericQuantity;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one valid field is required to update"
      });
    }

    const { data: product, error } =
      await supabase
        .from("products")
        .update(updates)
        .eq("id", productId)
        .eq("user_id", req.user.userId)
        .select("*")
        .maybeSingle();

    if (error) {
      console.error("Update product error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not update product"
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const { data: product, error: findError } =
      await supabase
        .from("products")
        .select("id")
        .eq("id", productId)
        .eq("user_id", req.user.userId)
        .maybeSingle();

    if (findError) {
      console.error(
        "Find product error:",
        findError
      );

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

    const { error: deleteError } =
      await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("user_id", req.user.userId);

    if (deleteError) {
      console.error(
        "Delete product error:",
        deleteError
      );

      return res.status(500).json({
        success: false,
        message: "Could not delete product"
      });
    }

    return res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};