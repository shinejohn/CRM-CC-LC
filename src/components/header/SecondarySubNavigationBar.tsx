import React from 'react';
import { Link } from 'react-router';
import { StarIcon } from 'lucide-react';
export const SecondarySubNavigationBar = () => {
  const links = [{
    label: 'Article',
    path: '/article'
  }, {
    label: 'Events',
    path: '/events'
  }, {
    label: 'Classifieds',
    path: '/classifieds'
  }, {
    label: 'Announcements',
    path: '/announcements'
  }, {
    label: 'Coupons',
    path: '/coupons'
  }, {
    label: 'Incentives',
    path: '/incentives'
  }, {
    label: 'Tickets',
    path: '/tickets'
  }, {
    label: 'AI',
    path: '/ai'
  }];
  return <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg border-y-2 border-violet-400">
      <div className="flex items-center justify-around py-3 px-4">
        {links.map(link => <Link key={link.path} to={link.path} className="group flex items-center space-x-2 text-sm font-bold hover:text-violet-200 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/10">
            <StarIcon size={14} className="group-hover:scale-125 transition-transform duration-200" />
            <span>{link.label}</span>
          </Link>)}
      </div>
    </div>;
};