import React, { useState } from 'react';
import { Link } from 'react-router';
import { UserCircleIcon, ChevronDownIcon, LogInIcon, UserPlusIcon } from 'lucide-react';
export const UserProfileArea = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = [{
    label: 'Profile',
    path: '/profile',
    icon: UserCircleIcon
  }, {
    label: 'Sponsor',
    path: '/sponsor',
    icon: null
  }];
  const authLinks = [{
    label: 'Login',
    path: '/login',
    icon: LogInIcon,
    highlight: true
  }, {
    label: 'Sign Up',
    path: '/signup',
    icon: UserPlusIcon,
    highlight: true
  }];
  return <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button className="h-full px-8 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs flex flex-col items-center justify-center transition-all duration-200 shadow-lg border-l-4 border-purple-800 group">
        <UserCircleIcon size={32} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
        <span>USER</span>
        <span>PROFILE</span>
        <span>AREA</span>
        <ChevronDownIcon size={14} className="mt-1 group-hover:translate-y-1 transition-transform duration-200" />
      </button>

      {isOpen && <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-purple-600 z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b-2 border-purple-200 mb-2">
            <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              User Menu
            </p>
          </div>

          {/* Profile Links */}
          {links.map(link => {
        const Icon = link.icon;
        return <Link key={link.path} to={link.path} className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-150">
                {Icon && <Icon size={16} />}
                <span>{link.label}</span>
              </Link>;
      })}

          {/* Divider */}
          <div className="my-2 border-t-2 border-purple-200"></div>

          {/* Authentication Links */}
          <div className="px-2 space-y-2">
            {authLinks.map(link => {
          const Icon = link.icon;
          return <Link key={link.path} to={link.path} className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>;
        })}
          </div>
        </div>}
    </div>;
};