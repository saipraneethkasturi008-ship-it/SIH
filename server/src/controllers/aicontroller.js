const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../config/supabase");
const { retrieveKnowledge } = require("../services/ragService");

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite"
];

const generateGeminiContent = async ({ prompt, systemInstruction, isJson = false }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your server/.env file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const modelsToTry = [...new Set(CANDIDATE_MODELS.filter(Boolean))];

  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const modelConfig = {
        model: modelName
      };

      if (systemInstruction) {
        modelConfig.systemInstruction = systemInstruction;
      }

      if (isJson) {
        modelConfig.generationConfig = {
          responseMimeType: "application/json"
        };
      }

      const model = genAI.getGenerativeModel(modelConfig);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.status === 500 ||
        err?.message?.includes("fetch failed") ||
        err?.message?.includes("ECONNRESET") ||
        err?.message?.includes("ETIMEDOUT") ||
        err?.message?.includes("Service Unavailable") ||
        err?.message?.includes("high demand");

      if (isTransient) {
        console.warn(
          `Gemini model ${modelName} encountered transient error (${err?.status || err.message}). Trying next available fallback model...`
        );
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};


// =====================================================
// AI CHAT
// =====================================================

const chatWithAI = async (req, res) => {
  console.log("AI CHAT CONTROLLER REACHED");

  try {
    const { message, language } = req.body;

    console.log("AI message:", message);
    console.log("AI language:", language);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const userId = req.user.userId;

    console.log("AI user ID:", userId);


    // -----------------------------------
    // 1. Get user's business
    // -----------------------------------

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (businessError) {
      console.error("AI business query error:", businessError);

      return res.status(500).json({
        success: false,
        message: "Could not load business data"
      });
    }


    // -----------------------------------
    // 2. Get user's products
    // -----------------------------------

    const { data: userProducts, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("AI products query error:", productsError);

      return res.status(500).json({
        success: false,
        message: "Could not load product data"
      });
    }


    // -----------------------------------
    // 3. Get user's sales
    // -----------------------------------

    const { data: userSales, error: salesError } = await supabase
      .from("sales")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (salesError) {
      console.error("AI sales query error:", salesError);

      return res.status(500).json({
        success: false,
        message: "Could not load sales data"
      });
    }


    // -----------------------------------
    // 4. Get user's expenses
    // -----------------------------------

    const { data: userExpenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (expensesError) {
      console.error("AI expenses query error:", expensesError);

      return res.status(500).json({
        success: false,
        message: "Could not load expense data"
      });
    }


    // -----------------------------------
    // 5. Calculate financial information
    // -----------------------------------

    const totalRevenue = (userSales || []).reduce(
      (total, sale) =>
        total + Number(sale.total_amount || 0),
      0
    );

    const totalExpenses = (userExpenses || []).reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    const profit = totalRevenue - totalExpenses;


    // -----------------------------------
    // 6. Create business context
    // -----------------------------------

    const businessContext = `
Business Name: ${business?.business_name || "Not provided"}
Business Type: ${business?.business_type || "Not provided"}

Number of Products: ${(userProducts || []).length}

Total Revenue: ₹${totalRevenue}
Total Expenses: ₹${totalExpenses}
Current Profit: ₹${profit}

Products:
${
  (userProducts || []).length
    ? userProducts
        .map(
          (product) =>
            `- ${product.name}: Cost ₹${product.cost}, Selling Price ₹${product.selling_price}, Quantity ${product.quantity}`
        )
        .join("\n")
    : "No products recorded."
}

Recent Sales:
${
  (userSales || []).length
    ? userSales
        .slice(0, 10)
        .map(
          (sale) =>
            `- Product ID: ${sale.product_id}, Quantity: ${sale.quantity}, Amount: ₹${sale.total_amount}`
        )
        .join("\n")
    : "No sales recorded."
}

Recent Expenses:
${
  (userExpenses || []).length
    ? userExpenses
        .slice(0, 10)
        .map(
          (expense) =>
            `- ${expense.category}: ₹${expense.amount} (${expense.description || "No description"})`
        )
        .join("\n")
    : "No expenses recorded."
}
`;


    // -----------------------------------
    // 7. Retrieve RAG knowledge
    // -----------------------------------

    console.log("Retrieving RAG knowledge...");

    const ragResults = await retrieveKnowledge(
      message.trim()
    );

    console.log(
      "RAG results found:",
      ragResults.length
    );

    const ragContext = ragResults.length
      ? ragResults
          .map(
            (item) =>
              `Official title: ${item.title}
Category: ${item.category}
Verified content: ${item.content}
Source organization: ${item.source || "N/A"}
Official source URL: ${item.source_url || "N/A"}`
          )
          .join("\n\n")
      : "No relevant knowledge found.";


    // -----------------------------------
    // 8. Language instruction
    // -----------------------------------

    let languageInstruction =
      "Respond in simple English.";

    if (language === "te") {
      languageInstruction =
        "Respond in simple Telugu. Use clear and easy Telugu suitable for rural entrepreneurs.";
    } else if (language === "hi") {
      languageInstruction =
        "Respond in simple Hindi. Use clear and easy Hindi suitable for rural entrepreneurs.";
    } else if (language === "ta") {
      languageInstruction =
        "Respond in simple Tamil. Use clear and easy Tamil suitable for rural entrepreneurs.";
    } else if (language === "kn") {
      languageInstruction =
        "Respond in simple Kannada. Use clear and easy Kannada suitable for rural entrepreneurs.";
    } else if (language === "ml") {
      languageInstruction =
        "Respond in simple Malayalam. Use clear and easy Malayalam suitable for rural entrepreneurs.";
    }


    // -----------------------------------
    // 9. Send request to Gemini
    // -----------------------------------

    console.log("Sending request to Gemini...");

    const systemPrompt = `
You are a helpful AI business assistant for rural micro-entrepreneurs in India.

${languageInstruction}

Give practical, simple and easy-to-understand business advice.

Use the entrepreneur's business data when answering.

Use the retrieved knowledge when it is relevant to the user's question.

IMPORTANT:
- Use only the retrieved knowledge when answering questions about government schemes.
- Do not invent, expand, rename, or modify government scheme names.
- Keep official scheme names exactly as provided in the retrieved knowledge.
- Keep abbreviations exactly as provided.
- Do not invent meanings for abbreviations.
- Do not add eligibility requirements, subsidy percentages, loan amounts, application procedures, or benefits unless they are explicitly present in the retrieved knowledge.
- If the retrieved knowledge does not provide enough information, say that the information needs to be verified from the official source.
- Do not invent financial numbers.
- Do not invent government schemes.
- Do not claim that a scheme is available if the retrieved knowledge does not support it.
- When mentioning a government scheme, use the exact title and information provided by the retrieved knowledge.
- Include the official source URL when it is available in the retrieved knowledge.

Focus on:
- Increasing profit
- Pricing products
- Reducing unnecessary expenses
- Increasing sales
- Marketing
- Product improvement
- Customer retention
- Government schemes and business support

Entrepreneur's business data:
${businessContext}

Retrieved knowledge from the Udyami Mitra knowledge base:
${ragContext}
`;

    const answer = (await generateGeminiContent({
      prompt: message.trim(),
      systemInstruction: systemPrompt
    }))?.trim();

    console.log("Gemini response received.");


    // -----------------------------------
    // 10. Validate Gemini response
    // -----------------------------------

    if (!answer) {
      console.error(
        "Gemini returned an empty response."
      );

      return res.status(500).json({
        success: false,
        message: "AI returned an empty response"
      });
    }


    // -----------------------------------
    // 11. Send response to frontend
    // -----------------------------------

    return res.json({
      success: true,
      answer,

      businessContext: {
        businessName:
          business?.business_name ||
          "Not provided",

        businessType:
          business?.business_type ||
          "Not provided",

        totalProducts:
          (userProducts || []).length,

        totalRevenue,
        totalExpenses,
        profit
      },

      ragContext: {
        resultsFound: ragResults.length,

        sources: ragResults.map(
          (item) => ({
            title: item.title,
            category: item.category,
            source: item.source,
            source_url: item.source_url
          })
        )
      }
    });

  } catch (error) {
    console.error(
      "Gemini AI error:",
      error
    );

    console.error(
      "Error stack:",
      error.stack
    );

    return res.status(500).json({
      success: false,
      message: "AI service error",
      error: error.message
    });
  }
};



// =====================================================
// BUSINESS DISCOVERY / RECOMMENDATION
// =====================================================

const getBusinessRecommendation = async (req, res) => {
  console.log("BUSINESS RECOMMENDATION CONTROLLER REACHED");

  try {
    const {
      location,
      budget,
      state,
      category,
      expectedIncome,
      riskPreference,
      skills,
      interests,
      language
    } = req.body;

    // -----------------------------------
    // 1. Validate required inputs
    // -----------------------------------

    if (!location || !budget || !state || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Location, budget, state and category are required"
      });
    }

    // -----------------------------------
    // 2. Language instruction
    // -----------------------------------

    let languageInstruction = "Use simple English.";

    if (language === "te") {
      languageInstruction =
        "Use simple Telugu suitable for rural entrepreneurs.";
    } else if (language === "hi") {
      languageInstruction =
        "Use simple Hindi suitable for rural entrepreneurs.";
    } else if (language === "ta") {
      languageInstruction =
        "Use simple Tamil suitable for rural entrepreneurs.";
    } else if (language === "kn") {
      languageInstruction =
        "Use simple Kannada suitable for rural entrepreneurs.";
    } else if (language === "ml") {
      languageInstruction =
        "Use simple Malayalam suitable for rural entrepreneurs.";
    }

    // -----------------------------------
    // 3. AI prompt
    // -----------------------------------

    const prompt = `
You are an AI business advisor for rural micro-entrepreneurs in India.

The user has selected this category:

"${category}"

CATEGORY IS A HARD CONSTRAINT.

All recommended businesses MUST belong to "${category}".

IMPORTANT CATEGORY RULES:
- Do not recommend businesses outside "${category}".
- Do not default to food businesses.
- Do not default to agriculture or agro-processing.
- Do not change the selected category.
- If the category is "Small Shops", recommend small retail/trading businesses.
- If the category is "Tailoring", recommend tailoring/apparel businesses.
- If the category is "Handicrafts", recommend handicraft/artisan businesses.
- If the category is "Dairy", recommend dairy/animal-husbandry businesses.
- If the category is "Farming Products", recommend agriculture/agri-processing businesses.
- If the category is "Food Products", recommend food-related businesses.

USER INFORMATION:

Location: ${location}
Town: ${req.body.town || location}
State: ${state}
Available Investment: ₹${budget}
Selected Category: ${category}
Expected Monthly Income: ₹${expectedIncome || "Not specified"}
Risk Preference: ${riskPreference || "Not specified"}
Skills: ${skills || "Not specified"}
Interests: ${interests || "Not specified"}

${languageInstruction}

Return EXACTLY ONE JSON object.

Do NOT use markdown.
Do NOT use code fences.
Do NOT add explanations before or after the JSON.

The JSON MUST have exactly this structure:

{
  "recommendedBusiness": {
    "title": "Business name",
    "category": "${category}",
    "locationReasoning": "Why this business suits the location",
    "targetMarket": [
      "Customer group 1",
      "Customer group 2",
      "Customer group 3"
    ],
    "startupCostBreakdown": [
      {
        "item": "Equipment or requirement",
        "cost": 10000
      },
      {
        "item": "Raw materials or stock",
        "cost": 5000
      },
      {
        "item": "Other setup cost",
        "cost": 5000
      }
    ],
    "operatingMetrics": {
      "estimatedStartupBudget": 20000,
      "estimatedMonthlyExpenses": 10000,
      "estimatedMonthlyRevenue": 25000,
      "estimatedMonthlyProfit": 15000
    },
    "matchingSchemes": [
      {
        "name": "Relevant government scheme",
        "subsidy": "General support description"
      }
    ],
    "stepPlan": [
      {
        "step": 1,
        "title": "First step",
        "detail": "What the entrepreneur should do"
      },
      {
        "step": 2,
        "title": "Second step",
        "detail": "What the entrepreneur should do"
      },
      {
        "step": 3,
        "title": "Third step",
        "detail": "What the entrepreneur should do"
      }
    ]
  },
  "alternatives": [
    {
      "title": "Alternative business 1",
      "category": "${category}",
      "reason": "Why it suits the user",
      "estimatedBudget": 15000,
      "estimatedMonthlyProfit": 8000
    },
    {
      "title": "Alternative business 2",
      "category": "${category}",
      "reason": "Why it suits the user",
      "estimatedBudget": 20000,
      "estimatedMonthlyProfit": 10000
    },
    {
      "title": "Alternative business 3",
      "category": "${category}",
      "reason": "Why it suits the user",
      "estimatedBudget": 25000,
      "estimatedMonthlyProfit": 12000
    }
  ]
}

FINAL CHECK BEFORE RESPONDING:

1. The main business category MUST be "${category}".
2. Every alternative category MUST be "${category}".
3. None of the businesses may be food/agro-processing unless "${category}" is "Food Products" or "Farming Products".
4. The startup budget must be realistic compared with ₹${budget}.
5. Do not guarantee profits.
6. Financial figures are approximate estimates only.
`;

    // -----------------------------------
    // 4. Send request to Gemini
    // -----------------------------------

    console.log(
      "Sending business recommendation request to Gemini..."
    );

    let rawAnswer = (await generateGeminiContent({
      prompt,
      systemInstruction:
        "You are a strict JSON-generating business recommendation engine for rural India. Always follow the user's selected category.",
      isJson: true
    }))?.trim();

    console.log(
      "Business recommendation Gemini response received."
    );

    // -----------------------------------
    // 5. Get AI response text
    // -----------------------------------

    if (!rawAnswer) {
      return res.status(500).json({
        success: false,
        message:
          "AI did not return a business recommendation"
      });
    }

    // Remove accidental markdown code fences
    rawAnswer = rawAnswer
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // -----------------------------------
    // 6. Parse JSON
    // -----------------------------------

    let recommendation;

    try {
      recommendation = JSON.parse(rawAnswer);
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini recommendation JSON:"
      );
      console.error(rawAnswer);

      return res.status(500).json({
        success: false,
        message:
          "AI returned an invalid recommendation format"
      });
    }

    // -----------------------------------
    // 7. Validate recommendation structure
    // -----------------------------------

    if (
      !recommendation ||
      !recommendation.recommendedBusiness
    ) {
      return res.status(500).json({
        success: false,
        message:
          "AI recommendation is missing the main business"
      });
    }

    // -----------------------------------
    // 8. Enforce selected category
    // -----------------------------------

    recommendation.recommendedBusiness.category =
      category;

    if (Array.isArray(recommendation.alternatives)) {
      recommendation.alternatives =
        recommendation.alternatives.map((alt) => ({
          ...alt,
          category
        }));
    }

    // -----------------------------------
    // 9. Send structured response
    // -----------------------------------

    return res.json({
      success: true,
      message:
        "AI recommendations generated",
      data: recommendation
    });

  } catch (error) {
    console.error(
      "Business recommendation AI error:",
      error
    );

    console.error(
      "Error stack:",
      error.stack
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate business recommendations",
      error: error.message
    });
  }
};

const getBusinessAreaOpportunities = async (req, res) => {
  console.log("BUSINESS AREA AI CONTROLLER REACHED");

  try {
    const {
      town,
      district,
      state,
      pin,
      latitude,
      longitude,
      language
    } = req.body;

    if (!town && !district && !state && (!latitude || !longitude)) {
      return res.status(400).json({
        success: false,
        message: "Location details are required."
      });
    }

    const locationLabel = [town, district, state]
      .filter(Boolean)
      .join(", ") || "the selected area";

    const languageInstruction =
      language === "te"
        ? "Respond in Telugu."
        : language === "hi"
        ? "Respond in Hindi."
        : language === "ta"
        ? "Respond in Tamil."
        : language === "kn"
        ? "Respond in Kannada."
        : language === "ml"
        ? "Respond in Malayalam."
        : "Respond in simple English.";

    const prompt = `
You are an AI business advisor for rural and small-town micro-entrepreneurs.

Analyze the following area and identify practical small-business opportunities.

LOCATION:
Town: ${town || "Not provided"}
District: ${district || "Not provided"}
State: ${state || "Not provided"}
PIN: ${pin || "Not provided"}
Latitude: ${latitude ?? "Not provided"}
Longitude: ${longitude ?? "Not provided"}

IMPORTANT:
- This is an AI ESTIMATE, not verified live market data.
- Do not claim that you accessed Google Maps, live census data, live customer counts, or real-time market data.
- Do not invent exact numbers of existing businesses.
- Use reasonable qualitative assumptions based on the supplied location.
- Focus on rural/semi-urban micro-enterprises.
- Give practical opportunities that can realistically be started by a small entrepreneur.
- Clearly distinguish estimates from verified facts.
- Do not guarantee income, profit, demand, or success.

${languageInstruction}

Return ONLY valid JSON.
Do not use markdown.
Do not put JSON inside code fences.

Use exactly this structure:

{
  "areaSummary": "Short explanation of the area's possible business environment.",
  "opportunities": [
    {
      "businessName": "Business name",
      "category": "Business category",
      "demand": "High / Medium / Low",
      "competition": "High / Medium / Low",
      "opportunityScore": 0,
      "whyHere": "Why this may fit the selected area.",
      "targetCustomers": ["Customer group 1", "Customer group 2"],
      "estimatedInvestment": "₹XX,XXX-₹XX,XXX",
      "estimatedMonthlyRevenue": "₹XX,XXX-₹XX,XXX",
      "estimatedMonthlyExpense": "₹XX,XXX-₹XX,XXX",
      "estimatedMonthlyProfit": "₹XX,XXX-₹XX,XXX",
      "firstStep": "Practical first validation step."
    }
  ]
}

Provide exactly 3 opportunities.
`;

    console.log("Sending business area AI request to Gemini...");

    let rawAnswer = (await generateGeminiContent({
      prompt,
      isJson: true
    }))?.trim();

    console.log("Business area AI response received.");

    if (!rawAnswer) {
      return res.status(500).json({
        success: false,
        message: "AI did not return a response."
      });
    }

    // Remove accidental markdown fences if Gemini adds them.
    rawAnswer = rawAnswer
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let analysis;

    try {
      analysis = JSON.parse(rawAnswer);
    } catch (parseError) {
      console.error("Business area AI JSON parse error:", parseError);
      console.error("Raw AI response:", rawAnswer);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid analysis format."
      });
    }

    if (
      !analysis ||
      !Array.isArray(analysis.opportunities) ||
      analysis.opportunities.length === 0
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned incomplete business opportunity data."
      });
    }

    return res.json({
      success: true,
      message: "AI business area analysis generated",
      data: {
        locationLabel,
        sourceLabel: "AI Market Analysis",
        sourceNote:
          "AI-generated non-binding estimates based on the supplied location. These are not verified live market statistics.",
        areaSummary: analysis.areaSummary || "",
        opportunities: analysis.opportunities.slice(0, 3)
      }
    });
  } catch (error) {
    console.error("Business area AI error:", error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI business opportunities.",
      error: error.message
    });
  }
};


// =====================================================
// AI MARKETING CONTENT
// =====================================================

const generateMarketingContent = async (req, res) => {
  console.log("MARKETING AI CONTROLLER REACHED");
  console.log("Marketing request body:", req.body);

  try {
    const {
      product,
      targetCustomer,
      tone,
      discount,
      language
    } = req.body;

    console.log("Marketing fields parsed:", {
  product,
  targetCustomer,
  tone,
  discount,
  language
});

    if (!product || !product.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product is required."
      });
    }

    let languageInstruction = "Write in simple English.";

    if (language === "te") {
      languageInstruction =
        "Write in simple Telugu suitable for rural customers.";
    } else if (language === "hi") {
      languageInstruction =
        "Write in simple Hindi suitable for rural customers.";
    } else if (language === "ta") {
      languageInstruction =
        "Write in simple Tamil suitable for rural customers.";
    } else if (language === "kn") {
      languageInstruction =
        "Write in simple Kannada suitable for rural customers.";
    } else if (language === "ml") {
      languageInstruction =
        "Write in simple Malayalam suitable for rural customers.";
    }

    const prompt = `
You are an AI marketing assistant for rural and small-town micro-entrepreneurs in India.

Create practical promotional content for the following product.

PRODUCT:
${product}

TARGET CUSTOMER:
${targetCustomer || "Local customers"}

TONE:
${tone || "Friendly & Festive"}

OFFER / DISCOUNT / FESTIVAL DETAILS:
${discount || "No special offer provided"}

${languageInstruction}

IMPORTANT:
- Make the content attractive but truthful.
- Do not invent product features, certifications, prices, discounts, or guarantees.
- Do not claim medical or health benefits.
- Keep the language simple and natural.
- Make the content suitable for local Indian customers.
- The WhatsApp message should be ready to send.
- The social post should be suitable for Facebook/Instagram.
- The poster text should be short and suitable for a promotional poster.
- Use emojis where appropriate.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Use exactly this structure:

{
  "whatsappMessage": "Ready-to-send WhatsApp promotional message",
  "socialPost": "Social media promotional post",
  "posterText": "Short promotional poster text"
}
`;

    console.log("Sending marketing request to Gemini...");

    let rawAnswer = (await generateGeminiContent({
      prompt,
      systemInstruction:
        "You are a marketing content generator for rural Indian micro-entrepreneurs. Return only valid JSON.",
      isJson: true
    }))?.trim();

    console.log("Marketing Gemini response received.");

    if (!rawAnswer) {
      return res.status(500).json({
        success: false,
        message: "AI did not return marketing content."
      });
    }

    // Remove accidental markdown code fences
    rawAnswer = rawAnswer
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let marketingContent;

    try {
      marketingContent = JSON.parse(rawAnswer);
    } catch (parseError) {
      console.error(
        "Marketing AI JSON parse error:",
        parseError
      );

      console.error(
        "Raw marketing response:",
        rawAnswer
      );

      return res.status(500).json({
        success: false,
        message: "AI returned invalid marketing content."
      });
    }

    if (
      !marketingContent ||
      typeof marketingContent.whatsappMessage !== "string" ||
      typeof marketingContent.socialPost !== "string" ||
      typeof marketingContent.posterText !== "string"
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned incomplete marketing content."
      });
    }

    return res.json({
      success: true,
      message: "Marketing content generated successfully",
      data: {
        whatsappMessage:
          marketingContent.whatsappMessage.trim(),

        socialPost:
          marketingContent.socialPost.trim(),

        posterText:
          marketingContent.posterText.trim()
      }
    });

  } catch (error) {
    console.error(
      "Marketing AI error:",
      error
    );

    console.error(
      "Error stack:",
      error.stack
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate marketing content.",
      error: error.message
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  chatWithAI,
  getBusinessRecommendation,
  getBusinessAreaOpportunities,
  generateMarketingContent
};