// Currency and Number formatters for Indian Locale

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
};

export const formatNumber = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateProfit = (sellingPrice, costPrice) => {
  return Number(sellingPrice || 0) - Number(costPrice || 0);
};

export const calculateMargin = (profit, sellingPrice) => {
  const sp = Number(sellingPrice || 0);
  if (sp <= 0) return 0;
  return ((Number(profit || 0) / sp) * 100).toFixed(1);
};
