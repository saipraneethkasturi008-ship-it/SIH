import React from 'react';
import { CheckCircle2, MapPin, TrendingUp } from 'lucide-react';

const OpportunityCard = ({ opportunity, rank }) => (
  <article className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="text-[11px] font-bold text-orange-600">0{rank}</span>
        <h3 className="text-lg font-bold text-slate-900">{opportunity.businessName}</h3>
        <p className="text-xs text-slate-500">{opportunity.category}</p>
      </div>
      <div className="text-right">
        <strong className="text-2xl text-orange-700">{opportunity.opportunityScore}</strong>
        <span className="text-xs text-slate-500">/100</span>
      </div>
    </div>
    <div className="flex gap-2 text-xs font-semibold">
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">Demand: {opportunity.demand}</span>
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900">Competition: {opportunity.competition}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-700">
      <MapPin className="h-4 w-4 text-orange-600" />
      {opportunity.nearbyBusinesses} nearby similar {opportunity.nearbyBusinesses === 1 ? 'business' : 'businesses'}
    </div>
    <p className="flex gap-2 text-sm leading-relaxed text-slate-700">
      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      {opportunity.insight}
    </p>
    <ul className="space-y-2 text-xs text-slate-700">
      {opportunity.reasons.map((reason) => (
        <li key={reason} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  </article>
);

export default OpportunityCard;
