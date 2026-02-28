import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown, Building2, Wrench, Store, Check } from 'lucide-react';
import { useBusinessMode, BusinessMode } from '../contexts/BusinessModeContext';
export function ModeSwitcher() {
  const {
    mode,
    setMode
  } = useBusinessMode();
  const [isOpen, setIsOpen] = useState(false);
  const modes = [{
    id: 'b2b-pipeline' as BusinessMode,
    name: 'B2B Pipeline',
    icon: Building2,
    description: 'Enterprise sales & accounts',
    color: 'bg-blue-500'
  }, {
    id: 'b2c-services' as BusinessMode,
    name: 'B2C Services',
    icon: Wrench,
    description: 'Service-based businesses',
    color: 'bg-emerald-500'
  }, {
    id: 'b2c-retail' as BusinessMode,
    name: 'B2C Retail',
    icon: Store,
    description: 'Retail & hospitality',
    color: 'bg-purple-500'
  }];
  const currentMode = modes.find(m => m.id === mode);
  return <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        y: 10,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 10,
        scale: 0.95
      }} className="absolute bottom-16 right-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden mb-2">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-700">
                <Settings className="w-4 h-4" />
                <h3 className="font-bold text-sm">Switch Business Mode</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                For testing & development
              </p>
            </div>

            <div className="p-2">
              {modes.map(modeOption => {
            const Icon = modeOption.icon;
            const isActive = mode === modeOption.id;
            return <button key={modeOption.id} onClick={() => {
              setMode(modeOption.id);
              setIsOpen(false);
            }} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-slate-50 border-2 border-transparent'}`}>
                    <div className={`p-2 ${modeOption.color} rounded-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm text-slate-900">
                        {modeOption.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {modeOption.description}
                      </p>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-blue-600" />}
                  </button>;
          })}
            </div>

            <div className="p-3 bg-amber-50 border-t border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> This switcher is for development only.
                End users will see their assigned mode.
              </p>
            </div>
          </motion.div>}
      </AnimatePresence>

      <motion.button whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }} onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors">
        {currentMode && <>
            <div className={`p-1.5 ${currentMode.color} rounded-lg`}>
              <currentMode.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Mode</p>
              <p className="font-bold text-sm">{currentMode.name}</p>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>}
      </motion.button>
    </div>;
}