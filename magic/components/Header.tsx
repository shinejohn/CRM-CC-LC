import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, ChevronDown, Users, Link as LinkIcon } from 'lucide-react';
interface HeaderProps {
  toggleSidebar: () => void;
  onNavigate?: (page: string) => void;
}
export function Header({
  toggleSidebar,
  onNavigate
}: HeaderProps) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  return <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
            AP
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-800 leading-none">
              Acme Plumbing
            </h2>
            <p className="text-xs text-slate-500 leading-none mt-1">
              Business Pro
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input type="text" placeholder="Search... (⌘K)" className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="relative">
          <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {showSettingsMenu && <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <button onClick={() => {
              onNavigate?.('team-users');
              setShowSettingsMenu(false);
            }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <Users className="w-4 h-4 text-slate-400" />
                  Team & Users
                </button>
                <button onClick={() => {
              onNavigate?.('integrations');
              setShowSettingsMenu(false);
            }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  Integrations
                </button>
              </div>
            </>}
        </div>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 ml-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">John Doe</p>
            <p className="text-xs text-slate-500">Owner</p>
          </div>
          <button className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-blue-500/20 transition-all">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>;
}