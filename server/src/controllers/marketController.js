const supabase = require("../config/supabase");

const getNearbyMarket = async (req, res) => {
  try {
    // Get user's saved location
    const { data: userLocation, error: locationError } = await supabase
      .from("locations")
      .select("latitude, longitude, district")
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (locationError) {
      console.error("Location query error:", locationError);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!userLocation) {
      return res.status(404).json({
        success: false,
        message: "User location not found"
      });
    }

    // Use stored district if available.
    // Otherwise use Hyderabad for our current demo location.
    const district = userLocation.district;

if (!district) {
  return res.status(404).json({
    success: false,
    message: "District information is not available for this location"
  });
}

    // Find markets in the same district
    const { data: matchingMarkets, error: marketError } = await supabase
      .from("markets")
      .select("*")
      .ilike("district", district);

    if (marketError) {
      console.error("Market query error:", marketError);

      return res.status(500).json({
        success: false,
        message: "Could not find nearby markets"
      });
    }

    res.json({
      success: true,
      userLocation: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      },
      district,
      markets: matchingMarkets
    });

  } catch (error) {
    console.error("Market lookup error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getNearbyMarket
};