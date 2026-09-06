import en from './locales/en.js';
import te from './locales/te.js';
import hi from './locales/hi.js';
import ta from './locales/ta.js';
import kn from './locales/kn.js';
import ml from './locales/ml.js';

export const LANGUAGES = [
  { code: 'te', label: 'తెలుగు (Telugu)', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'en', label: 'English', native: 'English', speechCode: 'en-IN' },
  { code: 'hi', label: 'हिंदी (Hindi)', native: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', native: 'മലയാളം', speechCode: 'ml-IN' }
];

export const translations = {
  en,
  te,
  hi,
  ta,
  kn,
  ml
};
