import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { aiService } from '../services/api.js';
import VoiceInputButton from '../components/common/VoiceInputButton.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import LocationPicker from '../components/common/LocationPicker.jsx';
import { formatCurrency } from '../utils/formatters.js';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  Landmark,
  ListOrdered,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const BusinessDiscovery = () => {
  const { t, currentLanguage } = useLanguage();
  const { updateBusiness, location: savedLocation, saveLocation, loadNearbyMarkets } = useBusiness();
  const navigate = useNavigate();

  // Form State
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [category, setCategory] = useState('');
  const [expectedIncome, setExpectedIncome] = useState('');
  const [riskPreference, setRiskPreference] = useState('');

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  const handleLocationSaved = async (latitude, longitude) => {
    const resolved = await saveLocation(latitude, longitude);
    const resolvedLocation = resolved?.display_name || resolved?.city || '';
    setLocation(resolvedLocation);
    setState(resolved?.state || '');
    await loadNearbyMarkets();
    return resolved;
  };

  const handleDiscoverySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        budget: Number(budget),
        location,
        state,
        skills,
        interests,
        category,
        expectedIncome: Number(expectedIncome),
        riskPreference,
        language: currentLanguage
      };

      const res = await aiService.getBusinessRecommendation(payload);
      if (res && res.data) {
        setRecommendation(res.data);
      }
    } catch (err) {
      setError('Could not generate recommendation. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptBusiness = async (biz) => {
    if (!biz) return;
    try {
      await updateBusiness({
        name: `Lakshmi ${biz.title}`,
        category: biz.category,
        location: `${location}, ${state}`,
        state: state,
        description: `AI-initiated micro enterprise: ${biz.title}. Focus on ${biz.targetMarket ? biz.targetMarket[0] : 'local market'}.`,
        monthlySales: biz.operatingMetrics?.estimatedMonthlyRevenue || 35000,
        monthlyExpenses: biz.operatingMetrics?.estimatedMonthlyExpenses || 21000,
        monthlyProfit: biz.operatingMetrics?.estimatedMonthlyProfit || 14000
      });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">
        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
          <Compass className="w-4 h-4 text-amber-200" />
          <span>PHASE 1: BUSINESS STARTER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t.discovery?.title || 'Business Discovery & Starter'}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-orange-100 max-w-2xl">
          {t.discovery?.subtitle || 'Enter your budget, location, and skills to get AI-recommended rural businesses tailored for you.'}
        </p>
      </div>

      <LocationPicker location={savedLocation} onSaved={handleLocationSaved} />

      {/* Input Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleDiscoverySubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{t.discovery?.budget || 'Available Investment Budget (₹)'}</span>
                <span className="text-orange-600 font-extrabold">{formatCurrency(budget)}</span>
              </label>
              <input
                type="range"
                min="10000"
                max="300000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹10,000</span>
                <span>₹1,50,000</span>
                <span>₹3,00,000+</span>
              </div>
            </div>

            {/* Location with Voice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{t.discovery?.location || 'Town / Village / City'}</span>
                <VoiceInputButton
                  onTranscript={(text) => setLocation(text)}
                  className="p-1"
                />
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tenali or Guntur"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.discovery?.state || 'State'}
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Preferred Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.discovery?.category || 'Preferred Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              >
                <option value="Food Products">Food Products (Pickles, Spices, Snacks)</option>
                <option value="Dairy">Dairy & Animal Husbandry</option>
                <option value="Tailoring">Tailoring & Apparel</option>
                <option value="Handicrafts">Handicrafts & Artisans</option>
                <option value="Farming Products">Agri Processing & Seeds</option>
                <option value="Small Shops">Small Retail Shop / Kirana</option>
              </select>
            </div>

            {/* Expected Monthly Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{t.discovery?.expectedIncome || 'Expected Monthly Income (₹)'}</span>
                <span className="text-emerald-600 font-extrabold">{formatCurrency(expectedIncome)}</span>
              </label>
              <input
                type="number"
                value={expectedIncome}
                onChange={(e) => setExpectedIncome(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Risk Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.discovery?.riskPreference || 'Risk Preference'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Moderate', 'High'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRiskPreference(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      riskPreference === lvl
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills with Voice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>{t.discovery?.skills || 'Your Skills & Experiences'}</span>
              <VoiceInputButton
                onTranscript={(text) => setSkills(prev => prev ? `${prev}, ${text}` : text)}
                className="p-1"
              />
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Sewing, Cooking, Livestock care, Electrical repair..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.discovery?.interests || 'Interests & Hobbies'}
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Village market sales, organic products, embroidery..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>{loading ? (t.discovery?.analyzing || 'Analyzing local demand...') : (t.discovery?.submitBtn || 'Get AI Business Recommendations')}</span>
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner text="Consulting rural business intelligence model..." />}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* RECOMMENDATION RESULTS */}
      {recommendation && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Main Recommended Business */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-400 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>{t.discovery?.resultTitle || 'Best Business Match'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {recommendation.recommendedBusiness?.title}
                </h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Category: <span className="text-orange-600">{recommendation.recommendedBusiness?.category}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAdoptBusiness(recommendation.recommendedBusiness)}
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto"
              >
                <span>{t.discovery?.adoptBtn || 'Start This Business'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Estimates Grid (Clearly marked as AI Estimates) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Estimated Financial Projections (Non-binding AI Estimates)
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  AI Estimates
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                  <span className="text-xs text-slate-500 font-medium">{t.discovery?.startupCost || 'Estimated Startup Budget'}</span>
                  <p className="text-xl font-bold text-orange-700 mt-1">
                    {formatCurrency(recommendation.recommendedBusiness?.operatingMetrics?.estimatedStartupBudget || budget)}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">{t.discovery?.monthlyExpense || 'Estimated Monthly Expense'}</span>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    {formatCurrency(recommendation.recommendedBusiness?.operatingMetrics?.estimatedMonthlyExpenses)}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">{t.discovery?.monthlyRevenue || 'Estimated Monthly Revenue'}</span>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    {formatCurrency(recommendation.recommendedBusiness?.operatingMetrics?.estimatedMonthlyRevenue)}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-medium">{t.discovery?.monthlyProfit || 'Estimated Monthly Profit'}</span>
                  <p className="text-xl font-bold text-emerald-700 mt-1">
                    {formatCurrency(recommendation.recommendedBusiness?.operatingMetrics?.estimatedMonthlyProfit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Why Location Fits & Target Customers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>{t.discovery?.locationReason || 'Why This Location Fits'}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {recommendation.recommendedBusiness?.locationReasoning}
                </p>
              </div>

              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span>{t.discovery?.targetCustomers || 'Target Customers'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                  {recommendation.recommendedBusiness?.targetMarket?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Initial Startup Cost Breakdown */}
            {recommendation.recommendedBusiness?.startupCostBreakdown && (
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <span>Initial Requirements & Budget Allocation</span>
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Item / Requirement</th>
                        <th className="p-3 text-right">Approx. Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      {recommendation.recommendedBusiness.startupCostBreakdown.map((b, i) => (
                        <tr key={i}>
                          <td className="p-3">{b.item}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(b.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Matching Government Schemes */}
            {recommendation.recommendedBusiness?.matchingSchemes && (
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-orange-600" />
                  <span>{t.discovery?.schemesMatch || 'Matching Govt Schemes & Subsidies'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendation.recommendedBusiness.matchingSchemes.map((s, i) => (
                    <div key={i} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                      <p className="text-xs font-bold text-amber-900">{s.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{s.subsidy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Starting Plan */}
            {recommendation.recommendedBusiness?.stepPlan && (
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-orange-600" />
                  <span>{t.discovery?.stepPlan || 'Step-by-Step Starting Plan'}</span>
                </h4>
                <div className="space-y-2.5">
                  {recommendation.recommendedBusiness.stepPlan.map((st) => (
                    <div key={st.step} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {st.step}
                      </span>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">{st.title}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{st.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alternative Business Options */}
          {recommendation.alternatives && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                {t.discovery?.altTitle || 'Alternative Business Options'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendation.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">
                        {alt.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{alt.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alt.reason}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Est. Budget: </span>
                        <span className="font-bold text-slate-800">{formatCurrency(alt.estimatedBudget)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Profit: </span>
                        <span className="font-bold text-emerald-600">{formatCurrency(alt.estimatedMonthlyProfit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessDiscovery;
