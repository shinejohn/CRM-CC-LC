import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, HomeIcon, PresentationIcon, BarChart2Icon, TrendingUpIcon, BriefcaseIcon, DatabaseIcon, XIcon, FileTextIcon, NetworkIcon, FolderIcon, UserIcon, LogInIcon, UserPlusIcon, CalendarIcon, ClockIcon } from 'lucide-react';
interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}
export const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const menuItems: MenuItem[] = [{
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
  // Group menu items by category
  const groupedMenuItems: Record<string, MenuItem[]> = {
    'AI Meetings': menuItems.slice(0, 1),
    'Meeting Tools': menuItems.slice(1, 8),
    'My Account': menuItems.slice(8, 11),
    Authentication: menuItems.slice(11, 13)
  };
  return <div className="relative" ref={menuRef}>
      <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Navigation menu">
        {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>
      {isOpen && <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {Object.entries(groupedMenuItems).map(([category, items]) => <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  {category}
                </div>
                {items.map(item => <Link key={item.path} to={item.path} className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                    <span className="mr-3 text-gray-600">{item.icon}</span>
                    {item.label}
                  </Link>)}
              </div>)}
          </div>
        </div>}
    </div>;
};