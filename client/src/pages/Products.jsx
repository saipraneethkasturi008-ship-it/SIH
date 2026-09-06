import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatCurrency } from '../utils/formatters.js';
import Modal from '../components/common/Modal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';
import {
  Package,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  TrendingUp
} from 'lucide-react';

const emptyProduct = {
  name: '',
  category: 'Food Products',
  costPrice: 0,
  sellingPrice: 0,
  stock: 0,
  unit: 'piece',
  description: ''
};

const Products = () => {
  const { t } = useLanguage();

  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  } = useBusiness();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyProduct);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.toLowerCase();

    return (
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyProduct
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id || product.id);

    setFormData({
      ...emptyProduct,
      ...product,

      // Convert backend field names to frontend field names
      costPrice:
        product.costPrice ??
        product.cost ??
        0,

      sellingPrice:
        product.sellingPrice ??
        product.selling_price ??
        0,

      stock:
        product.stock ??
        product.quantity ??
        0
    });

    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      /*
       * Frontend uses:
       * costPrice
       * sellingPrice
       * stock
       *
       * Backend expects:
       * cost
       * selling_price
       * quantity
       */

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit,
        description: formData.description,

        cost: Number(formData.costPrice),
        selling_price: Number(formData.sellingPrice),
        quantity: Number(formData.stock)
      };

      console.log('Saving product:', payload);

      let result;

      if (editingId) {
        result = await updateProduct(
          editingId,
          payload
        );
      } else {
        result = await addProduct(
          payload
        );
      }

      console.log('Product save response:', result);

      if (result?.success === false) {
        alert(
          result.message ||
          'Unable to save product.'
        );
        return;
      }

      setFormData({
        ...emptyProduct
      });

      setEditingId(null);
      setModalOpen(false);

    } catch (error) {
      console.error(
        'Product save error:',
        error
      );

      alert(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to save product.'
      );
    }
  };

  const handleDelete = async (product) => {
    const productId =
      product._id ||
      product.id;

    if (
      window.confirm(
        `Delete ${product.name}?`
      )
    ) {
      await deleteProduct(productId);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.nav?.products || 'Products'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Manage your products, prices, and available stock.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </button>

      </div>


      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Products
          </p>

          <p className="text-2xl font-black text-slate-900 mt-1">
            {products.length}
          </p>
        </div>


        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Items In Stock
          </p>

          <p className="text-2xl font-black text-slate-900 mt-1">
            {products.reduce(
              (total, product) =>
                total +
                Number(
                  product.stock ??
                  product.quantity ??
                  0
                ),
              0
            )}
          </p>
        </div>


        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">

          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Average Margin
          </p>

          <p className="text-2xl font-black text-emerald-900 mt-1">

            {products.length
              ? `${Math.round(
                  products.reduce(
                    (total, product) => {
                      const sellingPrice =
                        Number(
                          product.sellingPrice ??
                          product.selling_price ??
                          0
                        );

                      const costPrice =
                        Number(
                          product.costPrice ??
                          product.cost ??
                          0
                        );

                      return (
                        total +
                        (
                          (sellingPrice -
                            costPrice) /
                          Math.max(
                            sellingPrice,
                            1
                          )
                        ) *
                        100
                      );
                    },
                    0
                  ) /
                    products.length
                )}%`
              : '0%'}

          </p>

        </div>

      </div>


      {/* SEARCH */}
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
          placeholder="Search by product or category..."
          className="flex-1 text-xs sm:text-sm bg-transparent outline-none font-medium"
        />

      </div>


      {/* PRODUCT LIST */}
      {filteredProducts.length === 0 ? (

        <EmptyState
          icon={Package}
          title="No products found"
          description="Add your first product to keep prices and stock in one place."
          actionLabel="Add a Product"
          onAction={openAddModal}
        />

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filteredProducts.map((product) => {

            const costPrice =
              Number(
                product.costPrice ??
                product.cost ??
                0
              );

            const sellingPrice =
              Number(
                product.sellingPrice ??
                product.selling_price ??
                0
              );

            const stock =
              Number(
                product.stock ??
                product.quantity ??
                0
              );

            const margin =
              sellingPrice -
              costPrice;

            const productId =
              product._id ||
              product.id;

            return (
              <article
                key={productId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                      {product.category}
                    </span>

                    <h2 className="text-base font-black text-slate-900 mt-1 truncate">
                      {product.name}
                    </h2>

                  </div>


                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(product)
                      }
                      aria-label={`Edit ${product.name}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(product)
                      }
                      aria-label={`Delete ${product.name}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>


                <div className="grid grid-cols-2 gap-3 mt-5">

                  <div className="bg-slate-50 rounded-xl p-3">

                    <p className="text-[11px] text-slate-500">
                      Cost price
                    </p>

                    <p className="font-black text-slate-900">
                      {formatCurrency(
                        costPrice
                      )}
                    </p>

                  </div>


                  <div className="bg-orange-50 rounded-xl p-3">

                    <p className="text-[11px] text-orange-700">
                      Selling price
                    </p>

                    <p className="font-black text-orange-900">
                      {formatCurrency(
                        sellingPrice
                      )}
                    </p>

                  </div>

                </div>


                <div className="flex items-center justify-between mt-4 text-xs font-semibold">

                  <span className="flex items-center gap-1.5 text-slate-500">

                    <Package className="w-4 h-4" />

                    {stock}{' '}
                    {product.unit || 'items'} in stock

                  </span>


                  <span
                    className={
                      margin > 0
                        ? 'text-emerald-700 flex items-center gap-1'
                        : 'text-rose-600 flex items-center gap-1'
                    }
                  >

                    <TrendingUp className="w-3.5 h-3.5" />

                    {formatCurrency(
                      margin
                    )}{' '}
                    margin

                  </span>

                </div>


                {product.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mt-4 border-t border-slate-100 pt-3">
                    {product.description}
                  </p>
                )}

              </article>
            );
          })}

        </div>

      )}


      {/* PRODUCT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title={
          editingId
            ? 'Edit Product'
            : 'Add Product'
        }
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* PRODUCT NAME */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">

              <span>
                Product name
              </span>

              <VoiceInputButton
                onTranscript={(text) =>
                  setFormData({
                    ...formData,
                    name: text
                  })
                }
                className="p-1"
              />

            </label>


            <input
              required
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value
                })
              }
              placeholder="e.g. Mango Pickle - 1kg"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />

          </div>


          {/* CATEGORY + UNIT */}
          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>

              <input
                required
                value={formData.category}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    category:
                      event.target.value
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit
              </label>

              <input
                required
                value={formData.unit}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    unit:
                      event.target.value
                  })
                }
                placeholder="kg, jar, piece"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />

            </div>

          </div>


          {/* PRICE + STOCK */}
          <div className="grid grid-cols-3 gap-3">

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cost (₹)
              </label>

              <input
                type="number"
                min="0"
                required
                value={formData.costPrice}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    costPrice:
                      event.target.value
                  })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling (₹)
              </label>

              <input
                type="number"
                min="0"
                required
                value={formData.sellingPrice}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    sellingPrice:
                      event.target.value
                  })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock
              </label>

              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    stock:
                      event.target.value
                  })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              />

            </div>

          </div>


          {/* DESCRIPTION */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>

            <textarea
              rows="3"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description:
                    event.target.value
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />

          </div>


          {/* SAVE */}
          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm shadow-md"
          >
            {editingId
              ? 'Update Product'
              : 'Save Product'}
          </button>

        </form>

      </Modal>

    </div>
  );
};

export default Products;