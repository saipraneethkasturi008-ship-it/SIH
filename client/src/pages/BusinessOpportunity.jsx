import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext.jsx';
import {
  detectUserLocation,
  formatCoordinates
} from '../services/locationService.js';

import { analyzeBusinessArea } from '../data/businessOpportunityData.js';
import { aiService } from '../services/api.js';

import OpportunityCard from '../components/common/OpportunityCard.jsx';

const STORAGE_KEY = 'vyapar-business-location';

const initialLocation = {
  town: '',
  district: '',
  state: '',
  pin: '',
  latitude: null,
  longitude: null,
  status: 'idle'
};

const locationMessages = {
  denied:
    'Location permission was denied. Enter your area manually instead.',
  unavailable:
    'We could not find your location right now. Please try again or enter your area manually.',
  timeout:
    'Location detection took too long. Please try again or enter your area manually.',
  unsupported:
    'This browser does not support location detection. Enter your area manually.'
};

const loadLocation = () => {
  try {
    return {
      ...initialLocation,
      ...JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{}'
      )
    };
  } catch {
    return initialLocation;
  }
};

const BusinessOpportunity = () => {
  const { t, currentLanguage } = useLanguage();

  const [location, setLocation] = useState(loadLocation);
  const [showManual, setShowManual] = useState(false);

  // Demo analysis
  const [analysis, setAnalysis] = useState(null);

  // AI analysis
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');

  const locationLabel = [
    location.town,
    location.district,
    location.state
  ]
    .filter(Boolean)
    .join(', ');

  const hasArea = Boolean(
    location.town ||
      location.district ||
      location.state ||
      location.pin ||
      (
        location.latitude !== null &&
        location.longitude !== null
      )
  );

  const locationFormValid = [
    location.town,
    location.district,
    location.state
  ].every((value) => value.trim());

  const statusText = useMemo(
    () =>
      ({
        detecting: 'Detecting your location...',
        detected: 'Location detected',
        manual: 'Area entered manually',
        idle: 'Location not set'
      }[location.status] || 'Location not set'),
    [location.status]
  );

  const saveLocation = (nextLocation) => {
    setLocation(nextLocation);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextLocation)
    );
  };

  // ============================================================
  // DETECT LOCATION
  // ============================================================

  const detectLocation = async () => {
    setError('');
    setAiError('');

    setLocation((previous) => ({
      ...previous,
      status: 'detecting'
    }));

    try {
      const detected = await detectUserLocation();

      console.log(
        'Detected Business Opportunity location:',
        detected
      );

      saveLocation({
        ...location,
        latitude: detected.latitude,
        longitude: detected.longitude,

        town:
          detected.city ||
          location.town ||
          '',

        district:
          detected.district ||
          location.district ||
          '',

        state:
          detected.state ||
          location.state ||
          '',

        pin:
          detected.postcode ||
          location.pin ||
          '',

        status: 'detected'
      });
    } catch (reason) {
      console.error(
        'Location detection failed:',
        reason
      );

      setLocation((previous) => ({
        ...previous,
        status: reason.code
      }));

      setError(
        locationMessages[reason.code] ||
          locationMessages.unavailable
      );
    }
  };

  // ============================================================
  // MANUAL LOCATION
  // ============================================================

  const saveManualLocation = (event) => {
    event.preventDefault();

    if (!locationFormValid) {
      setError(
        'Add your town, district, and state to analyze this area.'
      );
      return;
    }

    saveLocation({
      ...location,
      status: 'manual'
    });

    setShowManual(false);
    setError('');
    setAiError('');
  };

  // ============================================================
  // ANALYZE AREA
  // DEMO + AI
  // ============================================================

  const analyzeArea = async () => {
    if (!hasArea) {
      setError(
        'Detect your location or enter an area before starting analysis.'
      );
      return;
    }

    setError('');
    setAiError('');

    setIsAnalyzing(true);

    // ----------------------------------------------------------
    // 1. DEMO ANALYSIS
    // ----------------------------------------------------------

    const demoResult =
      analyzeBusinessArea(location);

    setAnalysis(demoResult);

    // ----------------------------------------------------------
    // 2. AI ANALYSIS
    // ----------------------------------------------------------

    try {
      const payload = {
        town: location.town,
        district: location.district,
        state: location.state,
        pin: location.pin,
        latitude: location.latitude,
        longitude: location.longitude,
        language: currentLanguage
      };

      console.log(
        'Sending Business Area AI request:',
        payload
      );

      const response =
        await aiService.getBusinessAreaOpportunities(
          payload
        );

      console.log(
        'Business Area AI response:',
        response
      );

      if (
        response?.success &&
        response?.data
      ) {
        setAiAnalysis(response.data);
      } else {
        throw new Error(
          response?.message ||
            'AI analysis could not be generated.'
        );
      }
    } catch (aiErr) {
      console.error(
        'Business Area AI error:',
        aiErr
      );

      setAiAnalysis(null);

      setAiError(
        aiErr?.response?.data?.message ||
          aiErr?.message ||
          'AI area analysis is currently unavailable.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white shadow-lg sm:p-8">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
              {t.discovery?.title ||
                'Business Opportunity Finder'}
            </span>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              AI Business Opportunity Finder
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-orange-100">
              Analyze your local area and compare
              demo market estimates with AI-generated
              business opportunities.
            </p>

          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <Sparkles className="h-4 w-4" />
            Demo + AI Analysis
          </div>

        </div>

      </header>

      {/* ======================================================
          LOCATION + ANALYSIS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* LOCATION */}

        <section
          className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
          aria-labelledby="location-title"
        >

          <div className="flex items-start gap-3">

            <MapPin className="mt-1 h-5 w-5 text-orange-600" />

            <div>

              <h2
                id="location-title"
                className="text-lg font-bold text-slate-900"
              >
                Your area
              </h2>

              <p className="text-sm text-slate-600">
                Start with a town, district, or your
                current location.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">

            <span
              className={`h-2.5 w-2.5 rounded-full ${
                location.status === 'detected'
                  ? 'bg-emerald-500'
                  : 'bg-slate-300'
              }`}
            />

            {statusText}

          </div>

          {locationLabel && (
            <div className="rounded-xl bg-slate-50 p-3">

              <strong className="block text-sm text-slate-900">
                {locationLabel}
              </strong>

              <span className="text-xs text-slate-600">
                {location.pin
                  ? `PIN ${location.pin}`
                  : 'General area only'}
              </span>

            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">

            <div className="rounded-xl border border-slate-200 p-3">

              <span className="block text-slate-600">
                Latitude
              </span>

              <strong>
                {formatCoordinates(
                  location.latitude
                )}
              </strong>

            </div>

            <div className="rounded-xl border border-slate-200 p-3">

              <span className="block text-slate-600">
                Longitude
              </span>

              <strong>
                {formatCoordinates(
                  location.longitude
                )}
              </strong>

            </div>

          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
              role="alert"
            >

              <AlertCircle className="h-4 w-4 shrink-0" />

              {error}

            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={detectLocation}
              disabled={
                location.status === 'detecting' ||
                isAnalyzing
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60"
            >

              <LocateFixed className="h-4 w-4" />

              {location.status === 'detecting'
                ? 'Detecting...'
                : 'Detect My Location'}

            </button>

            <button
              type="button"
              onClick={() =>
                setShowManual((open) => !open)
              }
              disabled={isAnalyzing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >

              <Search className="h-4 w-4" />

              {showManual
                ? 'Close manual entry'
                : 'Enter Location Manually'}

            </button>

          </div>

          <p className="text-xs text-slate-600">
            Your location is used only for local
            business insights. We do not continuously
            track your location.
          </p>

        </section>

        {/* ANALYSIS */}

        <section
          className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
          aria-labelledby="analysis-title"
        >

          <div className="flex items-start gap-3">

            <Compass className="mt-1 h-5 w-5 text-orange-600" />

            <div>

              <h2
                id="analysis-title"
                className="text-lg font-bold text-slate-900"
              >
                Analyze your area
              </h2>

              <p className="text-sm text-slate-600">
                Compare demo market estimates with
                AI-generated local opportunities.
              </p>

            </div>

          </div>

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-sm leading-relaxed text-slate-700">

              <strong>Two analysis layers:</strong>

              <br />

              📊 Demo Estimate — predefined demonstration
              market patterns.

              <br />

              🤖 AI Estimate — AI-generated, non-binding
              business opportunities based on the
              supplied location.

            </p>

          </div>

          <button
            type="button"
            onClick={analyzeArea}
            disabled={
              isAnalyzing ||
              !hasArea
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >

            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />

                Analyzing Demo + AI Market...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />

                Analyze My Area
              </>
            )}

          </button>

        </section>

      </div>

      {/* ======================================================
          MANUAL LOCATION
      ====================================================== */}

      {showManual && (
        <form
          onSubmit={saveManualLocation}
          className="space-y-4 rounded-3xl border border-orange-200 bg-orange-50/60 p-6"
        >

          <div>

            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Alternative
            </span>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Enter your area
            </h2>

            <p className="text-sm text-slate-700">
              GPS is optional. Enter your general area
              for the analysis.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {[
              [
                'town',
                'Village / Town',
                'Bhimavaram'
              ],
              [
                'district',
                'District',
                'West Godavari'
              ],
              [
                'state',
                'State',
                'Andhra Pradesh'
              ],
              [
                'pin',
                'PIN Code',
                '534202'
              ]
            ].map(
              ([
                key,
                label,
                placeholder
              ]) => (
                <label
                  key={key}
                  className="text-xs font-bold text-slate-800"
                >

                  {label}

                  <input
                    inputMode={
                      key === 'pin'
                        ? 'numeric'
                        : undefined
                    }
                    value={location[key]}
                    onChange={(event) =>
                      setLocation({
                        ...location,
                        [key]:
                          event.target.value
                      })
                    }
                    placeholder={placeholder}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500"
                  />

                </label>
              )
            )}

          </div>

          <button
            type="submit"
            className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
          >
            Save Area
          </button>

        </form>
      )}

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!analysis && !aiAnalysis && (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">

          <Compass className="mx-auto h-8 w-8 text-orange-500" />

          <h2 className="mt-3 text-xl font-bold text-slate-900">
            Your local opportunity map starts here
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Set your area above, then run the analysis
            to compare demo and AI business opportunities.
          </p>

        </section>
      )}

      {/* ======================================================
          DEMO ESTIMATE
      ====================================================== */}

      {analysis && (
        <>
          <section className="rounded-3xl border border-orange-200 bg-orange-50/60 p-6">

            <div className="flex items-center gap-2">

              <CheckCircle2 className="h-5 w-5 text-orange-600" />

              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                Demo Estimate
              </span>

            </div>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Demo opportunities for {analysis.locationLabel}
            </h2>

            <p className="mt-1 text-sm text-slate-700">
              {analysis.sourceNote}
            </p>

          </section>

          <section className="space-y-4">

            <div>

              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                📊 Demo Market Estimate
              </span>

              <h2 className="text-xl font-bold text-slate-900">
                Top demo business opportunities
              </h2>

              <p className="text-sm text-slate-700">
                These are predefined demonstration
                estimates used as a baseline for the
                hackathon.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              {analysis.opportunities
                .slice(0, 3)
                .map(
                  (opportunity, index) => (
                    <OpportunityCard
                      key={
                        opportunity.businessName
                      }
                      opportunity={
                        opportunity
                      }
                      rank={index + 1}
                    />
                  )
                )}

            </div>

          </section>

          <section className="space-y-4">

            <div>

              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                Local Market Analyst
              </span>

              <h2 className="text-xl font-bold text-slate-900">
                How to validate the demo opportunities
              </h2>

            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              {analysis.opportunities
                .slice(0, 3)
                .map(
                  (opportunity) => (
                    <article
                      key={`${opportunity.businessName}-analyst`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >

                      <h3 className="font-bold text-slate-900">
                        {opportunity.businessName}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-slate-700">

                        <strong>
                          Why here:
                        </strong>{' '}

                        {opportunity.whyHere}

                      </p>

                      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">

                        <div className="rounded-xl bg-orange-50 p-3">

                          <dt className="font-semibold text-orange-900">
                            Initial investment
                          </dt>

                          <dd className="mt-1 font-bold text-orange-800">
                            {opportunity.investment}
                          </dd>

                        </div>

                        <div className="rounded-xl bg-emerald-50 p-3">

                          <dt className="font-semibold text-emerald-900">
                            Payback estimate
                          </dt>

                          <dd className="mt-1 font-bold text-emerald-800">
                            {opportunity.payback}
                          </dd>

                        </div>

                      </dl>

                      <p className="mt-4 text-sm leading-relaxed text-slate-700">

                        <strong>
                          Step 1:
                        </strong>{' '}

                        {opportunity.firstStep}

                      </p>

                    </article>
                  )
                )}

            </div>

          </section>

          <section className="space-y-4">

            <h2 className="text-xl font-bold text-slate-900">
              Demo Nearby Business Overview
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {analysis.nearbyOverview.map(
                (item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >

                    <strong className="block text-2xl text-orange-700">
                      {item.count}
                    </strong>

                    <span className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </span>

                  </div>
                )
              )}

            </div>

          </section>
        </>
      )}

      {/* ======================================================
          AI ERROR
      ====================================================== */}

      {aiError && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">

          <div className="flex items-start gap-3">

            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />

            <div>

              <h3 className="font-bold text-amber-900">
                AI Estimate Unavailable
              </h3>

              <p className="mt-1 text-sm text-amber-800">
                {aiError}
              </p>

              <p className="mt-2 text-xs text-amber-700">
                The Demo Estimate is still available
                above.
              </p>

            </div>

          </div>

        </section>
      )}

      {/* ======================================================
          AI ESTIMATE
      ====================================================== */}

      {aiAnalysis && (
        <section className="space-y-5">

          <div className="rounded-3xl border border-violet-200 bg-violet-50/70 p-6">

            <div className="flex flex-wrap items-start justify-between gap-3">

              <div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">

                  <Sparkles className="h-3.5 w-3.5" />

                  AI ESTIMATE

                </span>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  AI Opportunities for{' '}
                  {aiAnalysis.locationLabel}
                </h2>

                <p className="mt-1 text-sm text-slate-700">
                  {aiAnalysis.areaSummary}
                </p>

              </div>

            </div>

            <div className="mt-4 rounded-2xl border border-violet-200 bg-white p-3 text-xs text-slate-600">

              <strong className="text-violet-800">
                Non-binding AI estimate:
              </strong>{' '}

              {aiAnalysis.sourceNote}

            </div>

          </div>

          <div>

            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
              🤖 AI Market Analysis
            </span>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              AI-generated business opportunities
            </h2>

            <p className="mt-1 text-sm text-slate-700">
              These estimates are generated from the
              supplied area information and should be
              validated locally before investing.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {aiAnalysis.opportunities
              ?.slice(0, 3)
              .map(
                (opportunity, index) => (
                  <article
                    key={`${opportunity.businessName}-${index}`}
                    className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase text-violet-700">
                          AI Opportunity #{index + 1}
                        </span>

                        <h3 className="mt-2 text-lg font-black text-slate-900">
                          {opportunity.businessName}
                        </h3>

                        <p className="mt-0.5 text-xs font-semibold text-slate-500">
                          {opportunity.category}
                        </p>

                      </div>

                      <div className="rounded-xl bg-violet-50 px-3 py-2 text-center">

                        <span className="block text-[10px] font-bold uppercase text-violet-600">
                          Score
                        </span>

                        <strong className="text-xl font-black text-violet-800">
                          {opportunity.opportunityScore}
                        </strong>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-emerald-50 p-3">

                        <span className="block text-[10px] font-bold uppercase text-emerald-700">
                          Demand
                        </span>

                        <strong className="text-sm text-emerald-900">
                          {opportunity.demand}
                        </strong>

                      </div>

                      <div className="rounded-xl bg-orange-50 p-3">

                        <span className="block text-[10px] font-bold uppercase text-orange-700">
                          Competition
                        </span>

                        <strong className="text-sm text-orange-900">
                          {opportunity.competition}
                        </strong>

                      </div>

                    </div>

                    <div className="mt-4 space-y-3">

                      <div className="rounded-xl bg-slate-50 p-3">

                        <span className="block text-[10px] font-bold uppercase text-slate-500">
                          Why this fits
                        </span>

                        <p className="mt-1 text-xs leading-relaxed text-slate-700">
                          {opportunity.whyHere}
                        </p>

                      </div>

                      <div>

                        <span className="block text-[10px] font-bold uppercase text-slate-500">
                          Target Customers
                        </span>

                        <ul className="mt-1 space-y-1 text-xs text-slate-700">

                          {(
                            opportunity.targetCustomers ||
                            []
                          ).map(
                            (
                              customer,
                              customerIndex
                            ) => (
                              <li
                                key={customerIndex}
                              >
                                • {customer}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-slate-200 p-3">

                        <span className="block text-[10px] font-bold uppercase text-slate-500">
                          Investment
                        </span>

                        <strong className="mt-1 block text-xs text-slate-900">
                          {opportunity.estimatedInvestment}
                        </strong>

                      </div>

                      <div className="rounded-xl border border-slate-200 p-3">

                        <span className="block text-[10px] font-bold uppercase text-slate-500">
                          Monthly Revenue
                        </span>

                        <strong className="mt-1 block text-xs text-slate-900">
                          {opportunity.estimatedMonthlyRevenue}
                        </strong>

                      </div>

                      <div className="rounded-xl border border-slate-200 p-3">

                        <span className="block text-[10px] font-bold uppercase text-slate-500">
                          Monthly Expense
                        </span>

                        <strong className="mt-1 block text-xs text-slate-900">
                          {opportunity.estimatedMonthlyExpense}
                        </strong>

                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">

                        <span className="block text-[10px] font-bold uppercase text-emerald-700">
                          Monthly Profit
                        </span>

                        <strong className="mt-1 block text-xs text-emerald-900">
                          {opportunity.estimatedMonthlyProfit}
                        </strong>

                      </div>

                    </div>

                    <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-3">

                      <span className="block text-[10px] font-bold uppercase text-violet-700">
                        First Validation Step
                      </span>

                      <p className="mt-1 text-xs leading-relaxed text-violet-900">
                        {opportunity.firstStep}
                      </p>

                    </div>

                  </article>
                )
              )}

          </div>

        </section>
      )}

      {/* ======================================================
          FINAL DISCLAIMER
      ====================================================== */}

      {(analysis || aiAnalysis) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">

          <strong className="text-slate-800">
            Important:
          </strong>{' '}

          Demo and AI figures are estimates for
          decision-support and demonstration purposes.
          They are not guarantees of demand, revenue,
          profit, or business success. Verify local
          demand, competition, costs, regulations, and
          government information before investing.

        </div>
      )}

    </div>
  );
};

export default BusinessOpportunity;