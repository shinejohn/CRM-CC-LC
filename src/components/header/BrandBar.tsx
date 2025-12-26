import React from 'react';
import { Link } from 'react-router';
export const BrandBar = () => {
  return <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-4 border-amber-400 py-4 px-6 shadow-md">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg">
            <span className="text-slate-900 font-black text-xl">4</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            4LocalBiz.com
          </span>
        </Link>
        <span className="text-2xl font-bold text-amber-300 uppercase tracking-wider">
          Community Business Learning Center
        </span>
        <div className="w-32"></div>
      </div>
    </div>;
};