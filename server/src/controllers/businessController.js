const supabase = require("../config/supabase");

// Create business
const createBusiness = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      location,
      description
    } = req.body;

    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: "Business name and business type are required"
      });
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .insert([
        {
          user_id: req.user.userId,
          business_name: businessName,
          business_type: businessType,
          location: location || null,
          description: description || null
        }
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Create business error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not create business"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      business
    });
  } catch (error) {
    console.error("Create business error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get user's business
const getBusiness = async (req, res) => {
  try {
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (error) {
      console.error("Get business error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    return res.json({
      success: true,
      business
    });
  } catch (error) {
    console.error("Get business error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Update user's business
const updateBusiness = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      location,
      description
    } = req.body;

    const updates = {};

    if (businessName !== undefined) {
      updates.business_name = businessName;
    }

    if (businessType !== undefined) {
      updates.business_type = businessType;
    }

    if (location !== undefined) {
      updates.location = location;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update"
      });
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("user_id", req.user.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Update business error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not update business"
      });
    }

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    return res.json({
      success: true,
      message: "Business updated successfully",
      business
    });
  } catch (error) {
    console.error("Update business error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createBusiness,
  getBusiness,
  updateBusiness
};