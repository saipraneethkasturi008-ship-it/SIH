import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { schemeService } from '../services/api.js';
import { getLocalizedScheme } from '../data/schemeTranslations.js';
import Modal from '../components/common/Modal.jsx';

import {
  ShieldCheck,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
  FileText,
  Info,
} from 'lucide-react';

const Schemes = () => {
  const { t, currentLanguage } = useLanguage();

  // =========================
  // STATE
  // =========================

  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [activeModalScheme, setActiveModalScheme] = useState(null);
  const [aiExplainText, setAiExplainText] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================
  // CATEGORIES
  // =========================

  const categoryFilters = [
    { id: 'All', label: t.schemes?.categories?.all || 'All' },
    { id: 'Small Business & Trading', label: t.schemes?.categories?.smallBusiness || 'Small Business & Trading' },
    { id: 'Manufacturing & Services', label: t.schemes?.categories?.manufacturing || 'Manufacturing & Services' },
    { id: 'Artisans & Craftsmen', label: t.schemes?.categories?.artisans || 'Artisans & Craftsmen' },
    { id: 'Women Rural Livelihoods', label: t.schemes?.categories?.women || 'Women Rural Livelihoods' },
    { id: 'General Business Registration', label: t.schemes?.categories?.registration || 'General Business Registration' },
  ];

  // =========================
  // LOAD SCHEMES FROM SUPABASE
  // =========================

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await schemeService.getSchemes({ lang: currentLanguage });

        if (res?.success) {
          setSchemes(res.schemes || res.data || []);
        } else {
          setError(
            res?.message || t.schemes?.loadError || 'Failed to load government schemes.'
          );
        }
      } catch (err) {
        console.error('Error loading schemes:', err);

        setError(
          t.schemes?.loadError || 'Unable to load government schemes. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchemes();
  }, [currentLanguage]);

  // =========================
  // NORMALIZE SCHEME DATA
  // =========================
  //
  // Supabase currently provides:
  // id
  // name
  // full_name
  // category
  // description
  // official_website
  //
  // The existing UI also expects:
  // shortName
  // ministry
  // state
  // maxLoan
  // subsidy
  // eligibility
  // documents
  // benefits
  // officialSource
  //
  // This helper safely fills missing fields.
  // =========================

  const getSchemeDetails = (scheme) => {
    const localized = getLocalizedScheme(scheme, currentLanguage);
    return {
      ...localized,

      id: localized.id || localized._id,

      shortName:
        localized.shortName ||
        localized.short_name ||
        localized.name ||
        t.schemes?.title ||
        'Government Scheme',

      ministry:
        localized.ministry ||
        'Government of India',

      state:
        localized.state ||
        t.schemes?.tags?.allIndia ||
        'All India',

      maxLoan:
        localized.maxLoan ||
        localized.max_loan ||
        t.schemes?.card?.seePortal ||
        'See official portal',

      subsidy:
        localized.subsidy ||
        t.schemes?.card?.seePortal ||
        'See official portal',

      eligibility:
        Array.isArray(localized.eligibility) && localized.eligibility.length > 0
          ? localized.eligibility
          : [
              t.schemes?.card?.seePortal ||
                'Please check the official scheme portal for current eligibility criteria.',
            ],

      documents:
        Array.isArray(localized.documents) && localized.documents.length > 0
          ? localized.documents
          : [
              t.schemes?.card?.seePortal ||
                'Please check the official scheme portal for required documents.',
            ],

      benefits:
        Array.isArray(localized.benefits) && localized.benefits.length > 0
          ? localized.benefits
          : [
              t.schemes?.card?.seePortal ||
                'Please check the official scheme portal for current benefits.',
            ],

      officialSource:
        localized.officialSource ||
        localized.official_website ||
        '#',

      description:
        localized.description ||
        'Scheme details are available on the official government portal.',
    };
  };

  // =========================
  // FILTER SCHEMES
  // =========================

  const matchesCategory = (scheme, catId) => {
    if (!catId || catId === 'All') return true;
    const cat = (scheme.category || '').toLowerCase();
    const origCat = (scheme.original_category || '').toLowerCase();
    const target = catId.toLowerCase();

    if (cat === target || origCat === target) return true;
    if (cat.includes(target) || origCat.includes(target)) return true;

    if (catId === 'Small Business & Trading') {
      return (
        cat.includes('small business') ||
        cat.includes('trading') ||
        cat.includes('చిన్న వ్యాపారాలు') ||
        cat.includes('వాణిజ్యం') ||
        cat.includes('लघु व्यवसाय') ||
        origCat.includes('small business') ||
        origCat.includes('trading')
      );
    }
    if (catId === 'Manufacturing & Services') {
      return (
        cat.includes('manufacturing') ||
        cat.includes('service') ||
        cat.includes('తయారీ') ||
        cat.includes('సేవలు') ||
        cat.includes('विनिर्माण') ||
        origCat.includes('manufacturing') ||
        origCat.includes('service')
      );
    }
    if (catId === 'Artisans & Craftsmen') {
      return (
        cat.includes('artisan') ||
        cat.includes('craft') ||
        cat.includes('చేతివృత్తులు') ||
        cat.includes('కళాకారులు') ||
        cat.includes('कारीगर') ||
        origCat.includes('artisan') ||
        origCat.includes('craft')
      );
    }
    if (catId === 'Women Rural Livelihoods') {
      return (
        cat.includes('women') ||
        cat.includes('livelihood') ||
        cat.includes('మహిళా') ||
        cat.includes('జీవనోపాధి') ||
        cat.includes('महिला') ||
        origCat.includes('women')
      );
    }
    if (catId === 'General Business Registration') {
      return (
        cat.includes('registration') ||
        cat.includes('రిజిస్ట్రేషన్') ||
        cat.includes('पंजीकरण') ||
        origCat.includes('registration')
      );
    }

    return false;
  };

  const filteredSchemes = schemes
    .map(getSchemeDetails)
    .filter((scheme) => {
      const search = searchTerm.toLowerCase().trim();

      const matchCategory = matchesCategory(scheme, selectedCategory);

      const matchSearch =
        !search ||
        (scheme.name || '')
          .toLowerCase()
          .includes(search) ||
        (scheme.full_name || '')
          .toLowerCase()
          .includes(search) ||
        (scheme.description || '')
          .toLowerCase()
          .includes(search) ||
        (scheme.shortName || '')
          .toLowerCase()
          .includes(search) ||
        (scheme.category || '')
          .toLowerCase()
          .includes(search);

      return matchCategory && matchSearch;
    });

  // =========================
  // AI SIMPLE EXPLANATION
  // =========================

  const handleExplain = (scheme) => {
    const normalizedScheme = getSchemeDetails(scheme);

    setActiveModalScheme(normalizedScheme);

    if (currentLanguage === 'te') {
      setAiExplainText(
        `"${normalizedScheme.name}" గురించి మీకు సులభంగా అర్థమయ్యేలా వివరణ: ${normalizedScheme.description}`
      );
    } else if (currentLanguage === 'hi') {
      setAiExplainText(
        `"${normalizedScheme.name}" का सरल विवरण: ${normalizedScheme.description}`
      );
    } else if (currentLanguage === 'ta') {
      setAiExplainText(
        `"${normalizedScheme.name}" பற்றிய எளிய விளக்கம்: ${normalizedScheme.description}`
      );
    } else if (currentLanguage === 'kn') {
      setAiExplainText(
        `"${normalizedScheme.name}" ಕುರಿತು ಸರಳ ವಿವರಣೆ: ${normalizedScheme.description}`
      );
    } else if (currentLanguage === 'ml') {
      setAiExplainText(
        `"${normalizedScheme.name}" എന്നതിന്റെ ലളിതമായ വിശദീകരണം: ${normalizedScheme.description}`
      );
    } else {
      setAiExplainText(
        `Simple explanation: "${normalizedScheme.name}" — ${normalizedScheme.description}`
      );
    }
  };

  // =========================
  // LOADING STATE
  // =========================

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>
              {t.schemes?.verifiedBadge || 'VERIFIED STRUCTURED GOVERNMENT SCHEME LAYER'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.schemes?.title ||
              'Verified Government Schemes & Subsidies'}
          </h1>

          <p className="mt-1 text-sm sm:text-base text-orange-100 max-w-2xl">
            {t.schemes?.subtitle ||
              'Official central and state schemes for micro and small enterprises.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />

          <p className="text-sm font-bold text-slate-700">
            {t.schemes?.loading || 'Loading government schemes...'}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {t.schemes?.fetching || 'Fetching verified scheme information.'}
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR STATE
  // =========================

  if (error) {
    return (
      <div className="space-y-6">

        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />

            <span>
              {t.schemes?.verifiedBadge || 'VERIFIED STRUCTURED GOVERNMENT SCHEME LAYER'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.schemes?.title ||
              'Verified Government Schemes & Subsidies'}
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center">

          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Info className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-black text-slate-900">
            {t.schemes?.loadError || 'Unable to load schemes'}
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {t.schemes?.tryAgain || 'Try Again'}
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">

        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />

          <span>
            {t.schemes?.verifiedBadge || 'VERIFIED STRUCTURED GOVERNMENT SCHEME LAYER'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          {t.schemes?.title ||
            'Verified Government Schemes & Subsidies'}
        </h1>

        <p className="mt-1 text-sm sm:text-base text-orange-100 max-w-2xl">
          {t.schemes?.subtitle ||
            'Official central and state schemes for micro and small enterprises with verified eligibility criteria.'}
        </p>

      </div>

      {/* =========================
          CATEGORY PILLS
      ========================= */}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">

        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}

      </div>

      {/* =========================
          SEARCH BAR
      ========================= */}

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">

        <Search className="w-4 h-4 text-slate-400 ml-2" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            t.schemes?.searchPlaceholder ||
            'Search schemes by keyword, trade, or category...'
          }
          className="flex-1 text-xs sm:text-sm bg-transparent outline-none font-medium"
        />

      </div>

      {/* =========================
          RESULTS COUNT
      ========================= */}

      <div className="flex items-center justify-between px-1">

        <p className="text-xs font-semibold text-slate-500">
          {filteredSchemes.length}{' '}
          {filteredSchemes.length === 1
            ? (t.schemes?.schemeAvailable || 'scheme available')
            : (t.schemes?.schemesAvailable || 'schemes available')}
        </p>

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            {t.schemes?.clearSearch || 'Clear Search'}
          </button>
        )}

      </div>

      {/* =========================
          EMPTY STATE
      ========================= */}

      {filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">

          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-5 h-5 text-slate-400" />
          </div>

          <h2 className="text-lg font-black text-slate-900">
            {t.schemes?.noSchemesFound || 'No schemes found'}
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {t.schemes?.noSchemesDesc ||
              'Try another search keyword or choose a different category.'}
          </p>

        </div>
      ) : (

        /* =========================
           SCHEMES CARDS GRID
        ========================= */

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {filteredSchemes.map((scheme) => (

            <div
              key={scheme.id || scheme.name}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between space-y-4"
            >

              <div className="space-y-3">

                {/* Category + State */}

                <div className="flex items-start justify-between gap-3">

                  <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase">
                    {scheme.category || t.schemes?.title || 'Government Scheme'}
                  </span>

                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {scheme.state === 'All India'
                      ? (t.schemes?.tags?.allIndia || scheme.state)
                      : scheme.state === 'Andhra Pradesh'
                      ? (t.schemes?.tags?.andhraPradesh || scheme.state)
                      : scheme.state}
                  </span>

                </div>

                {/* Name */}

                <div>

                  <h3 className="text-lg font-black text-slate-900">
                    {scheme.name}
                  </h3>

                  {scheme.full_name &&
                    scheme.full_name !== scheme.name && (
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {scheme.full_name}
                      </p>
                    )}

                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {scheme.ministry}
                  </p>

                </div>

                {/* Description */}

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Key Terms */}

                <div className="grid grid-cols-2 gap-2 pt-2">

                  <div className="p-3 bg-slate-50 rounded-2xl">

                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {t.schemes?.card?.maxLoan || 'Max Loan / Grant'}
                    </span>

                    <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                      {scheme.maxLoan}
                    </p>

                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">

                    <span className="text-[10px] text-amber-800 uppercase font-bold">
                      {t.schemes?.card?.subsidy || 'Subsidy Support'}
                    </span>

                    <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
                      {scheme.subsidy}
                    </p>

                  </div>

                </div>

                {/* Eligibility Preview */}

                <div>

                  <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">

                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                    <span>
                      {t.schemes?.card?.keyEligibility || 'Key Eligibility'}
                    </span>

                  </h4>

                  <ul className="space-y-1 text-xs text-slate-600">

                    {scheme.eligibility
                      .slice(0, 2)
                      .map((el, i) => (
                        <li
                          key={i}
                          className="truncate"
                          title={el}
                        >
                          • {el}
                        </li>
                      ))}

                  </ul>

                </div>

              </div>

              {/* =========================
                  BOTTOM ACTIONS
              ========================= */}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">

                <button
                  type="button"
                  onClick={() => handleExplain(scheme)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >

                  <Sparkles className="w-3.5 h-3.5" />

                  <span>
                    {t.schemes?.explainWithAi ||
                      'Explain in Simple Words'}
                  </span>

                </button>

                {scheme.officialSource &&
                scheme.officialSource !== '#' ? (
                  <a
                    href={scheme.officialSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >

                    <span>
                      {t.schemes?.officialSource ||
                        'Official Portal'}
                    </span>

                    <ExternalLink className="w-3.5 h-3.5" />

                  </a>
                ) : (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">
                    {t.schemes?.officialSourceUnavailable || 'Official Portal Unavailable'}
                  </span>
                )}

              </div>

            </div>

          ))}

        </div>
      )}

      {/* =========================
          DETAIL + AI EXPLANATION MODAL
      ========================= */}

      <Modal
        isOpen={Boolean(activeModalScheme)}
        onClose={() => {
          setActiveModalScheme(null);
          setAiExplainText(null);
        }}
        title={
          activeModalScheme?.name ||
          t.schemes?.title ||
          'Scheme Details'
        }
      >

        {activeModalScheme && (

          <div className="space-y-5 text-slate-700 text-xs sm:text-sm">

            {/* AI Explanation */}

            {aiExplainText && (

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">

                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">

                  <Sparkles className="w-4 h-4 text-orange-600" />

                  <span>
                    {t.schemes?.modal?.aiExplain || 'AI Simple Explanation'}
                  </span>

                </span>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {aiExplainText}
                </p>

              </div>

            )}

            {/* Description */}

            <div className="p-4 bg-slate-50 rounded-2xl">

              <div className="flex items-center gap-2 mb-2">

                <Info className="w-4 h-4 text-orange-600" />

                <h4 className="font-bold text-slate-900">
                  {t.schemes?.modal?.aboutScheme || 'About This Scheme'}
                </h4>

              </div>

              <p className="text-slate-600 leading-relaxed">
                {activeModalScheme.description}
              </p>

            </div>

            {/* Required Documents */}

            <div>

              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">

                <FileText className="w-4 h-4 text-orange-600" />

                {t.schemes?.modal?.requiredDocs || 'Required Documents'}

              </h4>

              <ul className="list-disc pl-5 space-y-1 text-slate-600">

                {activeModalScheme.documents.map(
                  (document, index) => (
                    <li key={index}>
                      {document}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* Benefits */}

            <div>

              <h4 className="font-bold text-slate-900 mb-1">
                {t.schemes?.modal?.benefitsSubsidies || 'Benefits & Subsidies'}
              </h4>

              <ul className="list-disc pl-5 space-y-1 text-slate-600">

                {activeModalScheme.benefits.map(
                  (benefit, index) => (
                    <li key={index}>
                      {benefit}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* Official Portal */}

            <div className="pt-2">

              {activeModalScheme.officialSource &&
              activeModalScheme.officialSource !== '#' ? (

                <a
                  href={activeModalScheme.officialSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-center block transition-colors shadow-sm"
                >
                  {t.schemes?.modal?.openPortal || 'Open Official Portal'} (
                  {activeModalScheme.shortName}
                  )
                </a>

              ) : (

                <div className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-center">
                  {t.schemes?.modal?.portalUnavailable || 'Official portal information is not available.'}
                </div>

              )}

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
};

export default Schemes;