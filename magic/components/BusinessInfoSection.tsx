import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Globe, Mail, Clock, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
export function BusinessInfoSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Business Information</h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="border-t border-slate-100">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                    Business Name
                  </label>
                  <p className="text-slate-900 font-medium">
                    ABC Home Services
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                    Category
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                      Home Services
                    </span>
                    <span className="text-slate-400">›</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                      Plumbing
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                        Address
                      </label>
                      <p className="text-slate-900">
                        123 Main St, Anytown, FL 33444
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                        Phone
                      </label>
                      <p className="text-slate-900 flex items-center gap-2">
                        (555) 123-4567
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                        Email
                      </label>
                      <p className="text-slate-900">info@abchome.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">
                        Website
                      </label>
                      <a href="#" className="text-blue-600 hover:underline">
                        www.abchomeservices.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Business Hours
                  </label>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <div className="text-xs font-bold text-slate-500 mb-1">
                            {day}
                          </div>
                          <div className={`text-xs font-medium ${day === 'Sun' ? 'text-slate-400' : 'text-slate-900'}`}>
                            {day === 'Sat' ? '9-2' : day === 'Sun' ? 'Off' : '8-6'}
                          </div>
                        </div>)}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 block">
                    Service Area
                  </label>
                  <div className="bg-slate-100 rounded-xl h-48 w-full flex items-center justify-center border border-slate-200 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-80.1918,25.7617,12,0/600x300?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsZXlzM20wM25qMnVwYmJ5bDB3bHhpIn0.x-example')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                    <div className="relative z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
                      15 mile radius
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}