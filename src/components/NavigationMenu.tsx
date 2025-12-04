import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, HomeIcon, PresentationIcon, BarChart2Icon, TrendingUpIcon, BriefcaseIcon, DatabaseIcon, XIcon, FileTextIcon, NetworkIcon, FolderIcon, UserIcon, LogInIcon, UserPlusIcon, CalendarIcon } from 'lucide-react';
export const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const menuItems = [{
    path: '/',
    label: 'Video Call',
    icon: <HomeIcon size={18} />
  }, {
    path: '/presentation',
    label: 'Presentation',
    icon: <PresentationIcon size={18} />
  }, {
    path: '/report',
    label: 'Data Report',
    icon: <BarChart2Icon size={18} />
  }, {
    path: '/marketing-report',
    label: 'Marketing Report',
    icon: <TrendingUpIcon size={18} />
  }, {
    path: '/business-profile',
    label: 'Business Profile',
    icon: <BriefcaseIcon size={18} />
  }, {
    path: '/data-analytics',
    label: 'Data Analytics',
    icon: <DatabaseIcon size={18} />
  }, {
    path: '/client-proposal',
    label: 'Client Proposal',
    icon: <FileTextIcon size={18} />
  }, {
    path: '/ai-workflow',
    label: 'AI Workflow',
    icon: <NetworkIcon size={18} />
  }, {
    path: '/files',
    label: 'My Files',
    icon: <FolderIcon size={18} />
  }, {
    path: '/schedule',
    label: 'Schedule Calls',
    icon: <CalendarIcon size={18} />
  }, {
    path: '/profile',
    label: 'My Profile',
    icon: <UserIcon size={18} />
  }, {
    path: '/login',
    label: 'Login',
    icon: <LogInIcon size={18} />
  }, {
    path: '/signup',
    label: 'Sign Up',
    icon: <UserPlusIcon size={18} />
  }];
  const groupedMenuItems = {
    'AI Meetings': menuItems.slice(0, 1),
    'Meeting Tools': menuItems.slice(1, 8),
    'My Account': menuItems.slice(8, 11),
    Authentication: menuItems.slice(11, 13)
  };
  return <div className="relative" ref={menuRef}>
      <button onClick={toggleMenu} className="p-2.5 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Navigation menu">
        <div className="relative w-5 h-5">
          <MenuIcon size={20} className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
          <XIcon size={20} className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}

      {/* Dropdown Menu */}
      <div className={`absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100 transition-all duration-300 origin-top-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
        <div className="py-2">
          {Object.entries(groupedMenuItems).map(([category, items], groupIndex) => <div key={category}>
                {groupIndex > 0 && <div className="my-2 mx-4 border-t border-gray-100" />}

                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category}
                  </h3>
                </div>

                <div className="space-y-0.5 px-2">
                  {items.map(item => <Link key={item.path} to={item.path} className="group flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200" onClick={() => setIsOpen(false)}>
                      <span className="mr-3 text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>)}
                </div>
              </div>)}
        </div>
      </div>
    </div>;
};