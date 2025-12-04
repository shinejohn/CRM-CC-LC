import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
export const SubNavigationBar = () => {
  const links = [{
    label: 'Community Influencer',
    path: '/community-influencer'
  }, {
    label: 'Community Expert',
    path: '/community-expert'
  }, {
    label: 'Campaigns',
    path: '/campaigns'
  }, {
    label: 'Feature Sponsors',
    path: '/sponsors'
  }, {
    label: 'Ads',
    path: '/ads'
  }];
  return <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg border-y-2 border-cyan-400">
      <div className="flex items-center justify-around py-3 px-4">
        {links.map((link, index) => <Link key={link.path} to={link.path} className="group flex items-center space-x-2 text-sm font-bold hover:text-cyan-200 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/10">
            <SparklesIcon size={14} className="group-hover:rotate-12 transition-transform duration-200" />
            <span>{link.label}</span>
          </Link>)}
      </div>
    </div>;
};