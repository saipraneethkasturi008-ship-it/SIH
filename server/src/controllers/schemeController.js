const supabase = require("../config/supabase");
const { getLocalizedScheme } = require("../data/schemeTranslations");

const getSchemes = async (req, res) => {
  try {
    const lang = req.query.lang || req.headers["accept-language"] || "en";
    const { data: schemes, error } = await supabase
      .from("schemes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get schemes error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    const localizedSchemes = (schemes || []).map((scheme) =>
      getLocalizedScheme(scheme, lang)
    );

    res.json({
      success: true,
      count: localizedSchemes.length,
      schemes: localizedSchemes
    });

  } catch (error) {
    console.error("Get schemes error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const recommendSchemes = async (req, res) => {
  try {
    const lang = req.query.lang || req.headers["accept-language"] || "en";
    const { businessType } = req.body;

    if (!businessType) {
      return res.status(400).json({
        success: false,
        message: "Business type is required"
      });
    }

    const { data: schemes, error } = await supabase
      .from("schemes")
      .select("*");

    if (error) {
      console.error("Scheme query error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    const normalizedBusinessType = businessType.toLowerCase();

    const recommendedSchemes = schemes.filter((scheme) => {
      const category = (scheme.category || "").toLowerCase();

      return (
        category.includes(normalizedBusinessType) ||
        normalizedBusinessType.includes(category)
      );
    });

    const localizedRecommendations = recommendedSchemes.map((scheme) =>
      getLocalizedScheme(scheme, lang)
    );

    res.json({
      success: true,
      businessType,
      count: localizedRecommendations.length,
      recommendations: localizedRecommendations
    });

  } catch (error) {
    console.error("Scheme recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  getSchemes,
  recommendSchemes
};