import React, { useState } from 'react';
import { Link } from 'react-router';
import { LayoutGridIcon, VideoIcon, PresentationIcon, BarChart2Icon, TrendingUpIcon, BriefcaseIcon, DatabaseIcon, FileTextIcon, NetworkIcon, FolderIcon, CalendarIcon } from 'lucide-react';
export const AccountManagerButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = [{
    label: 'Video Call',
    path: '/',
    icon: VideoIcon,
    color: 'text-blue-600'
  }, {
    label: 'Presentation',
    path: '/presentation',
    icon: PresentationIcon,
    color: 'text-purple-600'
  }, {
    label: 'Data Report',
    path: '/report',
    icon: BarChart2Icon,
    color: 'text-green-600'
  }, {
    label: 'Marketing Report',
    path: '/marketing-report',
    icon: TrendingUpIcon,
    color: 'text-pink-600'
  }, {
    label: 'Business Profile',
    path: '/business-profile',
    icon: BriefcaseIcon,
    color: 'text-orange-600'
  }, {
    label: 'Data Analytics',
    path: '/data-analytics',
    icon: DatabaseIcon,
    color: 'text-cyan-600'
  }, {
    label: 'Client Proposal',
    path: '/client-proposal',
    icon: FileTextIcon,
    color: 'text-indigo-600'
  }, {
    label: 'AI Workflow',
    path: '/ai-workflow',
    icon: NetworkIcon,
    color: 'text-violet-600'
  }, {
    label: 'My Files',
    path: '/files',
    icon: FolderIcon,
    color: 'text-yellow-600'
  }, {
    label: 'Schedule Calls',
    path: '/schedule',
    icon: CalendarIcon,
    color: 'text-red-600'
  }];
  return <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button className="h-full px-8 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm flex flex-col items-center justify-center transition-all duration-200 shadow-lg border-r-4 border-blue-800 group">
        <LayoutGridIcon size={28} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-xs">AI</span>
        <span className="text-xs">Account</span>
        <span className="text-xs">Manager</span>
      </button>

      {isOpen && <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-blue-600 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b-2 border-blue-200 pb-2">
            Meeting Tools
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {links.map(link => {
          const Icon = link.icon;
          return <Link key={link.path} to={link.path} className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-150 border border-transparent hover:border-blue-200 hover:shadow-md group">
                  <Icon size={20} className={`${link.color} group-hover:scale-110 transition-transform duration-200`} />
                  <span className="font-semibold">{link.label}</span>
                </Link>;
        })}
          </div>
        </div>}
    </div>;
};