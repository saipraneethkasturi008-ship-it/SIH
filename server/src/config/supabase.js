const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

if (!process.env.SUPABASE_URL) {
  console.warn("⚠️ Warning: SUPABASE_URL is not set in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;