const supabase = require("../config/supabase");

// Create expense
const createExpense = async (req, res) => {
  try {
    const {
      category,
      amount,
      description
    } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Category and amount are required"
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number"
      });
    }

    if (numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: req.user.userId,
          category: category.trim(),
          amount: numericAmount,
          description: description
            ? description.trim()
            : ""
        }
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Create expense error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not record expense"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Expense recorded successfully",
      expense
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get user's expenses
const getExpenses = async (req, res) => {
  try {
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", req.user.userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Get expenses error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    return res.json({
      success: true,
      expenses
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    const { data: expense, error: findError } =
      await supabase
        .from("expenses")
        .select("id")
        .eq("id", expenseId)
        .eq("user_id", req.user.userId)
        .maybeSingle();

    if (findError) {
      console.error("Find expense error:", findError);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    const { error: deleteError } =
      await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId)
        .eq("user_id", req.user.userId);

    if (deleteError) {
      console.error("Delete expense error:", deleteError);

      return res.status(500).json({
        success: false,
        message: "Could not delete expense"
      });
    }

    return res.json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  deleteExpense
};