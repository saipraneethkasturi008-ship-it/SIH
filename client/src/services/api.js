import axios from 'axios';

import { GOVERNMENT_SCHEMES } from '../data/schemesData.js';
import { SAMPLE_RECOMMENDATION } from '../data/mockData.js';

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================================
// JWT REQUEST INTERCEPTOR
// ============================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vm_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH SERVICE
// ============================================================

export const authService = {

  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

  login: async (credentials) => {
    const res = await API.post(
      '/auth/login',
      credentials
    );

    if (!res?.token) {
      throw new Error(
        'Login succeeded but no JWT token was returned'
      );
    }

    localStorage.setItem(
      'vm_token',
      res.token
    );

    if (res.user) {
      localStorage.setItem(
        'vm_user',
        JSON.stringify(res.user)
      );
    }

    return res;
  },

  // ----------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------

  register: async (userData) => {
    const res = await API.post(
      '/auth/register',
      userData
    );

    if (!res?.token) {
      throw new Error(
        'Registration succeeded but no JWT token was returned'
      );
    }

    localStorage.setItem(
      'vm_token',
      res.token
    );

    if (res.user) {
      localStorage.setItem(
        'vm_user',
        JSON.stringify(res.user)
      );
    }

    return res;
  },

  // ----------------------------------------------------------
  // CURRENT USER
  // ----------------------------------------------------------

  getCurrentUser: async () => {
    try {
      return await API.get('/auth/me');
    } catch (error) {
      console.error(
        'Current user API error:',
        error
      );

      return null;
    }
  },

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  logout: () => {
    localStorage.removeItem('vm_token');
    localStorage.removeItem('vm_user');
  }
};

// ============================================================
// BUSINESS SERVICE
// ============================================================

export const businessService = {

  // ----------------------------------------------------------
  // GET BUSINESS
  // GET /api/business
  // ----------------------------------------------------------

  getBusiness: async () => {
    return await API.get('/business');
  },

  // ----------------------------------------------------------
  // CREATE BUSINESS
  // POST /api/business
  // ----------------------------------------------------------

  createBusiness: async (businessData) => {
    return await API.post(
      '/business',
      businessData
    );
  },

  // ----------------------------------------------------------
  // UPDATE BUSINESS
  // PUT /api/business
  // ----------------------------------------------------------

  updateBusiness: async (id, businessData) => {
    return await API.put(
      '/business',
      businessData
    );
  }
};

// ============================================================
// LOCATION SERVICE
// ============================================================

export const locationService = {

  // ----------------------------------------------------------
  // SAVE LOCATION
  // POST /api/location
  // ----------------------------------------------------------

  saveLocation: async (
    latitude,
    longitude
  ) => {
    return await API.post(
      '/location',
      {
        latitude,
        longitude
      }
    );
  },

  // ----------------------------------------------------------
  // GET LOCATION
  // GET /api/location
  // ----------------------------------------------------------

  getLocation: async () => {
    return await API.get('/location');
  },

  // ----------------------------------------------------------
  // GET NEARBY MARKETS
  // GET /api/market/nearby
  // ----------------------------------------------------------

  getNearbyMarkets: async () => {
    return await API.get('/market/nearby');
  }
};

// ============================================================
// PRODUCT SERVICE
// ============================================================

export const productService = {

  // ----------------------------------------------------------
  // GET PRODUCTS
  // GET /api/products
  // ----------------------------------------------------------

  getProducts: async () => {
    return await API.get('/products');
  },

  // ----------------------------------------------------------
  // ADD PRODUCT
  // POST /api/products
  // ----------------------------------------------------------

  addProduct: async (productData) => {
    return await API.post(
      '/products',
      productData
    );
  },

  // ----------------------------------------------------------
  // UPDATE PRODUCT
  // PUT /api/products/:id
  // ----------------------------------------------------------

  updateProduct: async (
    id,
    productData
  ) => {
    return await API.put(
      `/products/${id}`,
      productData
    );
  },

  // ----------------------------------------------------------
  // DELETE PRODUCT
  // DELETE /api/products/:id
  // ----------------------------------------------------------

  deleteProduct: async (id) => {
    return await API.delete(
      `/products/${id}`
    );
  }
};

// ============================================================
// SALES SERVICE
// ============================================================

export const salesService = {

  // ----------------------------------------------------------
  // GET SALES
  // GET /api/sales
  // ----------------------------------------------------------

  getSales: async () => {
    return await API.get('/sales');
  },

  // ----------------------------------------------------------
  // ADD SALE
  // POST /api/sales
  // ----------------------------------------------------------

  addSale: async (saleData) => {
    return await API.post(
      '/sales',
      saleData
    );
  }
};

// ============================================================
// EXPENSE SERVICE
// ============================================================

export const expenseService = {

  // ----------------------------------------------------------
  // GET EXPENSES
  // GET /api/expenses
  // ----------------------------------------------------------

  getExpenses: async () => {
    return await API.get('/expenses');
  },

  // ----------------------------------------------------------
  // ADD EXPENSE
  // POST /api/expenses
  // ----------------------------------------------------------

  addExpense: async (expenseData) => {
    return await API.post(
      '/expenses',
      expenseData
    );
  },

  // ----------------------------------------------------------
  // DELETE EXPENSE
  // DELETE /api/expenses/:id
  // ----------------------------------------------------------

  deleteExpense: async (id) => {
    return await API.delete(
      `/expenses/${id}`
    );
  }
};

// ============================================================
// CALCULATOR SERVICE
// ============================================================

export const calculatorService = {

  calculate: async (calcData) => {

    // Try backend calculation first.
    try {
      const serverRes = await API.post(
        '/calculator',
        calcData
      );

      return serverRes;

    } catch (error) {

      console.warn(
        'Calculator API unavailable. Using local calculation.',
        error
      );
    }

    // --------------------------------------------------------
    // LOCAL FALLBACK CALCULATION
    // --------------------------------------------------------

    const materialCost =
      Number(calcData.materialCost || 0);

    const labourCost =
      Number(calcData.labourCost || 0);

    const packagingCost =
      Number(calcData.packagingCost || 0);

    const transportCost =
      Number(calcData.transportCost || 0);

    const otherCost =
      Number(calcData.otherCost || 0);

    const sellingPrice =
      Number(calcData.sellingPrice || 0);

    const totalCost =
      materialCost +
      labourCost +
      packagingCost +
      transportCost +
      otherCost;

    const profit =
      sellingPrice -
      totalCost;

    const profitMargin =
      sellingPrice > 0
        ? Number(
            (
              (profit / sellingPrice) *
              100
            ).toFixed(1)
          )
        : 0;

    const markup =
      totalCost > 0
        ? Number(
            (
              (profit / totalCost) *
              100
            ).toFixed(1)
          )
        : 0;

    const breakEvenUnits =
      profit > 0
        ? Math.ceil(5000 / profit)
        : 0;

    const result = {
      productName:
        calcData.productName ||
        'Custom Product',

      materialCost,
      labourCost,
      packagingCost,
      transportCost,
      otherCost,

      totalCost,
      sellingPrice,
      profit,
      profitMargin,
      markup,
      breakEvenUnits,

      isHealthy:
        profitMargin >= 20
    };

    return {
      success: true,
      data: result,
      message:
        'Calculation performed locally'
    };
  }
};

// ============================================================
// GOVERNMENT SCHEME SERVICE
// ============================================================

export const schemeService = {

  // ----------------------------------------------------------
  // GET SCHEMES
  // GET /api/schemes
  // ----------------------------------------------------------

  getSchemes: async (
    params = {}
  ) => {
    try {
      return await API.get(
        '/schemes',
        {
          params
        }
      );

    } catch (error) {

      console.warn(
        'Schemes API unavailable. Using local scheme data.'
      );

      let list = [
        ...GOVERNMENT_SCHEMES
      ];

      if (
        params.category &&
        params.category !== 'All'
      ) {
        list = list.filter(
          (scheme) =>
            scheme.category
              ?.toLowerCase()
              .includes(
                params.category.toLowerCase()
              )
        );
      }

      return {
        success: true,
        data: list,
        message:
          'Government schemes loaded'
      };
    }
  },

  // ----------------------------------------------------------
  // GET SCHEME BY ID
  // GET /api/schemes/:id
  // ----------------------------------------------------------

  getSchemeById: async (id) => {
    try {
      return await API.get(
        `/schemes/${id}`
      );

    } catch (error) {

      console.warn(
        'Scheme details API unavailable. Using local scheme data.'
      );

      const found =
        GOVERNMENT_SCHEMES.find(
          (scheme) =>
            scheme._id === id ||
            scheme.id === id
        ) ||
        GOVERNMENT_SCHEMES[0];

      return {
        success: true,
        data: found,
        message:
          'Scheme details'
      };
    }
  },

  // ----------------------------------------------------------
  // RECOMMEND SCHEMES
  // POST /api/schemes/recommend
  // ----------------------------------------------------------

  recommendSchemes: async (
    businessData
  ) => {
    try {
      return await API.post(
        '/schemes/recommend',
        businessData
      );

    } catch (error) {

      console.warn(
        'Scheme recommendation API unavailable. Using local data.'
      );

      return {
        success: true,
        data:
          GOVERNMENT_SCHEMES.slice(
            0,
            4
          ),
        message:
          'Recommended government schemes'
      };
    }
  }
};

// ============================================================
// AI SERVICE
// ============================================================

export const aiService = {

  // ----------------------------------------------------------
  // BUSINESS RECOMMENDATION
  // POST /api/ai/business-recommendation
  // ----------------------------------------------------------

  getBusinessRecommendation:
    async (discoveryInputs) => {

      try {
        return await API.post(
          '/ai/business-recommendation',
          discoveryInputs
        );

      } catch (error) {

        console.warn(
          'AI recommendation API unavailable. Using demo recommendation.'
        );

        const budget =
          Number(
            discoveryInputs.budget || 40000
          );

        const customized =
          JSON.parse(
            JSON.stringify(
              SAMPLE_RECOMMENDATION
            )
          );

        if (
          customized.recommendedBusiness
        ) {

          customized
            .recommendedBusiness
            .estimatedBudget =
            budget;

          if (
            customized
              .recommendedBusiness
              .operatingMetrics
          ) {

            customized
              .recommendedBusiness
              .operatingMetrics
              .estimatedStartupBudget =
              budget;
          }

          if (
            discoveryInputs.location
          ) {

            customized
              .recommendedBusiness
              .locationReasoning =
              `${discoveryInputs.location} (${discoveryInputs.state || 'Andhra Pradesh'}) has growing consumer demand and access to local markets.`;
          }
        }

        return {
          success: true,
          data: customized,
          message:
            'AI recommendations generated'
        };
      }
    },

  // ----------------------------------------------------------
  // BUSINESS AREA OPPORTUNITIES
  // POST /api/ai/business-area-opportunities
  // ----------------------------------------------------------

  getBusinessAreaOpportunities:
    async (locationData) => {

      return await API.post(
        '/ai/business-area-opportunities',
        locationData
      );
    },

  // ----------------------------------------------------------
  // AI CHAT
  // POST /api/ai/chat
  // ----------------------------------------------------------

  chat: async (chatPayload) => {
    return await API.post(
      '/ai/chat',
      chatPayload
    );
  },

  // ----------------------------------------------------------
  // MARKETING CONTENT
  // POST /api/ai/marketing
  // ----------------------------------------------------------

  generateMarketingContent:
    async (marketingInputs) => {

      try {
        return await API.post(
          '/ai/marketing',
          marketingInputs
        );

      } catch (error) {

        console.warn(
          'Marketing AI API unavailable. Using local fallback.'
        );

        const {
          product,
          discount,
          language
        } = marketingInputs;

        const lang =
          language || 'en';

        let whatsappMessage = '';
        let socialPost = '';
        let posterText = '';

        if (lang === 'te') {

          whatsappMessage =
            `రుచికరమైన ${product || 'హోమ్‌మేడ్ ఫుడ్'} ఇప్పుడు మీ ముంగిట! 🌶️🥭\n\nస్వచ్ఛమైన పదార్థాలతో సాంప్రదాయ పద్ధతిలో తయారు చేసిన నాణ్యమైన ఉత్పత్తి.\n\n✨ ప్రత్యేక ఆఫర్: ${discount || 'ఈరోజే ఆర్డర్ చేయండి'}\n\n📍 స్థానిక డెలివరీ అందుబాటులో ఉంది.`;

          socialPost =
            `సాంప్రదాయ రుచిని మీ ఇంటికి తీసుకురండి! ❤️\n\n${product || 'హోమ్‌మేడ్ ఫుడ్'}\n\n👉 ప్రత్యేక ఆఫర్: ${discount || 'ఈరోజే ఆర్డర్ చేయండి'}\n\n#HomemadeFood #VocalForLocal #VyaparMitra`;

          posterText =
            `🎉 ప్రత్యేక ఆఫర్! 🎉\n\n${product || 'హోమ్‌మేడ్ ఫుడ్'}\n\nనాణ్యమైన పదార్థాలతో తయారు చేసిన ఉత్పత్తి\n\nఆఫర్: ${discount || 'ప్రత్యేక ధర'}`;

        } else {

          whatsappMessage =
            `Fresh & Authentic ${product || 'Homemade Food'} at your doorstep! 🌶️🥭\n\nPrepared using quality ingredients and traditional methods.\n\n✨ Special Offer: ${discount || 'Order today'}\n\n📍 Local delivery available.`;

          socialPost =
            `Taste authentic homemade goodness! ❤️\n\n${product || 'Homemade Food'} made with quality ingredients.\n\n👉 Special Offer: ${discount || 'Order today'}\n\n#HomemadeFood #VocalForLocal #VyaparMitra`;

          posterText =
            `🎉 SPECIAL OFFER! 🎉\n\n${product || 'Homemade Food'}\n\nQuality Ingredients • Traditional Preparation\n\nSpecial Price: ${discount || 'Ask us today'}`;
        }

        return {
          success: true,
          data: {
            whatsappMessage,
            socialPost,
            posterText
          },
          message:
            'Marketing copy generated successfully'
        };
      }
    }
};

// ============================================================
// DASHBOARD SERVICE
// ============================================================

// The current Dashboard calculates its data directly
// from BusinessContext's real sales/expenses arrays.
//
// This service is kept for components that still call
// dashboardService.getDashboardData().
//
// Backend endpoint:
// GET /api/dashboard

// ============================================================

export const dashboardService = {

  getDashboardData: async () => {
    return await API.get(
      '/dashboard'
    );
  }
};