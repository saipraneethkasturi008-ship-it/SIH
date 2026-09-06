import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import Modal from '../components/common/Modal.jsx';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  Receipt,
  PlusCircle,
  Search,
  ArrowDownRight
} from 'lucide-react';

const Expenses = () => {
  const { t } = useLanguage();
  const { expenses, addExpense } = useBusiness();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [formData, setFormData] = useState({
    category: 'Raw Materials',
    amount: '',
    description: ''
  });

  const totalExpenseAmount = expenses.reduce(
    (acc, e) => acc + Number(e.amount || 0),
    0
  );

  const categories = [
    'All',
    'Raw Materials',
    'Packaging',
    'Labour',
    'Transportation',
    'Electricity & Gas',
    'Marketing'
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchCategory =
      selectedCategory === 'All' ||
      e.category === selectedCategory;

    const matchSearch = (e.description || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchCategory && matchSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description.trim()
      };

      await addExpense(payload);

      setModalOpen(false);

      setFormData({
        category: 'Raw Materials',
        amount: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.nav?.expenses || 'Expense Management'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Keep track of operational expenses, raw supplies and transport costs
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm self-start sm:self-auto transition-colors"
        >
          <PlusCircle className="w-4 h-4" />

          <span>
            {t.dashboard?.logExpense || 'Log Expense'}
          </span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-orange-50/70 border border-orange-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
            Total Logged Expenses
          </span>

          <h3 className="text-3xl font-black text-orange-900 mt-1">
            {formatCurrency(totalExpenseAmount)}
          </h3>

          <p className="text-xs text-orange-700 mt-0.5">
            {expenses.length} expense items recorded
          </p>
        </div>

        <div className="p-3 bg-orange-100/80 text-orange-700 rounded-2xl">
          <ArrowDownRight className="w-8 h-8" />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 ml-2" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search expenses by description..."
          className="flex-1 text-xs sm:text-sm bg-transparent outline-none font-medium"
        />
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description="No expenses match your current filters."
          actionLabel="Log an Expense"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Amount (₹)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900">
                      {exp.description}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold">
                        {exp.category}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatDate(exp.date)}
                    </td>

                    <td className="p-4 text-right font-black text-slate-900">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Business Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value
                })
              }
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
            >
              <option value="Raw Materials">
                Raw Materials
              </option>

              <option value="Packaging">
                Packaging
              </option>

              <option value="Labour">
                Labour / Making
              </option>

              <option value="Transportation">
                Transportation / Auto
              </option>

              <option value="Electricity & Gas">
                Electricity & Gas
              </option>

              <option value="Marketing">
                Marketing / Labels
              </option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Amount (₹)
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              placeholder="e.g. 500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Expense Description</span>

              <VoiceInputButton
                onTranscript={(text) =>
                  setFormData({
                    ...formData,
                    description: text
                  })
                }
                className="p-1"
              />
            </label>

            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              placeholder="e.g. 50 Glass jars from local supplier"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
          >
            Save Expense
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;