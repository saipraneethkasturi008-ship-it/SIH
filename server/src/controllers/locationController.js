const axios = require("axios");
const supabase = require("../config/supabase");

const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers"
      });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude range"
      });
    }

    // Reverse geocode the coordinates
    let address = {};
    let displayName = null;

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat,
            lon,
            format: "jsonv2",
            zoom: 10,
            addressdetails: 1
          },
          headers: {
            "User-Agent": "Udyami-Mitra-Hackathon-App"
          },
          timeout: 10000
        }
      );

      address = response.data?.address || {};
      displayName = response.data?.display_name || null;
    } catch (geocodeError) {
      console.error(
        "Reverse geocoding error:",
        geocodeError.message
      );

      // Location can still be saved even if reverse geocoding fails
    }

    /*
     * Extract location details safely.
     *
     * Nominatim may return:
     * city / town / village / municipality
     * or, in some rural areas, only county.
     *
     * For rural locations such as Kalla, county can represent
     * the local administrative area/mandal.
     */
    const locationData = {
      latitude: lat,
      longitude: lon,
      display_name: displayName,

      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        null,

      district:
        address.state_district ||
        address.district ||
        null,

      state:
        address.state ||
        null,

      country:
        address.country ||
        null
    };

    // Check whether the user already has a saved location
    const {
      data: existingLocation,
      error: findError
    } = await supabase
      .from("locations")
      .select("*")
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (findError) {
      console.error("Find location error:", findError);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    let location;

    if (existingLocation) {
      // Update existing location
      const {
        data,
        error
      } = await supabase
        .from("locations")
        .update(locationData)
        .eq("user_id", req.user.userId)
        .select("*")
        .single();

      if (error) {
        console.error("Update location error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not update location"
        });
      }

      location = data;
    } else {
      // Create new location
      const {
        data,
        error
      } = await supabase
        .from("locations")
        .insert([
          {
            user_id: req.user.userId,
            ...locationData
          }
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Save location error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not save location"
        });
      }

      location = data;
    }

    return res.status(201).json({
      success: true,
      message: "Location saved successfully",
      location
    });

  } catch (error) {
    console.error("Save location error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers"
      });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "jsonv2",
          zoom: 10,
          addressdetails: 1
        },
        headers: {
          "User-Agent": "Udyami-Mitra-Hackathon-App"
        },
        timeout: 10000
      }
    );

    const address = response.data?.address || {};

    return res.json({
      success: true,
      location: response.data?.display_name || null,
      address
    });

  } catch (error) {
    console.error(
      "Reverse geocoding error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to find location"
    });
  }
};


const getLocation = async (req, res) => {
  try {
    const {
      data: location,
      error
    } = await supabase
      .from("locations")
      .select("*")
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (error) {
      console.error("Get location error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    return res.json({
      success: true,
      location
    });

  } catch (error) {
    console.error("Get location error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getBusinessLocation = async (req, res) => {
  try {
    const {
      data: location,
      error
    } = await supabase
      .from("locations")
      .select("user_id, latitude, longitude")
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (error) {
      console.error("Business location error:", error);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    return res.json({
      success: true,
      businessLocation: {
        userId: location.user_id,
        latitude: location.latitude,
        longitude: location.longitude,
        locationAvailable: true
      }
    });

  } catch (error) {
    console.error("Business location error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  saveLocation,
  getLocation,
  reverseGeocode,
  getBusinessLocation
};