import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LocationPicker from '../components/common/LocationPicker.jsx';
import { Store, ArrowRight, CheckCircle2 } from 'lucide-react';

const Onboarding = () => {
  const { t } = useLanguage();
  const { business, updateBusiness, location: savedLocation, saveLocation, loadNearbyMarkets } = useBusiness();
  const navigate = useNavigate();

  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLocationSaved = async (latitude, longitude) => {
    const resolved = await saveLocation(latitude, longitude);
    const resolvedLabel = resolved?.display_name || resolved?.city || '';
    setLocation(resolvedLabel);
    setState(resolved?.state || '');
    try {
      await loadNearbyMarkets();
    } catch {
      // Location remains saved even if the optional nearby-market request fails.
    }
    return resolved;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBusiness({
        name: bizName,
        category,
        location,
        state,
        description
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Set Up Your Business Profile</h2>
            <p className="text-xs text-slate-500">Configure your business to personalize AI insights and financial calculations</p>
          </div>
        </div>

          <LocationPicker location={savedLocation} onSaved={handleLocationSaved} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
            <input
              type="text"
              required
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              >
                <option value="Food Products">Food Products (Pickles, Spices)</option>
                <option value="Dairy & Farming">Dairy & Farming</option>
                <option value="Tailoring & Garments">Tailoring & Garments</option>
                <option value="Handicrafts">Handicrafts & Artisans</option>
                <option value="Small Retail / Kirana">Small Retail / Kirana</option>
                <option value="Local Services">Local Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Town / Village / Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Saving Setup...' : 'Enter Business Dashboard'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
