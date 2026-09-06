const opportunities = [
  {
    businessName: 'Homemade Pickles',
    category: 'Food Products',
    demand: 'High',
    competition: 'Low',
    nearbyBusinesses: 2,
    opportunityScore: 86,
    insight: 'Estimated demand is strong while local competition remains manageable.',
    reasons: ['High estimated demand', 'Low local competition', 'Suitable for small-scale production'],
    investment: '₹18,000-₹28,000',
    payback: '3-5 months',
    firstStep: 'Offer 20 trial jars to three nearby kirana stores and track repeat orders.'
  },
  {
    businessName: 'Spice Powders',
    category: 'Food Products',
    demand: 'High',
    competition: 'Medium',
    nearbyBusinesses: 4,
    opportunityScore: 78,
    insight: 'Locally made spice blends can serve families looking for familiar flavors.',
    reasons: ['Repeat-purchase category', 'Can start with a small range', 'Good fit for local customers'],
    investment: '₹15,000-₹25,000',
    payback: '3-6 months',
    firstStep: 'Test two spice blends with existing pickle customers through small sample packs.'
  },
  {
    businessName: 'Traditional Snacks',
    category: 'Homemade Foods',
    demand: 'Medium',
    competition: 'High',
    nearbyBusinesses: 8,
    opportunityScore: 61,
    insight: 'A distinct recipe or festival-focused offer could help this category stand out.',
    reasons: ['Familiar product category', 'Useful for local events', 'Differentiate through quality'],
    investment: '₹12,000-₹22,000',
    payback: '4-7 months',
    firstStep: 'Run a weekend tasting stall and collect paid pre-orders before scaling production.'
  },
  {
    businessName: 'Dairy Products',
    category: 'Dairy',
    demand: 'Medium',
    competition: 'Medium',
    nearbyBusinesses: 5,
    opportunityScore: 69,
    insight: 'Fresh dairy can work well when supply is reliable and delivery is convenient.',
    reasons: ['Everyday customer need', 'Local delivery potential', 'Opportunity for trusted quality'],
    investment: '₹25,000-₹40,000',
    payback: '5-8 months',
    firstStep: 'Interview ten households and one tea shop about their weekly supply needs.'
  },
  {
    businessName: 'Millet Products',
    category: 'Healthy Foods',
    demand: 'Medium',
    competition: 'Low',
    nearbyBusinesses: 2,
    opportunityScore: 74,
    insight: 'Millet products may appeal to health-conscious customers at accessible prices.',
    reasons: ['Low estimated competition', 'Growing awareness', 'Flexible product range'],
    investment: '₹20,000-₹35,000',
    payback: '4-7 months',
    firstStep: 'Create a 3-product sample bundle and validate pricing with existing customers.'
  }
];

export const analyzeBusinessArea = (location) => {
  const key = `${location.town || 'local'}-${location.district || 'market'}-${location.state || 'india'}`.toLowerCase();
  const offset = [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0) % opportunities.length;
  const ranked = opportunities.slice(offset).concat(opportunities.slice(0, offset));

  const area = location.town || location.district || location.state || 'your area';
  const localizedOpportunities = ranked.map((opportunity) => ({
    ...opportunity,
    whyHere: `${area} can support this opportunity through nearby household demand, local retail channels, and accessible small-batch sourcing.`
  }));

  return {
    locationLabel: [location.town, location.district, location.state].filter(Boolean).join(', '),
    sourceLabel: 'Demo Market Analysis',
    sourceNote: 'Estimated from demo local-business patterns. Connect a verified market data source for live insights.',
    opportunities: localizedOpportunities,
    nearbyOverview: [
      { label: 'Food Shops', count: 12 },
      { label: 'Grocery Stores', count: 8 },
      { label: 'Snack Shops', count: 5 },
      { label: 'Dairy Shops', count: 3 }
    ]
  };
};
