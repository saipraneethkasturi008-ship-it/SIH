const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // Normalize input
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Check user error:", checkError);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword
        }
      ])
      .select("id, name, email")
      .single();

    if (insertError) {
      console.error("Insert user error:", insertError);

      return res.status(500).json({
        success: false,
        message: "Could not create user"
      });
    }

    // Create JWT immediately after registration
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token + user to frontend
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Find user in Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error("Find user error:", userError);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", req.user.userId)
      .single();

    if (error) {
      console.error("Get current user error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch current user"
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};