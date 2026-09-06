import React from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector.jsx';
import BrandLogo from '../common/BrandLogo.jsx';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-2"><BrandLogo /></div>
        <div className="mt-3 flex justify-center">
          <LanguageSelector />
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
