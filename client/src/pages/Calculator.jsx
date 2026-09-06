import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { calculatorService } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';
import {
  Calculator as CalcIcon,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';

const Calculator = () => {
  const { t, currentLanguage } = useLanguage();

  const [productName, setProductName] = useState('');
  const [materialCost, setMaterialCost] = useState(0);
  const [labourCost, setLabourCost] = useState(0);
  const [packagingCost, setPackagingCost] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [marginInput, setMarginInput] = useState('0');

  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const lastEditedRef = useRef('price');

  // Total unit production cost
  const totalProductionCost =
    Number(materialCost || 0) +
    Number(labourCost || 0) +
    Number(packagingCost || 0) +
    Number(transportCost || 0) +
    Number(otherCost || 0);

  // Synchronous, deterministic computation of derived metrics
  const profit = Number((sellingPrice - totalProductionCost).toFixed(2));
  const calculatedMargin =
    sellingPrice > 0
      ? Number(((profit / sellingPrice) * 100).toFixed(1))
      : 0;
  const markup =
    totalProductionCost > 0
      ? Number(((profit / totalProductionCost) * 100).toFixed(1))
      : 0;
  const breakEvenUnits = profit > 0 ? Math.ceil(5000 / profit) : 0;

  const result = {
    productName: productName || 'Custom Product',
    materialCost,
    labourCost,
    packagingCost,
    transportCost,
    otherCost,
    totalCost: totalProductionCost,
    sellingPrice,
    profit,
    profitMargin: calculatedMargin,
    markup,
    breakEvenUnits,
    isHealthy: calculatedMargin >= 25
  };

  // Bidirectional updates: Selling Price -> Profit Margin
  const handleSellingPriceChange = (val) => {
    lastEditedRef.current = 'price';
    const price = val === '' ? 0 : Math.max(0, Number(val));
    setSellingPrice(price);

    if (price > 0) {
      const p = price - totalProductionCost;
      const m = (p / price) * 100;
      setMarginInput(Number(m.toFixed(1)).toString());
    } else {
      setMarginInput('0');
    }
  };

  // Bidirectional updates: Target Profit Margin -> Selling Price
  const handleMarginChange = (val) => {
    lastEditedRef.current = 'margin';
    setMarginInput(val);

    if (val === '' || val === '-') {
      return;
    }

    const margin = parseFloat(val);
    if (!isNaN(margin)) {
      if (margin < 100) {
        if (totalProductionCost > 0) {
          const calculatedPrice = Math.round((totalProductionCost / (1 - margin / 100)) * 100) / 100;
          setSellingPrice(Math.max(0, calculatedPrice));
        }
      }
    }
  };

  // Recalculate dependent variable when any cost input changes
  useEffect(() => {
    if (lastEditedRef.current === 'margin') {
      const margin = parseFloat(marginInput);
      if (!isNaN(margin) && margin < 100 && totalProductionCost > 0) {
        const calculatedPrice = Math.round((totalProductionCost / (1 - margin / 100)) * 100) / 100;
        setSellingPrice(Math.max(0, calculatedPrice));
      }
    } else {
      if (sellingPrice > 0) {
        const p = sellingPrice - totalProductionCost;
        const m = (p / sellingPrice) * 100;
        setMarginInput(Number(m.toFixed(1)).toString());
      }
    }
  }, [totalProductionCost]);

  const handleExplainWithAi = () => {
    setExplaining(true);
    setTimeout(() => {
      if (result) {
        if (currentLanguage === 'te') {
          setAiExplanation(
            `మీ ఉత్పత్తి "${productName}" తయారీ ఖర్చు ₹${result.totalCost}. మీరు నిర్ణయించిన అమ్మకం ధర ₹${result.sellingPrice} ద్వారా వచ్చే లాభం ₹${result.profit} (${result.profitMargin}%). గ్రామీణ ఫుడ్ ప్రాసెసింగ్ వ్యాపారాలకు 25% పైగా లాభం ఉండటం చాలా ఆరోగ్యకరమైనది! ఈ ధరతో నష్టాలు రాకుండా ఉండాలంటే నెలకు కనీసం ${result.breakEvenUnits} యూనిట్లు అమ్మాలి.`
          );
        } else {
          setAiExplanation(
            `Your total production cost for "${productName}" is ₹${result.totalCost}. At a selling price of ₹${result.sellingPrice}, you earn a healthy unit profit of ₹${result.profit} with a ${result.profitMargin}% margin. A margin between 25-35% is ideal for rural micro-enterprises to absorb unexpected ingredient price spikes. You need to sell at least ${result.breakEvenUnits} units per month to cover fixed shop and utility overheads.`
          );
        }
      }
      setExplaining(false);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">
        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>100% DETERMINISTIC CALCULATION (NO LLM ARITHMETIC ERRORS)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          {t.calculator?.title || 'Deterministic Price & Profit Calculator'}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-orange-100 max-w-2xl">
          {t.calculator?.subtitle || 'Accurate cost breakup and profit margins calculated mathematically without AI errors.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cost Inputs (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">1. Enter Unit Production Costs</h2>
            <span className="text-xs text-slate-400">All values in INR (₹)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>{t.calculator?.productName || 'Product Name'}</span>
              <VoiceInputButton
                onTranscript={(text) => setProductName(text)}
                className="p-1"
              />
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.calculator?.materialCost || 'Raw Materials Cost (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={materialCost}
                onChange={(e) => setMaterialCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.calculator?.labourCost || 'Labour / Making Cost (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={labourCost}
                onChange={(e) => setLabourCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.calculator?.packagingCost || 'Packaging Cost (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.calculator?.transportCost || 'Transport / Delivery (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.calculator?.otherCost || 'Other Overheads / Electricity / Wastage (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={otherCost}
                onChange={(e) => setOtherCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selling Price Target */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-900">
                  {t.calculator?.sellingPrice || 'Your Selling Price (₹)'}
                </label>
                <span className="text-[11px] text-slate-400">
                  Adjust price or edit target margin on the right
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 w-fit">
                <span className="text-xs font-bold text-orange-700">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={sellingPrice === 0 ? '' : sellingPrice}
                  placeholder="0"
                  onChange={(e) => handleSellingPriceChange(e.target.value)}
                  className="w-28 bg-transparent text-right text-base font-extrabold text-orange-600 focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(500, Math.ceil(totalProductionCost * 3), Math.ceil(Number(sellingPrice || 0) * 1.5))}
              step="1"
              value={sellingPrice || 0}
              onChange={(e) => handleSellingPriceChange(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Cost: {formatCurrency(totalProductionCost)}</span>
              <span>1.5x Cost: {formatCurrency(totalProductionCost * 1.5)}</span>
              <span>2x Cost: {formatCurrency(totalProductionCost * 2)}</span>
            </div>
          </div>
        </div>

        {/* Calculated Results (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
              2. Profit & Margin Breakdown
            </h2>

            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-600">
                    {t.calculator?.totalCost || 'Total Production Cost'}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(result.totalCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-orange-50 rounded-2xl border border-orange-100">
                  <span className="text-xs font-semibold text-orange-900">
                    {t.calculator?.profitPerUnit || 'Profit Per Unit'}
                  </span>
                  <span className="text-xl font-black text-orange-700">
                    {formatCurrency(result.profit)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        {t.calculator?.profitMargin || 'Profit Margin'}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded-md">
                        Editable
                      </span>
                    </div>
                    <div className="relative inline-flex items-center justify-center my-0.5">
                      <input
                        type="number"
                        step="0.5"
                        max="99.9"
                        value={marginInput}
                        placeholder="0"
                        onChange={(e) => handleMarginChange(e.target.value)}
                        className="w-full text-center text-2xl font-black text-emerald-700 bg-white/90 border border-emerald-300/80 rounded-xl py-1 pr-6 pl-2 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all shadow-inner"
                        title="Enter target profit margin % to auto-calculate selling price"
                      />
                      <span className="absolute right-2.5 text-base font-black text-emerald-600 pointer-events-none">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700/80 mt-1 font-medium leading-tight">
                      Edit % to auto-set price
                    </span>
                  </div>

                  <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <span className="text-[11px] font-bold text-blue-800 uppercase">
                      {t.calculator?.markupPercent || 'Markup on Cost'}
                    </span>
                    <p className="text-2xl font-black text-blue-700 mt-0.5">
                      {result.markup}%
                    </p>
                  </div>
                </div>

                {/* Health Status Indicator */}
                <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold ${
                  result.profitMargin >= 25
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {result.profitMargin >= 25 ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  )}
                  <span>
                    {result.profitMargin >= 25
                      ? (t.calculator?.healthyMargin || 'Healthy margin (>25% recommended for food & retail)')
                      : (t.calculator?.lowMargin || 'Caution: Margin below 25% leaves little buffer for spoilage')}
                  </span>
                </div>

                {/* Break-even sales volume */}
                <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600 flex items-center justify-between">
                  <span>{t.calculator?.breakEven || 'Monthly Break-even Sales'}:</span>
                  <span className="font-extrabold text-slate-900">{result.breakEvenUnits} units / month</span>
                </div>

                {/* AI Explanation Button */}
                <button
                  type="button"
                  onClick={handleExplainWithAi}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{explaining ? 'Analyzing...' : (t.calculator?.aiAnalysisBtn || 'Explain Price Health with AI')}</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Explanation Result Card */}
          {aiExplanation && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>AI Price Consultation</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {aiExplanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
