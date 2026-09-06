export const GOVERNMENT_SCHEMES = [
  {
    _id: "scheme-pmegp",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    shortName: "PMEGP",
    ministry: "Ministry of MSME, Govt of India",
    category: "Manufacturing & Services",
    maxLoan: "₹50 Lakhs (Mfg) / ₹20 Lakhs (Service)",
    subsidy: "15% - 35% margin money subsidy (higher in rural areas)",
    description: "Credit-linked subsidy scheme aimed at generating self-employment opportunities through micro-enterprise establishment in rural and urban areas.",
    eligibility: [
      "Any individual above 18 years of age",
      "Minimum 8th pass for projects above ₹10 Lakhs (Mfg) / ₹5 Lakhs (Service)",
      "Self Help Groups (SHGs) and registered institutions are also eligible",
      "No income ceiling for setting up projects"
    ],
    benefits: [
      "Rural General Category: 25% subsidy",
      "Rural Special Category (SC/ST/OBC/Women/Ex-Servicemen): 35% subsidy",
      "Beneficiary contribution: only 5% to 10% of total project cost"
    ],
    documents: [
      "Aadhaar Card & PAN Card",
      "Project Report / Detailed Business Plan (DPR)",
      "Educational Qualification Certificate (8th pass if loan > ₹10L)",
      "Caste / Category Certificate (if claiming special subsidy)",
      "Rural Area Certificate from local Panchayat/Tahsildar"
    ],
    officialSource: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
    state: "All India"
  },
  {
    _id: "scheme-mudra",
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    shortName: "MUDRA Loan",
    ministry: "Ministry of Finance, Govt of India",
    category: "Small Business & Trading",
    maxLoan: "Up to ₹20 Lakhs (Tarun Plus)",
    subsidy: "Collateral-free loan with subsidized interest rates",
    description: "Provides collateral-free loans to micro and small non-farm, non-corporate enterprises across three categories: Shishu, Kishore, and Tarun.",
    eligibility: [
      "Small shopkeepers, food processing artisans, vegetable/fruit vendors",
      "Tailoring, handicraft, transport operators, rural service providers",
      "Indian citizen with viable business plan and no previous bank default"
    ],
    benefits: [
      "Shishu: Loans up to ₹50,000 (ideal for home start, small equipment)",
      "Kishore: Loans from ₹50,001 up to ₹5,00,000 (business expansion)",
      "Tarun: Loans from ₹5,00,001 up to ₹20,00,000",
      "Zero processing fee for Shishu loans, no collateral required"
    ],
    documents: [
      "Proof of Identity (Voter ID / Aadhaar / Driving License / Passport)",
      "Proof of Residence (Electricity bill / Ration card / Aadhaar)",
      "Proof of Business Identity / Address (Shop certificate, Udyam)",
      "Quotation of machinery / items to be purchased",
      "Last 6 months bank statement (if available)"
    ],
    officialSource: "https://www.mudra.org.in/",
    state: "All India"
  },
  {
    _id: "scheme-vishwakarma",
    name: "PM Vishwakarma Scheme",
    shortName: "PM Vishwakarma",
    ministry: "Ministry of MSME",
    category: "Artisans & Craftsmen",
    maxLoan: "Up to ₹3,00,000 at 5% concessional interest",
    subsidy: "Free skill training, ₹15,000 modern toolkit incentive",
    description: "Holistic support to traditional rural artisans and craftspeople working with hands and tools across 18 designated trades.",
    eligibility: [
      "Artisan or craftsperson working with hands and tools in one of 18 trades (Tailor/Darzi, Carpenter, Blacksmith, Potter, Basket Maker, Cobbler, etc.)",
      "Minimum age 18 years on the date of registration",
      "Only one member per family eligible"
    ],
    benefits: [
      "PM Vishwakarma Certificate and ID Card recognition",
      "Basic skill training of 5-7 days with ₹500/day stipend",
      "₹15,000 digital toolkit incentive grant",
      "Collateral-free credit: Tranche 1 of ₹1 Lakh + Tranche 2 of ₹2 Lakhs at 5% interest"
    ],
    documents: [
      "Aadhaar Card with mobile linkage",
      "Bank Account Passbook",
      "Ration Card / Family Declaration",
      "Skill/Trade self-declaration"
    ],
    officialSource: "https://pmvishwakarma.gov.in/",
    state: "All India"
  },
  {
    _id: "scheme-udyam",
    name: "Udyam MSME Registration Portal",
    shortName: "Udyam Registration",
    ministry: "Ministry of MSME",
    category: "General Business Registration",
    maxLoan: "Enabler for priority sector bank loans & interest subventions",
    subsidy: "100% Free digital registration with instant certificate",
    description: "The zero-cost official government portal to register micro, small, and medium businesses, unlocking priority lending, 50% patent discount, and electricity concessions.",
    eligibility: [
      "Any individual or entity starting or running an enterprise in India",
      "Micro Enterprise: Investment in plant & machinery <= ₹1 Crore, Turnover <= ₹5 Crore"
    ],
    benefits: [
      "Permanent registration number and QR code-enabled certificate",
      "Exemption on security deposits for government procurement tenders",
      "Protection against delayed payments (MSME Samadhaan)",
      "Concession on electricity bills and trademark fees"
    ],
    documents: [
      "Aadhaar Number of the proprietor / partner / director",
      "PAN Card (or exemption for micro units without PAN)",
      "Bank Account Details (Account number & IFSC)"
    ],
    officialSource: "https://udyamregistration.gov.in/",
    state: "All India"
  },
  {
    _id: "scheme-standup",
    name: "Stand-Up India Scheme",
    shortName: "Stand-Up India",
    ministry: "Ministry of Finance",
    category: "Women & SC/ST Entrepreneurs",
    maxLoan: "₹10 Lakhs to ₹1 Crore",
    subsidy: "Bank credit guarantee cover & handholding support",
    description: "Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to at least one SC/ST borrower and at least one woman borrower per bank branch.",
    eligibility: [
      "SC/ST and/or Woman entrepreneur above 18 years of age",
      "Loans only for greenfield (first-time) ventures in manufacturing, services, or trading"
    ],
    benefits: [
      "Composite loan (term loan + working capital) up to 85% of project cost",
      "Repayable in 7 years with maximum moratorium period of 18 months",
      "Credit Guarantee Scheme support (no third-party guarantor needed)"
    ],
    documents: [
      "Identity and Residence Proof",
      "Caste Certificate (for SC/ST category)",
      "Detailed Project Report with machinery quotes",
      "Company/Firm registration documents if non-individual"
    ],
    officialSource: "https://www.standupmitra.in/",
    state: "All India"
  },
  {
    _id: "scheme-ap-cheyutha",
    name: "YSR Cheyutha / Stree Nidhi (Andhra Pradesh)",
    shortName: "AP YSR Cheyutha",
    ministry: "Govt of Andhra Pradesh (SERP)",
    category: "Women Rural Livelihoods",
    maxLoan: "₹75,000 financial assistance + Bank credit linkage",
    subsidy: "Direct cash assistance of ₹18,750 per year for 4 years",
    description: "Empowers rural women (aged 45-60) from BC, SC, ST, and Minority communities to establish sustainable micro-businesses in dairy, sheep, groceries, and food products.",
    eligibility: [
      "Women belonging to SC, ST, BC, Minority communities residing in Andhra Pradesh",
      "Age group of 45 to 60 years",
      "Total family income under ₹10,000/month (rural) or ₹12,000/month (urban)"
    ],
    benefits: [
      "₹18,750 per year grant directly deposited into Aadhaar-linked bank accounts",
      "Direct technical tie-ups with Amul, Reliance, ITC, P&G for retail business setup",
      "Zero-interest loans through Stree Nidhi and SHG networks"
    ],
    documents: [
      "Aadhaar Card",
      "Integrated Caste Certificate",
      "Income Certificate / White Ration Card",
      "Bank Account Details (Aadhaar Seeded)",
      "Age proof certificate"
    ],
    officialSource: "https://navasakam.ap.gov.in/",
    state: "Andhra Pradesh"
  }
];
