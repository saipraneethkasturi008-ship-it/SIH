// Consistent Demo Persona: Lakshmi Homemade Foods (Andhra Pradesh)
export const DEMO_USER = {
  _id: "user-lakshmi-01",
  name: "Lakshmi Devi",
  phone: "9876543210",
  email: "lakshmi.foods@example.com",
  language: "te",
  state: "Andhra Pradesh"
};

export const DEMO_BUSINESS = {
  _id: "biz-lakshmi-01",
  userId: "user-lakshmi-01",
  name: "Lakshmi Homemade Foods",
  category: "Food Products",
  location: "Tenali, Guntur District",
  state: "Andhra Pradesh",
  description: "Traditional homemade Andhra pickles, spices, and podis prepared hygienically with farm-fresh ingredients.",
  monthlySales: 35200,
  monthlyExpenses: 21300,
  monthlyProfit: 13900,
  healthScore: 84,
  createdAt: "2026-01-15T09:00:00.000Z"
};

export const DEMO_PRODUCTS = [
  {
    _id: "prod-01",
    businessId: "biz-lakshmi-01",
    name: "Avakaya (Mango) Pickle - 1kg",
    category: "Pickles",
    costPrice: 120,
    sellingPrice: 180,
    stock: 65,
    unit: "kg",
    description: "Authentic spicy Andhra mango pickle made with gingelly oil and Guntur red chilli."
  },
  {
    _id: "prod-02",
    businessId: "biz-lakshmi-01",
    name: "Gongura Pickle - 500g",
    category: "Pickles",
    costPrice: 65,
    sellingPrice: 110,
    stock: 40,
    unit: "jar",
    description: "Tangy Andhra Gongura pickle prepared with organic leaves."
  },
  {
    _id: "prod-03",
    businessId: "biz-lakshmi-01",
    name: "Kandi Podi (Gunpowder) - 250g",
    category: "Spices & Podis",
    costPrice: 45,
    sellingPrice: 85,
    stock: 30,
    unit: "pouch",
    description: "Traditional roasted lentils spiced podi, best paired with hot rice and ghee."
  },
  {
    _id: "prod-04",
    businessId: "biz-lakshmi-01",
    name: "Tomato Pickle - 500g",
    category: "Pickles",
    costPrice: 50,
    sellingPrice: 90,
    stock: 25,
    unit: "jar",
    description: "Sun-dried farm tomato pickle with garlic and mustard."
  }
];

export const DEMO_SALES = [
  { _id: "s-1", businessId: "biz-lakshmi-01", productName: "Avakaya (Mango) Pickle - 1kg", quantity: 8, amount: 1440, customer: "Srinivas Rao (Local Retailer)", date: "2026-09-02", paymentMethod: "Cash" },
  { _id: "s-2", businessId: "biz-lakshmi-01", productName: "Gongura Pickle - 500g", quantity: 12, amount: 1320, customer: "Weekly Market Stall", date: "2026-09-02", paymentMethod: "UPI / PhonePe" },
  { _id: "s-3", businessId: "biz-lakshmi-01", productName: "Avakaya (Mango) Pickle - 1kg", quantity: 15, amount: 2700, customer: "Sri Krishna Kirana Store", date: "2026-09-01", paymentMethod: "UPI / PhonePe" },
  { _id: "s-4", businessId: "biz-lakshmi-01", productName: "Kandi Podi (Gunpowder) - 250g", quantity: 10, amount: 850, customer: "WhatsApp order (Bhavani)", date: "2026-08-31", paymentMethod: "UPI / PhonePe" },
  { _id: "s-5", businessId: "biz-lakshmi-01", productName: "Avakaya (Mango) Pickle - 1kg", quantity: 20, amount: 3600, customer: "Highway Mess & Hotel", date: "2026-08-30", paymentMethod: "Cash" },
  { _id: "s-6", businessId: "biz-lakshmi-01", productName: "Tomato Pickle - 500g", quantity: 6, amount: 540, customer: "Local Households", date: "2026-08-29", paymentMethod: "Cash" }
];

export const DEMO_EXPENSES = [
  { _id: "e-1", businessId: "biz-lakshmi-01", category: "Raw Materials", amount: 7800, description: "Raw Mangoes from Vijayawada wholesale market & Guntur Chillies", date: "2026-09-01" },
  { _id: "e-2", businessId: "biz-lakshmi-01", category: "Packaging", amount: 3200, description: "Food-grade airtight glass jars & induction seals", date: "2026-08-28" },
  { _id: "e-3", businessId: "biz-lakshmi-01", category: "Labour", amount: 4500, description: "Seasonal preparation helpers (2 days)", date: "2026-08-27" },
  { _id: "e-4", businessId: "biz-lakshmi-01", category: "Transportation", amount: 1800, description: "Auto transport from market and town delivery", date: "2026-08-25" },
  { _id: "e-5", businessId: "biz-lakshmi-01", category: "Electricity & Gas", amount: 2400, description: "Commercial cylinder and grinding mill charges", date: "2026-08-20" },
  { _id: "e-6", businessId: "biz-lakshmi-01", category: "Marketing & Labels", amount: 1600, description: "Printed label stickers with FSSAI registration detail", date: "2026-08-15" }
];

export const DEMO_CHART_DATA = [
  { month: "Apr", sales: 24000, expenses: 16500, profit: 7500 },
  { month: "May", sales: 29500, expenses: 18200, profit: 11300 },
  { month: "Jun", sales: 31000, expenses: 19800, profit: 11200 },
  { month: "Jul", sales: 33400, expenses: 20500, profit: 12900 },
  { month: "Aug", sales: 34800, expenses: 21100, profit: 13700 },
  { month: "Sep", sales: 35200, expenses: 21300, profit: 13900 }
];

export const DEMO_EXPENSE_PIE = [
  { name: "Raw Materials", value: 7800, color: "#f97316" },
  { name: "Labour", value: 4500, color: "#3b82f6" },
  { name: "Packaging", value: 3200, color: "#10b981" },
  { name: "Utilities / Gas", value: 2400, color: "#8b5cf6" },
  { name: "Transport", value: 1800, color: "#ec4899" },
  { name: "Marketing", value: 1600, color: "#f59e0b" }
];

export const DEMO_AI_INSIGHTS = {
  te: {
    insightTitle: "ఈ వారం వ్యాపార సూచన",
    insightText: "మీ మామిడికాయ పచ్చడిపై లాభం 33.3% గా ఆరోగ్యంగా ఉంది. వచ్చే పండుగల సీజన్ దృష్ట్యా స్థానిక కిరాణా షాపులతో ముందస్తు ఆర్డర్లు మాట్లాడితే మీ అమ్మకాలు మరో 25% పెరిగే అవకాశం ఉంది.",
    actions: [
      { id: 1, text: "స్థానిక కిరాణా వ్యాపారి శ్రీనివాసరావుకి మరో 10 కేజీల ఆర్డర్ గురించి వాట్సాప్ సందేశం పంపండి.", done: false },
      { id: 2, text: "వచ్చే వారం కోసం అవసరమైన గాజు సీసాల స్టాక్ (సుమారు 50) సరిచూసుకోండి.", done: true },
      { id: 3, text: "పీఎం ముద్రా శిశు లోన్ ద్వారా ప్యాకేజింగ్ మెషిన్ కోసం సమీప ఎస్బీఐ బ్రాంచ్‌లో విచారించండి.", done: false }
    ]
  },
  en: {
    insightTitle: "Weekly Business Intelligence",
    insightText: "Your Mango Pickle maintains a healthy 33.3% net margin. With the upcoming festive season, locking bulk pre-orders from 3 local kirana shops can boost monthly revenue past ₹42,000.",
    actions: [
      { id: 1, text: "Send festive bulk order WhatsApp message to Kirana retailer Srinivas Rao.", done: false },
      { id: 2, text: "Check inventory for 500g glass jars and induction seals before weekend batch.", done: true },
      { id: 3, text: "Inquire about MUDRA Shishu loan at local bank for semi-automatic seal machine.", done: false }
    ]
  },
  hi: {
    insightTitle: "साप्ताहिक व्यापार परामर्श",
    insightText: "आपके आम के अचार पर 33.3% का स्वस्थ लाभ मार्जिन है। आगामी त्योहारों को देखते हुए स्थानीय किराना दुकानों से अग्रिम ऑर्डर लेने पर मासिक बिक्री ₹42,000 पार कर सकती है।",
    actions: [
      { id: 1, text: "किराना रिटेलर श्रीनिवास राव को त्योहार के ऑर्डर का व्हाट्सएप संदेश भेजें।", done: false },
      { id: 2, text: "वीकेंड बैच से पहले 500 ग्राम जार और सील के स्टॉक की जांच करें।", done: true },
      { id: 3, text: "पैकेजिंग मशीन के लिए पीएम मुद्रा योजना के तहत बैंक में जानकारी लें।", done: false }
    ]
  }
};

export const SAMPLE_RECOMMENDATION = {
  recommendedBusiness: {
    title: "Homemade Andhra Pickles & Spices Unit",
    category: "Food Products / Agro-Processing",
    estimatedBudget: 40000,
    startupCostBreakdown: [
      { item: "Bulk Raw Materials (Raw Mangoes, Guntur Chillies, Gingelly Oil, Salts)", cost: 18000 },
      { item: "Food-grade Packaging (Glass/Pet Jars, Airtight Seals & Printed Labels)", cost: 7500 },
      { item: "Basic Kitchen Equipment & Heavy Grinder", cost: 6500 },
      { item: "FSSAI Basic Registration & Udyam Portal Certificate", cost: 2000 },
      { item: "Transportation & Initial Working Reserve", cost: 6000 }
    ],
    operatingMetrics: {
      estimatedStartupBudget: 40000,
      estimatedMonthlyRevenue: 35000,
      estimatedMonthlyExpenses: 21000,
      estimatedMonthlyProfit: 14000,
      profitMarginPercent: "40.0%"
    },
    targetMarket: [
      "Local residential households in weekly markets (Santalu)",
      "Nearby highway dhabas, mess halls, and breakfast tiffin centres",
      "Local Kirana / provision general stores (wholesale distribution)",
      "WhatsApp community and apartment bulk groups in nearby towns"
    ],
    locationReasoning: "Tenali & Guntur region offers direct farm-gate access to Asia's largest chilli market (Guntur Mirchi Yard) and high-quality mango groves, drastically lowering procurement and transport overhead by up to 35%.",
    requiredResources: [
      "Hygienic covered preparation space (at home or small room)",
      "Food Safety (FSSAI Basic) license and Udyam MSME number",
      "Weighing scale, sealing iron/machine, and stainless steel utensils",
      "Local vendor tie-ups for seasonal produce"
    ],
    matchingSchemes: [
      { name: "PMMY MUDRA Loan (Shishu)", subsidy: "Collateral-free credit up to ₹50,000 for equipment & working capital." },
      { name: "PMEGP (Rural MSME)", subsidy: "Up to 35% margin money capital subsidy for rural women." },
      { name: "AP YSR Cheyutha", subsidy: "₹18,750/yr direct livelihood cash support and bank credit linkage." }
    ],
    stepPlan: [
      { step: 1, title: "FSSAI & Udyam Registration", detail: "Get online FSSAI basic registration (₹100/yr) and zero-cost Udyam MSME certificate." },
      { step: 2, title: "Raw Material Sourcing", detail: "Procure export-grade Guntur chillies, cold-pressed sesame oil, and raw mangoes directly from APMC yards." },
      { step: 3, title: "Batch Trial & Standard Recipe", detail: "Make 20kg initial batch, calibrate shelf life with natural preservatives, test airtight seals." },
      { step: 4, title: "Sample Distribution & Kirana Partnerships", detail: "Distribute sample 100g sachets to 15 local kirana shops with attractive 25% retailer margin." },
      { step: 5, title: "WhatsApp & Weekly Santalu Launch", detail: "Share promotional WhatsApp catalogue and set up weekend stall at nearby weekly market." }
    ]
  },
  alternatives: [
    {
      title: "Handicrafts & Jute Bag Manufacturing",
      category: "Handicrafts",
      estimatedBudget: 35000,
      estimatedMonthlyProfit: 11500,
      reason: "High rural demand as plastic ban strengthens; requires 1 commercial sewing machine and local stitching skill."
    },
    {
      title: "Mini Dairy & Fresh Milk Delivery",
      category: "Dairy & Livestock",
      estimatedBudget: 55000,
      estimatedMonthlyProfit: 16000,
      reason: "Steady daily cash flow; requires 1-2 milch cows/buffaloes and village dairy society tie-up."
    },
    {
      title: "Tailoring & Designer Blouse Boutique",
      category: "Garments / Services",
      estimatedBudget: 25000,
      estimatedMonthlyProfit: 9500,
      reason: "Very low raw material risk, high margin on festive orders and weddings."
    }
  ]
};
