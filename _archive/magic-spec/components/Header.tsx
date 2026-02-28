import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Settings, ChevronDown, Users, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

interface HeaderProps {
  toggleSidebar: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({
  toggleSidebar,
  onNavigate
}: HeaderProps) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  // Handle Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearch((show) => !show);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [showSearch]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
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
        <div className="hidden md:flex items-center relative cursor-text" onClick={() => setShowSearch(true)}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input type="text" placeholder="Search... (⌘K)" className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none transition-all pointer-events-none" readOnly />
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

          {showSettingsMenu && (
            <>
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
            </>
          )}
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

      <AnimatePresence>
        {showSearch && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowSearch(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Search across everything..." autoFocus className="flex-1 outline-none text-slate-900 placeholder-slate-400" />
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs">
                    ESC
                  </kbd>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Recent
                  </p>
                  <div className="space-y-2">
                    <button onClick={() => { navigate('/magic/customerdetailpage'); setShowSearch(false); }} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left transition-colors">
                      <div className="flex items-center gap-3">
                        <span>👤</span>
                        <span className="text-sm font-medium text-slate-900">
                          Acme Corporation
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Account</span>
                    </button>
                    <button onClick={() => { navigate('/magic/dealdetailpage'); setShowSearch(false); }} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left transition-colors">
                      <div className="flex items-center gap-3">
                        <span>💼</span>
                        <span className="text-sm font-medium text-slate-900">
                          Q1 Service Contract
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Deal</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Quick Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { navigate('/magic/pipelinepage'); setShowSearch(false); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-xs font-medium text-slate-700">
                      + New Deal
                    </button>
                    <button onClick={() => { navigate('/magic/addeditcustomerform'); setShowSearch(false); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-xs font-medium text-slate-700">
                      + New Account
                    </button>
                    <button onClick={() => { navigate('/magic/activitiespage'); setShowSearch(false); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-xs font-medium text-slate-700">
                      + New Activity
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}