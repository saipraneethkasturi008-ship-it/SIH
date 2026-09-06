const supabase = require("../config/supabase");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (businessError) {
      console.error("Business query error:", businessError);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    // Get user's products
    const { data: userProducts, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("user_id", userId);

    if (productsError) {
      console.error("Products query error:", productsError);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    // Get user's sales
    const { data: userSales, error: salesError } = await supabase
      .from("sales")
      .select("id, total_amount")
      .eq("user_id", userId);

    if (salesError) {
      console.error("Sales query error:", salesError);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    // Get user's expenses
    const { data: userExpenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, amount")
      .eq("user_id", userId);

    if (expensesError) {
      console.error("Expenses query error:", expensesError);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    // Calculate total revenue
    const totalRevenue = userSales.reduce(
      (total, sale) => total + Number(sale.total_amount || 0),
      0
    );

    // Calculate total expenses
    const totalExpenses = userExpenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );

    // Calculate profit
    const profit = totalRevenue - totalExpenses;

    // Calculate profit margin
    const profitMargin =
      totalRevenue > 0
        ? (profit / totalRevenue) * 100
        : 0;

    // Business health
    let businessHealth = "Needs Attention";

    if (profit > 0 && profitMargin >= 20) {
      businessHealth = "Healthy";
    } else if (profit > 0) {
      businessHealth = "Moderate";
    }

    res.json({
      success: true,

      dashboard: {
        business: business || null,

        totalProducts: userProducts.length,

        totalSalesTransactions: userSales.length,

        totalRevenue,

        totalExpenses,

        profit,

        profitMargin: Number(profitMargin.toFixed(2)),

        businessHealth
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getDashboard
};