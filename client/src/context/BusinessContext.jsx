import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import {
  businessService,
  productService,
  salesService,
  expenseService,
  locationService
} from '../services/api.js';

import { useAuth } from './AuthContext.jsx';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [location, setLocation] = useState(null);
  const [nearbyMarkets, setNearbyMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  // ============================================================
  // LOAD ALL BUSINESS DATA
  // ============================================================

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) {
      setBusiness(null);
      setProducts([]);
      setSales([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // ----------------------------------------------------------
      // Load each resource independently.
      // One failed API must NOT erase the others.
      // ----------------------------------------------------------

      const results = await Promise.allSettled([
        businessService.getBusiness(),
        productService.getProducts(),
        salesService.getSales(),
        expenseService.getExpenses()
      ]);

      // ----------------------------------------------------------
      // Business
      // ----------------------------------------------------------

      const bizResult = results[0];

      if (bizResult.status === 'fulfilled') {
        const bizRes = bizResult.value;

        if (
          bizRes?.success &&
          bizRes.business
        ) {
          setBusiness(bizRes.business);
        } else {
          setBusiness(null);
        }
      } else {
        const status = bizResult.reason?.response?.status;

        if (status === 404) {
          setBusiness(null);
        } else {
          console.error(
            'Failed to load business:',
            bizResult.reason
          );
        }
      }

      // ----------------------------------------------------------
      // Products
      // ----------------------------------------------------------

      const productResult = results[1];

      if (productResult.status === 'fulfilled') {
        const prodRes =
          productResult.value;

        if (prodRes?.success) {
          const productList =
            prodRes.products ||
            prodRes.data ||
            [];

          if (Array.isArray(productList)) {
            setProducts(productList);
          }
        } else {
          console.error(
            'Products API returned unsuccessful response:',
            prodRes
          );
        }
      } else {
        console.error(
          'Failed to load products:',
          productResult.reason
        );
      }

      // ----------------------------------------------------------
      // Sales
      // ----------------------------------------------------------

      const salesResult = results[2];

      if (salesResult.status === 'fulfilled') {
        const salesRes =
          salesResult.value;

        if (salesRes?.success) {
          const salesList =
            salesRes.sales ||
            salesRes.data ||
            [];

          if (Array.isArray(salesList)) {
            setSales(salesList);
          }
        } else {
          console.error(
            'Sales API returned unsuccessful response:',
            salesRes
          );
        }
      } else {
        console.error(
          'Failed to load sales:',
          salesResult.reason
        );
      }

      // ----------------------------------------------------------
      // Expenses
      // ----------------------------------------------------------

      const expenseResult = results[3];

      if (expenseResult.status === 'fulfilled') {
        const expRes =
          expenseResult.value;

        if (expRes?.success) {
          const expenseList =
            expRes.expenses ||
            expRes.data ||
            [];

          if (Array.isArray(expenseList)) {
            setExpenses(expenseList);
          }
        } else {
          console.error(
            'Expenses API returned unsuccessful response:',
            expRes
          );
        }
      } else {
        console.error(
          'Failed to load expenses:',
          expenseResult.reason
        );
      }

    } catch (err) {
      console.error(
        'Error refreshing business context:',
        err
      );

      // IMPORTANT:
      // Do NOT clear products/sales/expenses here.
      // Existing valid state should remain intact.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ============================================================
  // LOAD DATA AFTER AUTHENTICATION
  // ============================================================

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setBusiness(null);
      setProducts([]);
      setSales([]);
      setExpenses([]);
      setLoading(false);
    }
  }, [
    isAuthenticated,
    refreshAll
  ]);

  // ============================================================
  // LOAD SAVED LOCATION
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation(null);
      return;
    }

    locationService
      .getLocation()
      .then((res) => {
        if (
          res?.success &&
          res.data
        ) {
          setLocation(res.data);
        } else {
          setLocation(null);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;

        if (status === 404) {
          setLocation(null);
        } else {
          console.error(
            'Error loading location:',
            err
          );
        }

        setLocation(null);
      });
  }, [isAuthenticated]);

  // ============================================================
  // SAVE LOCATION
  // ============================================================

  const saveLocation = async (
    latitude,
    longitude
  ) => {
    const res =
      await locationService.saveLocation(
        latitude,
        longitude
      );

    const savedLocation =
      res?.data ||
      res?.location ||
      res;

    setLocation(savedLocation);

    return savedLocation;
  };

  // ============================================================
  // LOAD NEARBY MARKETS
  // ============================================================

  const loadNearbyMarkets = async () => {
    try {
      const res =
        await locationService.getNearbyMarkets();

      const markets =
        res?.data ||
        res?.markets ||
        [];

      const marketList =
        Array.isArray(markets)
          ? markets
          : [];

      setNearbyMarkets(marketList);

      return marketList;
    } catch (err) {
      console.error(
        'Error loading nearby markets:',
        err
      );

      setNearbyMarkets([]);

      return [];
    }
  };

  // ============================================================
  // UPDATE BUSINESS
  // ============================================================

  const updateBusiness = async (data) => {
    if (!business?.id) {
      return {
        success: false,
        message: 'Business not found'
      };
    }

    const res =
      await businessService.updateBusiness(
        business.id,
        data
      );

    if (res?.success) {
      const updatedBusiness =
        res.business ||
        res.data;

      if (updatedBusiness) {
        setBusiness(updatedBusiness);
      }
    }

    return res;
  };

  // ============================================================
  // ADD PRODUCT
  // ============================================================

  const addProduct = async (
    productData
  ) => {
    try {
      const res =
        await productService.addProduct(
          productData
        );

      if (res?.success) {
        const newProduct =
          res.product ||
          res.data;

        if (newProduct) {
          setProducts((prev) => [
            newProduct,
            ...prev
          ]);
        } else {
          await refreshAll();
        }
      }

      return res;

    } catch (err) {
      console.error(
        'Error adding product:',
        err
      );

      throw err;
    }
  };

  // ============================================================
  // UPDATE PRODUCT
  // ============================================================

  const updateProduct = async (
    id,
    productData
  ) => {
    try {
      const res =
        await productService.updateProduct(
          id,
          productData
        );

      if (res?.success) {
        const updatedProduct =
          res.product ||
          res.data;

        if (updatedProduct) {
          setProducts((prev) =>
            prev.map((product) => {
              const productId =
                product.id ||
                product._id;

              return String(productId) ===
                String(id)
                ? updatedProduct
                : product;
            })
          );
        } else {
          await refreshAll();
        }
      }

      return res;

    } catch (err) {
      console.error(
        'Error updating product:',
        err
      );

      throw err;
    }
  };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const deleteProduct = async (
    id
  ) => {
    try {
      const res =
        await productService.deleteProduct(
          id
        );

      if (res?.success) {
        setProducts((prev) =>
          prev.filter((product) => {
            const productId =
              product.id ||
              product._id;

            return String(productId) !==
              String(id);
          })
        );
      }

      return res;

    } catch (err) {
      console.error(
        'Error deleting product:',
        err
      );

      throw err;
    }
  };

  // ============================================================
  // ADD SALE
  // ============================================================

  const addSale = async (
    saleData
  ) => {
    try {
      const res =
        await salesService.addSale(
          saleData
        );

      if (res?.success) {
        const newSale =
          res.sale ||
          res.data;

        if (newSale) {
          setSales((prev) => [
            newSale,
            ...prev
          ]);
        }

        // Refresh products, sales, etc.
        // without allowing one failed request
        // to erase the others.
        await refreshAll();
      }

      return res;

    } catch (err) {
      console.error(
        'Error adding sale:',
        err
      );

      throw err;
    }
  };

  // ============================================================
  // ADD EXPENSE
  // ============================================================

  const addExpense = async (
    expData
  ) => {
    try {
      const res =
        await expenseService.addExpense(
          expData
        );

      if (res?.success) {
        const newExpense =
          res.expense ||
          res.data;

        if (newExpense) {
          setExpenses((prev) => [
            newExpense,
            ...prev
          ]);
        }

        await refreshAll();
      }

      return res;

    } catch (err) {
      console.error(
        'Error adding expense:',
        err
      );

      throw err;
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <BusinessContext.Provider
      value={{
        business,
        products,
        sales,
        expenses,
        loading,

        refreshAll,

        updateBusiness,

        addProduct,
        updateProduct,
        deleteProduct,

        addSale,
        addExpense,

        location,
        nearbyMarkets,
        saveLocation,
        loadNearbyMarkets
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () =>
  useContext(BusinessContext);