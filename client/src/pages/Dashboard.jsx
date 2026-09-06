import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { DEMO_AI_INSIGHTS } from '../data/mockData.js';
import { formatCurrency } from '../utils/formatters.js';
import MetricCard from '../components/common/MetricCard.jsx';
import HealthScoreBadge from '../components/common/HealthScoreBadge.jsx';
import Modal from '../components/common/Modal.jsx';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

import {
  TrendingUp,
  Receipt,
  DollarSign,
  Sparkles,
  PlusCircle,
  Calculator,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Circle,
  Calendar
} from 'lucide-react';

/* ============================================================
   HELPERS
============================================================ */

const getRecordDate = (record) => {
  return (
    record?.date ||
    record?.created_at ||
    record?.createdAt ||
    null
  );
};

const getAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const isInCurrentMonth = (record) => {
  const rawDate = getRecordDate(record);

  if (!isValidDate(rawDate)) {
    return false;
  }

  const date = new Date(rawDate);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
};

const getMonthKey = (date) => {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
};

const getMonthLabel = (date) => {
  return date.toLocaleDateString('en-IN', {
    month: 'short'
  });
};

/* ============================================================
   DASHBOARD
============================================================ */

const Dashboard = () => {
  const { t, currentLanguage } = useLanguage();

  const {
    business,
    sales,
    expenses,
    products,
    addSale,
    addExpense
  } = useBusiness();

  /* ==========================================================
     STATE
  ========================================================== */

  const [actions, setActions] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);

  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  /* ==========================================================
     SALE FORM
  ========================================================== */

  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: '',
    sellingPrice: '',
    customerName: ''
  });

  /* ==========================================================
     EXPENSE FORM
  ========================================================== */

  const [expenseForm, setExpenseForm] = useState({
    category: 'Raw Materials',
    amount: '',
    description: ''
  });

  /* ==========================================================
     LOAD DEMO AI INSIGHT
     
     NOTE:
     This is temporary dashboard insight data.
     Real AI integration comes in Step 7.
  ========================================================== */

  useEffect(() => {
    const localized =
      DEMO_AI_INSIGHTS[currentLanguage] ||
      DEMO_AI_INSIGHTS.en;

    setAiInsight(localized);
    setActions(localized?.actions || []);
  }, [currentLanguage]);

  /* ==========================================================
     CURRENT MONTH DATA
  ========================================================== */

  const currentMonthSales = useMemo(() => {
    return (sales || []).filter(isInCurrentMonth);
  }, [sales]);

  const currentMonthExpenses = useMemo(() => {
    return (expenses || []).filter(isInCurrentMonth);
  }, [expenses]);

  /* ==========================================================
     FINANCIAL TOTALS
  ========================================================== */

  const totalSales = useMemo(() => {
    return currentMonthSales.reduce((total, sale) => {
      return (
        total +
        getAmount(
          sale?.total_amount ??
          sale?.totalAmount ??
          sale?.amount
        )
      );
    }, 0);
  }, [currentMonthSales]);

  const totalExpenses = useMemo(() => {
    return currentMonthExpenses.reduce((total, expense) => {
      return total + getAmount(expense?.amount);
    }, 0);
  }, [currentMonthExpenses]);

  const netProfit = totalSales - totalExpenses;

  /* ==========================================================
     PROFIT MARGIN
  ========================================================== */

  const profitMargin =
    totalSales > 0
      ? (netProfit / totalSales) * 100
      : 0;

  /* ==========================================================
     HEALTH SCORE
  ========================================================== */

  const healthScore = useMemo(() => {
    if (totalSales === 0 && totalExpenses === 0) {
      return 50;
    }

    let score = 50;

    if (netProfit > 0) {
      score += 20;
    } else if (netProfit < 0) {
      score -= 20;
    }

    if (profitMargin >= 30) {
      score += 20;
    } else if (profitMargin >= 15) {
      score += 10;
    } else if (profitMargin < 0) {
      score -= 10;
    }

    if (totalSales > totalExpenses) {
      score += 10;
    }

    return Math.max(
      0,
      Math.min(100, Math.round(score))
    );
  }, [
    totalSales,
    totalExpenses,
    netProfit,
    profitMargin
  ]);

  /* ==========================================================
     MONTHLY SALES / EXPENSE / PROFIT CHART
  ========================================================== */

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        key: getMonthKey(date),
        month: getMonthLabel(date),
        sales: 0,
        expenses: 0,
        profit: 0
      });
    }

    const monthMap = {};

    months.forEach((month) => {
      monthMap[month.key] = month;
    });

    /* SALES */

    (sales || []).forEach((sale) => {
      const rawDate = getRecordDate(sale);

      if (!isValidDate(rawDate)) {
        return;
      }

      const date = new Date(rawDate);
      const key = getMonthKey(date);

      if (!monthMap[key]) {
        return;
      }

      monthMap[key].sales += getAmount(
        sale?.total_amount ??
        sale?.totalAmount ??
        sale?.amount
      );
    });

    /* EXPENSES */

    (expenses || []).forEach((expense) => {
      const rawDate = getRecordDate(expense);

      if (!isValidDate(rawDate)) {
        return;
      }

      const date = new Date(rawDate);
      const key = getMonthKey(date);

      if (!monthMap[key]) {
        return;
      }

      monthMap[key].expenses += getAmount(
        expense?.amount
      );
    });

    /* PROFIT */

    months.forEach((month) => {
      month.profit =
        month.sales - month.expenses;
    });

    return months;
  }, [sales, expenses]);

  /* ==========================================================
     EXPENSE CATEGORY BREAKDOWN
  ========================================================== */

  const expenseChartData = useMemo(() => {
    const grouped = {};

    currentMonthExpenses.forEach((expense) => {
      const category =
        expense?.category || 'Other';

      if (!grouped[category]) {
        grouped[category] = 0;
      }

      grouped[category] += getAmount(
        expense?.amount
      );
    });

    const colors = [
      '#ea580c',
      '#f59e0b',
      '#64748b',
      '#059669',
      '#7c3aed',
      '#0284c7',
      '#dc2626'
    ];

    return Object.entries(grouped)
      .map(([name, value], index) => ({
        name,
        value,
        color:
          colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthExpenses]);

  /* ==========================================================
     EXPENSE CATEGORY TRANSLATION
  ========================================================== */

  const expenseCategoryKeys = {
    'Raw Materials': 'rawMaterials',
    Packaging: 'packaging',
    Labour: 'labour',
    Transportation: 'transportation',
    Transport: 'transportation',
    'Electricity & Gas': 'electricity',
    'Utilities / Gas': 'electricity',
    Marketing: 'marketing'
  };

  /* ==========================================================
     TOGGLE ACTION
  ========================================================== */

  const toggleAction = (id) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === id
          ? {
              ...action,
              done: !action.done
            }
          : action
      )
    );
  };

  /* ==========================================================
     PRODUCT SELECTION
  ========================================================== */

  const handleProductChange = (productId) => {
    const selectedProduct = products.find(
      (product) =>
        String(product.id) === String(productId)
    );

    setSaleForm((prev) => ({
      ...prev,
      productId,
      sellingPrice: selectedProduct
        ? Number(
            selectedProduct.selling_price ??
            selectedProduct.sellingPrice ??
            0
          )
        : ''
    }));
  };

  /* ==========================================================
     SALE TOTAL
  ========================================================== */

  const saleTotal = useMemo(() => {
    return (
      Number(saleForm.quantity || 0) *
      Number(saleForm.sellingPrice || 0)
    );
  }, [
    saleForm.quantity,
    saleForm.sellingPrice
  ]);

  /* ==========================================================
     SUBMIT SALE
  ========================================================== */

  const handleSaleSubmit = async (e) => {
    e.preventDefault();

    const quantity = Number(saleForm.quantity);
    const sellingPrice = Number(
      saleForm.sellingPrice
    );

    if (
      !saleForm.productId ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      return;
    }

    try {
      const response = await addSale({
        productId: saleForm.productId,
        quantity,
        sellingPrice,
        customerName:
          saleForm.customerName.trim() ||
          'Walk-in Customer'
      });

      if (response?.success === false) {
        return;
      }

      setSaleModalOpen(false);

      setSaleForm({
        productId: '',
        quantity: '',
        sellingPrice: '',
        customerName: ''
      });
    } catch (error) {
      console.error(
        'Failed to record sale:',
        error
      );
    }
  };

  /* ==========================================================
     SUBMIT EXPENSE
  ========================================================== */

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(expenseForm.amount);

    if (
      !expenseForm.category ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !expenseForm.description.trim()
    ) {
      return;
    }

    try {
      const response = await addExpense({
        category: expenseForm.category,
        amount,
        description:
          expenseForm.description.trim()
      });

      if (response?.success === false) {
        return;
      }

      setExpenseModalOpen(false);

      setExpenseForm({
        category: 'Raw Materials',
        amount: '',
        description: ''
      });
    } catch (error) {
      console.error(
        'Failed to record expense:',
        error
      );
    }
  };

  /* ==========================================================
     DISPLAY BUSINESS INFORMATION
  ========================================================== */

  const businessName =
    business?.business_name ||
    business?.name ||
    'My Business';

  const businessType =
    business?.business_type ||
    business?.category ||
    t.dashboard?.category ||
    'Food Products';

  const businessLocation =
    business?.location ||
    '';

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-8">

      {/* ======================================================
          TOP BANNER
      ====================================================== */}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="space-y-1">

          <div className="flex items-center gap-2 flex-wrap">

            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
              {businessType}
            </span>

            {businessLocation && (
              <>
                <span className="text-xs text-slate-400">
                  •
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  {businessLocation}
                </span>
              </>
            )}

          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {businessName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            {t.dashboard?.subtitle ||
              'Track your business performance and make better decisions.'}
          </p>

        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <HealthScoreBadge score={healthScore} />
        </div>

      </div>

      {/* ======================================================
          PRIMARY FINANCIAL METRICS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <MetricCard
          title={
            t.dashboard?.totalSales ||
            'Total Sales'
          }
          value={formatCurrency(totalSales)}
          subtitle={
            t.dashboard?.salesGrowth ||
            'Current month'
          }
          icon={TrendingUp}
          color="green"
        />

        <MetricCard
          title={
            t.dashboard?.totalExpenses ||
            'Total Expenses'
          }
          value={formatCurrency(totalExpenses)}
          subtitle={
            t.dashboard?.expensesGrowth ||
            'Current month'
          }
          icon={Receipt}
          color="orange"
        />

        <MetricCard
          title={
            t.dashboard?.netProfit ||
            'Net Profit'
          }
          value={formatCurrency(netProfit)}
          subtitle={
            totalSales > 0
              ? `${profitMargin.toFixed(1)}% margin`
              : 'No sales yet'
          }
          icon={DollarSign}
          color={
            netProfit >= 0
              ? 'green'
              : 'orange'
          }
        />

        <MetricCard
          title={
            t.dashboard?.healthScore ||
            'Business Health'
          }
          value={`${healthScore}/100`}
          subtitle={
            healthScore >= 70
              ? t.dashboard?.healthGood ||
                'Healthy & Growing'
              : 'Needs Attention'
          }
          icon={Sparkles}
          color="blue"
        />

      </div>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 flex flex-wrap items-center justify-between gap-3">

        <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
          {t.dashboard?.quickActions ||
            'Quick Actions'}:
        </span>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() => setSaleModalOpen(true)}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />

            <span>
              {t.dashboard?.logSale ||
                'Log New Sale'}
            </span>
          </button>

          <button
            onClick={() =>
              setExpenseModalOpen(true)
            }
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-orange-500" />

            <span>
              {t.dashboard?.logExpense ||
                'Log Expense'}
            </span>
          </button>

          <Link
            to="/calculator"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-orange-500" />

            <span>
              {t.dashboard?.checkPrice ||
                'Calculate Price'}
            </span>
          </Link>

          <Link
            to="/marketing"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4 text-orange-500" />

            <span>
              {t.dashboard?.createAd ||
                'Create Marketing'}
            </span>
          </Link>

          <Link
            to="/assistant"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />

            <span>
              {t.dashboard?.askAssistant ||
                'Ask AI Assistant'}
            </span>
          </Link>

        </div>
      </div>

      {/* ======================================================
          AI INSIGHT + ACTION PLAN
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AI INSIGHT */}

        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50/50 rounded-3xl p-6 border border-orange-200/80 shadow-sm flex flex-col justify-between">

          <div className="space-y-3">

            <div className="flex items-center justify-between gap-3">

              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-900 bg-orange-100 px-3 py-1 rounded-full">

                <Sparkles className="w-3.5 h-3.5 text-orange-600" />

                <span>
                  {t.dashboard?.aiInsight ||
                    'AI Business Insight'}
                </span>

              </div>

              <span className="text-[11px] text-slate-700 font-medium">
                {t.dashboard?.updated ||
                  'Updated'}
              </span>

            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {aiInsight?.insightTitle ||
                t.dashboard?.aiInsight ||
                'Business Insight'}
            </h3>

            <p className="text-sm text-slate-700 leading-relaxed">
              {aiInsight?.insightText ||
                'Your business insights will appear here.'}
            </p>

          </div>

          <div className="pt-4 border-t border-orange-100 mt-4">

            <Link
              to="/assistant"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>
                {t.dashboard?.discussAi ||
                  'Discuss with AI'}
              </span>

              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

          </div>

        </div>

        {/* ACTION CHECKLIST */}

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2">

                <Calendar className="w-4 h-4 text-orange-600" />

                <h3 className="text-base font-bold text-slate-900">
                  {t.dashboard?.todayAction ||
                    'Today’s Action Plan'}
                </h3>

              </div>

              <span className="text-xs font-semibold text-slate-400">
                {
                  actions.filter(
                    (action) => action.done
                  ).length
                }
                /
                {actions.length}{' '}
                {t.dashboard?.completed ||
                  'completed'}
              </span>

            </div>

            <div className="space-y-3">

              {actions.length > 0 ? (
                actions.map((act) => (

                  <button
                    key={act.id}
                    onClick={() =>
                      toggleAction(act.id)
                    }
                    type="button"
                    aria-pressed={act.done}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      act.done
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        : 'bg-white border-slate-200 hover:border-orange-300'
                    }`}
                  >

                    {act.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}

                    <span
                      className={`text-left text-xs sm:text-sm font-medium ${
                        act.done
                          ? 'line-through text-slate-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {act.text}
                    </span>

                  </button>

                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No action items available.
                </p>
              )}

            </div>

          </div>

          <div className="pt-3 text-[11px] text-slate-700 text-right">
            {t.dashboard?.markCompleted ||
              'Tap an item to mark it completed'}
          </div>

        </div>

      </div>

      {/* ======================================================
          CHARTS
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MONTHLY TREND */}

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-base font-bold text-slate-900">
                {t.dashboard?.salesTrend ||
                  'Monthly Sales & Profit Trend'}
              </h3>

              <p className="text-xs text-slate-700">
                {t.dashboard?.chartSubtitle ||
                  'Last 6 months'}
              </p>

            </div>

          </div>

          <div className="h-64 sm:h-72 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 0
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#334155'
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#334155'
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                  contentStyle={{
                    borderRadius: '12px',
                    border:
                      '1px solid #e2e8f0',
                    boxShadow:
                      '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    paddingTop: 10,
                    color: '#334155'
                  }}
                />

                <Bar
                  dataKey="sales"
                  name={
                    t.dashboard?.sales ||
                    'Sales'
                  }
                  fill="#ea580c"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="expenses"
                  name={
                    t.dashboard?.expenses ||
                    'Expenses'
                  }
                  fill="#64748b"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="profit"
                  name={
                    t.dashboard?.profit ||
                    'Profit'
                  }
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* EXPENSE BREAKDOWN */}

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">

          <div>

            <h3 className="text-base font-bold text-slate-900">
              {t.dashboard?.expenseBreakdown ||
                'Expense Breakdown'}
            </h3>

            <p className="text-xs text-slate-700">
              {t.dashboard?.deployedCapital ||
                'Current month'}
            </p>

          </div>

          <div className="h-52 w-full">

            {expenseChartData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={expenseChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >

                    {expenseChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                </PieChart>
              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-sm text-slate-400 text-center">
                No expenses recorded this month.
              </div>

            )}

          </div>

          <div className="space-y-1.5">

            {expenseChartData
              .slice(0, 3)
              .map((item) => (

                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >

                  <div className="flex items-center gap-2">

                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          item.color
                      }}
                    />

                    <span className="font-medium text-slate-800">
                      {t.dashboard?.[
                        expenseCategoryKeys[
                          item.name
                        ]
                      ] || item.name}
                    </span>

                  </div>

                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.value)}
                  </span>

                </div>

              ))}

            {expenseChartData.length === 0 && (
              <p className="text-xs text-slate-400 text-center">
                No expense data available.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* ======================================================
          QUICK SALE MODAL
      ====================================================== */}

      <Modal
        isOpen={saleModalOpen}
        onClose={() =>
          setSaleModalOpen(false)
        }
        title={
          t.dashboard?.logSaleRecord ||
          'Record Sale'
        }
      >

        <form
          onSubmit={handleSaleSubmit}
          className="space-y-4"
        >

          {/* PRODUCT */}

          <div>

            <label className="block text-xs font-bold text-slate-800 mb-1">
              {t.dashboard?.product ||
                'Product'}
            </label>

            <select
              value={saleForm.productId}
              onChange={(e) =>
                handleProductChange(
                  e.target.value
                )
              }
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
            >

              <option
                value=""
                disabled
              >
                {t.dashboard?.selectProduct ||
                  'Select Product'}
              </option>

              {products.map((product) => {

                const price = Number(
                  product.selling_price ??
                  product.sellingPrice ??
                  0
                );

                return (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} (
                    {formatCurrency(price)}
                    )
                  </option>
                );
              })}

            </select>

            {products.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Add a product first before recording a sale.
              </p>
            )}

          </div>

          {/* QUANTITY + TOTAL */}

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t.dashboard?.quantity ||
                  'Quantity'}
              </label>

              <input
                type="number"
                min="1"
                step="1"
                required
                value={saleForm.quantity}
                onChange={(e) =>
                  setSaleForm({
                    ...saleForm,
                    quantity:
                      e.target.value
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t.dashboard?.amount ||
                  'Amount'}
              </label>

              <input
                type="text"
                readOnly
                value={formatCurrency(saleTotal)}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none"
              />

            </div>

          </div>

          {/* CUSTOMER */}

          <div>

            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">

              <span>
                {t.dashboard?.customerStore ||
                  'Customer / Store'}
              </span>

              <VoiceInputButton
                onTranscript={(text) =>
                  setSaleForm({
                    ...saleForm,
                    customerName: text
                  })
                }
                className="p-1"
              />

            </label>

            <input
              type="text"
              value={saleForm.customerName}
              onChange={(e) =>
                setSaleForm({
                  ...saleForm,
                  customerName:
                    e.target.value
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              placeholder={
                t.dashboard?.customerPlaceholder ||
                'Customer or store name'
              }
            />

          </div>

          <button
            type="submit"
            disabled={products.length === 0}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md transition-colors"
          >
            {t.dashboard?.saveSale ||
              'Save Sale'}
          </button>

        </form>

      </Modal>

      {/* ======================================================
          QUICK EXPENSE MODAL
      ====================================================== */}

      <Modal
        isOpen={expenseModalOpen}
        onClose={() =>
          setExpenseModalOpen(false)
        }
        title={
          t.dashboard?.logExpenseRecord ||
          'Record Expense'
        }
      >

        <form
          onSubmit={handleExpenseSubmit}
          className="space-y-4"
        >

          {/* CATEGORY */}

          <div>

            <label className="block text-xs font-bold text-slate-800 mb-1">
              {t.dashboard?.categoryLabel ||
                'Category'}
            </label>

            <select
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  category:
                    e.target.value
                })
              }
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
            >

              <option value="Raw Materials">
                {t.dashboard?.rawMaterials ||
                  'Raw Materials'}
              </option>

              <option value="Packaging">
                {t.dashboard?.packaging ||
                  'Packaging'}
              </option>

              <option value="Labour">
                {t.dashboard?.labour ||
                  'Labour'}
              </option>

              <option value="Transportation">
                {t.dashboard?.transportation ||
                  'Transportation'}
              </option>

              <option value="Electricity & Gas">
                {t.dashboard?.electricity ||
                  'Electricity & Gas'}
              </option>

              <option value="Marketing">
                {t.dashboard?.marketing ||
                  'Marketing'}
              </option>

            </select>

          </div>

          {/* AMOUNT */}

          <div>

            <label className="block text-xs font-bold text-slate-800 mb-1">
              {t.dashboard?.amount ||
                'Amount'}
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  amount:
                    e.target.value
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              placeholder="e.g. 500"
            />

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">

              <span>
                {t.dashboard?.description ||
                  'Description'}
              </span>

              <VoiceInputButton
                onTranscript={(text) =>
                  setExpenseForm({
                    ...expenseForm,
                    description:
                      text
                  })
                }
                className="p-1"
              />

            </label>

            <input
              type="text"
              required
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  description:
                    e.target.value
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
              placeholder={
                t.dashboard?.descriptionPlaceholder ||
                'Enter expense description'
              }
            />

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
          >
            {t.dashboard?.saveExpense ||
              'Save Expense'}
          </button>

        </form>

      </Modal>

    </div>
  );
};

export default Dashboard;