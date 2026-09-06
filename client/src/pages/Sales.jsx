import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import Modal from '../components/common/Modal.jsx';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { PlusCircle, Search, ArrowUpRight } from 'lucide-react';

const blankSale = {
  productId: '',
  productName: '',
  quantity: '',
  sellingPrice: '',
  amount: '',
  customerName: '',
  paymentMethod: ''
};

const Sales = () => {
  const { t } = useLanguage();
  const {
    sales,
    addSale,
    products
  } = useBusiness();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(blankSale);

  // -----------------------------------------
  // Total sales amount
  // -----------------------------------------
  const totalSalesAmount = sales.reduce(
    (acc, sale) =>
      acc +
      Number(
        sale.amount ??
        sale.total_amount ??
        0
      ),
    0
  );

  // -----------------------------------------
  // Get product by ID
  // -----------------------------------------
  const getProductById = (productId) => {
    if (!productId) return null;

    return products.find(
      (product) =>
        String(product.id || product._id) ===
        String(productId)
    );
  };

  // -----------------------------------------
  // Get product name for a sale
  // -----------------------------------------
  const getSaleProductName = (sale) => {
    if (sale.productName) {
      return sale.productName;
    }

    if (sale.product_name) {
      return sale.product_name;
    }

    const product = getProductById(
      sale.product_id ||
      sale.productId
    );

    return product?.name || 'Product';
  };

  // -----------------------------------------
  // Filter sales
  // -----------------------------------------
  const filteredSales = sales.filter((sale) => {
    const productName =
      getSaleProductName(sale);

    const customer =
      sale.customer ||
      sale.customerName ||
      sale.customer_name ||
      '';

    const query =
      searchTerm.trim().toLowerCase();

    return (
      productName
        .toLowerCase()
        .includes(query) ||
      customer
        .toLowerCase()
        .includes(query)
    );
  });

  // -----------------------------------------
  // Calculate amount
  // -----------------------------------------
  const updateAmount = (nextData) => {
    const product = getProductById(
      nextData.productId
    );

    const sellingPrice = Number(
      product?.sellingPrice ??
      product?.selling_price ??
      0
    );

    const quantity = Number(
      nextData.quantity || 0
    );

    return {
      ...nextData,
      sellingPrice,
      amount:
        quantity * sellingPrice
    };
  };

  // -----------------------------------------
  // Product changed
  // -----------------------------------------
  const handleProductChange = (event) => {
    const productId =
      event.target.value;

    const product =
      getProductById(productId);

    const sellingPrice = Number(
      product?.sellingPrice ??
      product?.selling_price ??
      0
    );

    setFormData({
      ...formData,
      productId,
      productName:
        product?.name || '',
      sellingPrice,
      amount:
        Number(formData.quantity || 0) *
        sellingPrice
    });
  };

  // -----------------------------------------
  // Quantity changed
  // -----------------------------------------
  const handleQuantityChange = (event) => {
    const quantity =
      event.target.value;

    setFormData(
      updateAmount({
        ...formData,
        quantity
      })
    );
  };

  // -----------------------------------------
  // Submit sale
  // -----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    const product =
      getProductById(
        formData.productId
      );

    if (!product) {
      alert('Please select a product');
      return;
    }

    const productId =
      product.id || product._id;

    const sellingPrice = Number(
      product.sellingPrice ??
      product.selling_price ??
      formData.sellingPrice ??
      0
    );

    const quantity = Number(
      formData.quantity
    );

    if (!productId) {
      alert('Product ID is missing');
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      alert(
        'Quantity must be a whole number greater than 0'
      );
      return;
    }

    if (
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      alert('Selling price is invalid');
      return;
    }

    // -----------------------------------------
    // Payload matching salesController.js
    // -----------------------------------------
    const payload = {
      productId,
      quantity,
      sellingPrice,
      customerName:
        formData.customerName?.trim() ||
        'Walk-in Customer'
    };

    console.log(
      'Saving sale:',
      payload
    );

    try {
      const response =
        await addSale(payload);

      console.log(
        'Sale response:',
        response
      );

      if (
        response?.success === false
      ) {
        alert(
          response.message ||
          'Could not record sale'
        );
        return;
      }

      // Close modal
      setModalOpen(false);

      // Reset form
      setFormData({
        ...blankSale
      });

    } catch (error) {
      console.error(
        'Save sale error:',
        error
      );

      alert(
        error?.response?.data?.message ||
        error?.message ||
        'Could not record sale'
      );
    }
  };

  // -----------------------------------------
  // Open sale modal
  // -----------------------------------------
  const openSaleModal = () => {
    setFormData({
      ...blankSale
    });

    setModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.nav?.sales || 'Sales Tracking'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Record every customer order and track income in real time
          </p>
        </div>

        <button
          type="button"
          onClick={openSaleModal}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" />

          {t.dashboard?.logSale ||
            'Log New Sale'}
        </button>

      </div>


      {/* Sales Summary */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 flex items-center justify-between gap-4">

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Recorded Sales Volume
          </span>

          <h3 className="text-3xl font-black text-emerald-900 mt-1">
            {formatCurrency(
              totalSalesAmount
            )}
          </h3>

          <p className="text-xs text-emerald-700 mt-0.5">
            {sales.length} transactions recorded
          </p>
        </div>

        <div className="p-3 bg-emerald-100/80 text-emerald-700 rounded-2xl">
          <ArrowUpRight className="w-8 h-8" />
        </div>

      </div>


      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">

        <Search className="w-4 h-4 text-slate-400 ml-2" />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          placeholder="Search by product or customer name..."
          className="flex-1 text-xs sm:text-sm bg-transparent outline-none font-medium"
        />

      </div>


      {/* Sales Table */}
      {filteredSales.length === 0 ? (

        <EmptyState
          title="No sales found"
          description="Log your first sale to start tracking your daily revenue."
          actionLabel="Log a Sale Now"
          onAction={openSaleModal}
        />

      ) : (

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs sm:text-sm">

              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">

                <tr>

                  <th className="p-4">
                    Product
                  </th>

                  <th className="p-4">
                    Customer
                  </th>

                  <th className="p-4">
                    Date
                  </th>

                  <th className="p-4">
                    Payment
                  </th>

                  <th className="p-4 text-right">
                    Quantity
                  </th>

                  <th className="p-4 text-right">
                    Amount (₹)
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">

                {filteredSales.map(
                  (sale) => {

                    const productName =
                      getSaleProductName(
                        sale
                      );

                    const customer =
                      sale.customer ||
                      sale.customerName ||
                      sale.customer_name ||
                      'Direct Retail';

                    const amount =
                      Number(
                        sale.amount ??
                        sale.total_amount ??
                        0
                      );

                    const quantity =
                      Number(
                        sale.quantity || 0
                      );

                    const payment =
                      sale.paymentMethod ||
                      sale.payment_method ||
                      'Cash';

                    const saleId =
                      sale.id ||
                      sale._id ||
                      `${productName}-${sale.date}`;

                    return (
                      <tr
                        key={saleId}
                        className="hover:bg-slate-50/80"
                      >

                        <td className="p-4 font-bold text-slate-900">
                          {productName}
                        </td>

                        <td className="p-4">
                          {customer}
                        </td>

                        <td className="p-4 text-slate-400">
                          {formatDate(
                            sale.date ||
                            sale.created_at
                          )}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px]">
                            {payment}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {quantity}
                        </td>

                        <td className="p-4 text-right font-black text-emerald-700">
                          {formatCurrency(
                            amount
                          )}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}


      {/* Add Sale Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title="Log New Sale Record"
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Product */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product
            </label>

            <select
              required
              value={formData.productId}
              onChange={
                handleProductChange
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >

              <option
                value=""
                disabled
              >
                Select a product
              </option>

              {products.map(
                (product) => {

                  const productId =
                    product.id ||
                    product._id;

                  const sellingPrice =
                    Number(
                      product.sellingPrice ??
                      product.selling_price ??
                      0
                    );

                  return (
                    <option
                      key={productId}
                      value={productId}
                    >
                      {product.name} (
                      {formatCurrency(
                        sellingPrice
                      )}
                      )
                    </option>
                  );
                }
              )}

            </select>

          </div>


          {/* Quantity + Total */}
          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                required
                value={formData.quantity}
                onChange={
                  handleQuantityChange
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Amount (₹)
              </label>

              <input
                type="number"
                min="0"
                readOnly
                value={formData.amount}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm"
              />

            </div>

          </div>


          {/* Customer */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">

              <span>
                Customer Name
              </span>

              <VoiceInputButton
                onTranscript={(text) =>
                  setFormData({
                    ...formData,
                    customerName:
                      text
                  })
                }
                className="p-1"
              />

            </label>

            <input
              type="text"
              value={formData.customerName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  customerName:
                    event.target.value
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="e.g. Weekly market customer"
            />

          </div>


          {/* Payment Method */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method
            </label>

            <select
              required
              value={formData.paymentMethod}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  paymentMethod:
                    event.target.value
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >

              <option
                value=""
                disabled
              >
                Select payment method
              </option>

              <option value="UPI / PhonePe">
                UPI / PhonePe / GPay
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Credit / Khata">
                Credit / Khata
              </option>

            </select>

          </div>


          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm"
          >
            Save Sale
          </button>

        </form>

      </Modal>

    </div>
  );
};

export default Sales;