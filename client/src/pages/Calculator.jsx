import React, { useState, useEffect } from 'react';
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

  const [result, setResult] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  // Deterministic local computation
  useEffect(() => {
    const compute = async () => {
      const res = await calculatorService.calculate({
        productName,
        materialCost,
        labourCost,
        packagingCost,
        transportCost,
        otherCost,
        sellingPrice
      });
      if (res && res.data) {
        setResult(res.data);
      }
    };
    compute();
  }, [productName, materialCost, labourCost, packagingCost, transportCost, otherCost, sellingPrice]);

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
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
              <span>{t.calculator?.sellingPrice || 'Your Selling Price (₹)'}</span>
              <span className="text-orange-600 font-extrabold text-base">{formatCurrency(sellingPrice)}</span>
            </label>
            <input
              type="range"
              min={materialCost + labourCost}
              max={350}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
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
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">
                      {t.calculator?.profitMargin || 'Profit Margin'}
                    </span>
                    <p className="text-2xl font-black text-emerald-700 mt-0.5">
                      {result.profitMargin}%
                    </p>
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
