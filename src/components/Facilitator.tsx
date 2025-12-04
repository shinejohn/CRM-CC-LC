import React from 'react';
import { UserCircleIcon, BriefcaseIcon } from 'lucide-react';
export const Facilitator = ({
  isVisible,
  isVideoOff
}) => {
  if (!isVisible) return null;
  return <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg overflow-hidden shadow-lg">
      {isVideoOff ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
          <UserCircleIcon size={64} className="text-slate-600 mb-3" />
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <BriefcaseIcon size={16} className="text-slate-400" />
              <p className="text-sm font-semibold text-white">
                Account Manager
              </p>
            </div>
            <p className="text-lg font-bold text-white">Sarah Johnson</p>
            <p className="text-xs text-slate-400 mt-1">Video Off</p>
          </div>
        </div> : <>
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Account Manager" className="w-full h-full object-cover" style={{
        objectPosition: 'center 30%'
      }} />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center space-x-2">
              <BriefcaseIcon size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">
                Account Manager
              </span>
            </div>
            <p className="text-sm font-bold text-white">Sarah Johnson</p>
          </div>
        </>}
    </div>;
};