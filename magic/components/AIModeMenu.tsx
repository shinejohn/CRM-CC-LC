import React, { useState } from 'react';
import { MenuIcon, XIcon, VideoIcon, PresentationIcon, BarChartIcon, FileTextIcon, BriefcaseIcon, TrendingUpIcon, WorkflowIcon, CalendarIcon } from 'lucide-react';
interface MenuItem {
  name: string;
  path: string;
  icon: ReactNode;
  description: string;
}
interface AIModeMenuProps {
  onNavigate?: (path: string) => void;
}
export const AIModeMenu = ({
  onNavigate
}: AIModeMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems: MenuItem[] = [{
    name: 'General Meeting',
    path: '/ai/video-call',
    icon: <VideoIcon size={20} />,
    description: 'Standard video call with notes'
  }, {
    name: 'Presentation',
    path: '/ai/presentation',
    icon: <PresentationIcon size={20} />,
    description: 'Slide presentations with AI summaries'
  }, {
    name: 'Data Report',
    path: '/ai/data-report',
    icon: <BarChartIcon size={20} />,
    description: 'Analytics and performance review'
  }, {
    name: 'AI Workflow',
    path: '/ai/workflow',
    icon: <WorkflowIcon size={20} />,
    description: 'AI pipeline design sessions'
  }, {
    name: 'Business Profile',
    path: '/ai/business-profile',
    icon: <BriefcaseIcon size={20} />,
    description: 'Company analysis and profiles'
  }, {
    name: 'Client Proposal',
    path: '/ai/proposal',
    icon: <FileTextIcon size={20} />,
    description: 'Proposal creation and editing'
  }, {
    name: 'Marketing Strategy',
    path: '/ai/marketing',
    icon: <TrendingUpIcon size={20} />,
    description: 'Marketing plans and competitive analysis'
  }, {
    name: 'Schedule',
    path: '/ai/schedule',
    icon: <CalendarIcon size={20} />,
    description: 'Calendar and call scheduling'
  }];
  const handleItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setIsOpen(false);
  };
  return <>
      {/* Hamburger Button */}
      <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-slate-700 rounded-md transition-colors text-white" aria-label="Open AI Mode menu">
        <MenuIcon size={24} className="text-white" />
      </button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => setIsOpen(false)} />}

      {/* Slide-out Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Menu Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">AI Mode</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-700 rounded-md transition-colors" aria-label="Close menu">
            <XIcon size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          <div className="p-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-4">
              Call Types
            </p>
            <div className="space-y-2">
              {menuItems.map(item => <button key={item.path} onClick={() => handleItemClick(item.path)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-start space-x-3">
                    <div className="text-gray-600 group-hover:text-blue-600 transition-colors mt-0.5">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>)}
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">AI-Assisted Collaboration</p>
              <p className="text-gray-500">
                Voice recognition, real-time chat, and intelligent facilitation
                for all call types.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>;
};