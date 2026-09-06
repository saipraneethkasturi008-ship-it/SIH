import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { ArrowRight } from 'lucide-react';

const Register = () => {
  const { t, languages, currentLanguage, changeLanguage } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        phone,
        state,
        language: currentLanguage,
        password
      });

      navigate('/onboarding');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">
          {t.nav?.register || 'Register'}
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Join VyaparMitra and start your rural business journey
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Your Full Name
          </label>

          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="e.g. Lakshmi Devi"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mobile Number
          </label>

          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="e.g. 9876543210"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="e.g. test@example.com"
          />
        </div>

        {/* State + Language */}
        <div className="grid grid-cols-2 gap-3">

          {/* State */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State
            </label>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            >
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Language
            </label>

            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Create Password / PIN
          </label>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <span>
            {loading ? 'Creating Account...' : 'Continue to Setup'}
          </span>

          <ArrowRight className="w-4 h-4" />
        </button>

      </form>

      {/* Login Link */}
      <div className="text-center text-xs text-slate-500">
        Already registered?{' '}

        <Link
          to="/login"
          className="font-bold text-orange-600 hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
};

export default Register;