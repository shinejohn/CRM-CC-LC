import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDownIcon, 
  UserCircleIcon, 
  LogInIcon, 
  UserPlusIcon,
  BookOpenIcon,
  SearchIcon,
  GlobeIcon,
  MegaphoneIcon,
  ZapIcon,
  BriefcaseIcon
} from 'lucide-react';

export const NewMainHeader = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleMouseEnter = (dropdown: string) => {
    setOpenDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  // Publications dropdown - All websites
  const publications = [
    { label: 'Day News', url: 'https://www.day.news', color: 'text-red-600' },
    { label: 'Go Event City', url: 'https://www.goeventcity.com', color: 'text-emerald-700' },
    { label: 'Downtowns Guide', url: 'https://www.downtownsguide.com', color: 'text-orange-600' },
    { label: 'AlphaSite', url: 'https://www.alphasite.ai', color: 'text-indigo-600' },
    { label: 'Go Local Voices', url: 'https://www.golocalvoices.com', color: 'text-violet-700' },
  ];

  // Marketing Plan dropdown - Community Influencer menu
  const marketingPlan = [
    { label: 'Community Influencer', path: '/community-influencer' },
    { label: 'Community Expert', path: '/community-expert' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Feature Sponsors', path: '/sponsors' },
    { label: 'Ads', path: '/ads' },
  ];

  // Action dropdown - Articles, Events, Classifieds, etc.
  const actions = [
    { label: 'Article', path: '/article' },
    { label: 'Events', path: '/events' },
    { label: 'Classifieds', path: '/classifieds' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Coupons', path: '/coupons' },
    { label: 'Incentives', path: '/incentives' },
    { label: 'Tickets', path: '/tickets' },
    { label: 'AI', path: '/ai' },
  ];

  // Business Profile dropdown
  const businessProfile = [
    { label: 'Profile', path: '/profile' },
    { label: 'FAQ', path: '/faqs' },
    { label: 'Survey', path: '/survey' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Todos', path: '/todos' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const userLinks = [
    { label: 'Profile', path: '/profile', icon: UserCircleIcon },
    { label: 'Sponsor', path: '/sponsor', icon: null },
  ];

  const authLinks = [
    { label: 'Login', path: '/login', icon: LogInIcon },
    { label: 'Sign Up', path: '/signup', icon: UserPlusIcon },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Line 1: Logo + User Profile */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-4 border-amber-400 py-3 px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <span className="text-slate-900 font-black text-xl">4</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              4LocalBiz.com
            </span>
          </Link>
          <span className="text-xl font-bold text-amber-300 uppercase tracking-wider">
            Community Business Learning Center
          </span>
          
          {/* User Profile Area */}
          <div 
            className="relative" 
            onMouseEnter={() => setIsUserOpen(true)} 
            onMouseLeave={() => setIsUserOpen(false)}
          >
            <button className="flex items-center space-x-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all duration-200 shadow-lg">
              <UserCircleIcon size={20} />
              <span>USER PROFILE</span>
              <ChevronDownIcon size={14} />
            </button>

            {isUserOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-purple-600 z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b-2 border-purple-200 mb-2">
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    User Menu
                  </p>
                </div>

                {userLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-150"
                    >
                      {Icon && <Icon size={16} />}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                <div className="my-2 border-t-2 border-purple-200"></div>

                <div className="px-2 space-y-2">
                  {authLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.path} 
                        to={link.path} 
                        className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Icon size={16} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line 2: Menu with Dropdowns + Learn/Search */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Menu Dropdowns */}
          <div className="flex items-center space-x-4">
            {/* Publications Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('publications')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                <GlobeIcon size={16} />
                <span>Publications</span>
                <ChevronDownIcon size={14} className={openDropdown === 'publications' ? 'rotate-180' : ''} />
              </button>
              {openDropdown === 'publications' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-indigo-200 z-50 py-2">
                  {publications.map((pub) => (
                    <a
                      key={pub.url}
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-2 text-sm font-medium ${pub.color} hover:bg-indigo-50 transition-colors`}
                    >
                      {pub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Marketing Plan Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('marketing')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200">
                <MegaphoneIcon size={16} />
                <span>Marketing Plan</span>
                <ChevronDownIcon size={14} className={openDropdown === 'marketing' ? 'rotate-180' : ''} />
              </button>
              {openDropdown === 'marketing' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-emerald-200 z-50 py-2">
                  {marketingPlan.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Action Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('action')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-sm font-bold text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200">
                <ZapIcon size={16} />
                <span>Action</span>
                <ChevronDownIcon size={14} className={openDropdown === 'action' ? 'rotate-180' : ''} />
              </button>
              {openDropdown === 'action' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-violet-200 z-50 py-2">
                  {actions.map((action) => (
                    <Link
                      key={action.path}
                      to={action.path}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Business Profile Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('business')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <BriefcaseIcon size={16} />
                <span>Business Profile</span>
                <ChevronDownIcon size={14} className={openDropdown === 'business' ? 'rotate-180' : ''} />
              </button>
              {openDropdown === 'business' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-blue-200 z-50 py-2">
                  {businessProfile.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Learn Button + Search Box */}
          <div className="flex items-center space-x-4">
            {/* Learn Dropdown Button */}
            <div 
              className="relative" 
              onMouseEnter={() => setIsLearnOpen(true)} 
              onMouseLeave={() => setIsLearnOpen(false)}
            >
              <button className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold uppercase tracking-wider shadow-lg transition-all duration-200">
                <BookOpenIcon size={16} />
                <span className="text-xs">LEARN</span>
                <ChevronDownIcon size={14} className={isLearnOpen ? 'rotate-180' : ''} />
              </button>

              {/* Learn Mega Dropdown - Full content */}
              {isLearnOpen && (
                <div className="absolute top-full right-0 mt-2 w-[1000px] bg-white rounded-xl shadow-2xl border-2 border-amber-400 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-4 pb-4 border-b-2 border-amber-200">
                    <h3 className="text-xl font-black text-slate-800">Learning Center</h3>
                    <p className="text-sm text-slate-600 mt-1">Explore resources, tutorials, and community content</p>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {/* Getting Started */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpenIcon size={18} className="text-blue-600" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Getting Started</h4>
                      </div>
                      <div className="space-y-1">
                        <Link to="/learn/overview" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Platform Overview</Link>
                        <Link to="/learn/quickstart" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Quick Start Guide</Link>
                        <Link to="/learn/first-steps" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">First Steps Tutorial</Link>
                        <Link to="/learn/account-setup" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Account Setup</Link>
                      </div>
                    </div>

                    {/* Video Tutorials */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpenIcon size={18} className="text-red-600" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Video Tutorials</h4>
                      </div>
                      <div className="space-y-1">
                        <Link to="/learn/video-basics" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Video Call Basics</Link>
                        <Link to="/learn/presentation-tips" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Presentation Tips</Link>
                        <Link to="/learn/ai-features" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">AI Features Overview</Link>
                        <Link to="/learn/workflows" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Advanced Workflows</Link>
                      </div>
                    </div>

                    {/* Documentation */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpenIcon size={18} className="text-green-600" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Documentation</h4>
                      </div>
                      <div className="space-y-1">
                        <Link to="/learn/manual" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">User Manual</Link>
                        <Link to="/learn/api" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">API Documentation</Link>
                        <Link to="/learn/best-practices" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Best Practices</Link>
                        <Link to="/learn/troubleshooting" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Troubleshooting</Link>
                      </div>
                    </div>

                    {/* Resources & Campaigns */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpenIcon size={18} className="text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Resources</h4>
                      </div>
                      <div className="space-y-1">
                        <Link to="/learn/templates" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Templates Library</Link>
                        <Link to="/learn/case-studies" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Case Studies</Link>
                        <Link to="/learn/reports" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">Industry Reports</Link>
                        <Link to="/learning/campaigns" className="block px-3 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-150">📧 Email Campaigns (60)</Link>
                      </div>
                    </div>
                  </div>

                  {/* Featured Section at Bottom */}
                  <div className="mt-6 pt-6 border-t-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">🎓 New to Fibonacco?</h4>
                        <p className="text-xs text-slate-600">Start with our comprehensive onboarding course</p>
                      </div>
                      <Link to="/learn/getting-started" className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-bold text-sm transition-colors duration-200 shadow-md">
                        Start Learning →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 w-64 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm" 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

