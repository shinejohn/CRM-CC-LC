import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MessageSquare, ChevronDown, Star } from 'lucide-react';
interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    name: string;
    role: string;
    price: number;
    rating: number;
    features: string[];
    integrations: string[];
    avatar: string;
    color: string;
  } | null;
}
export function ServiceDetailModal({
  isOpen,
  onClose,
  service
}: ServiceDetailModalProps) {
  if (!service) return null;
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal */}
            <motion.div initial={{
          scale: 0.95,
          opacity: 0,
          y: 20
        }} animate={{
          scale: 1,
          opacity: 1,
          y: 0
        }} exit={{
          scale: 0.95,
          opacity: 0,
          y: 20
        }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">
                  Add Service: {service.name}
                </h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Service Info */}
                <div className="flex gap-6">
                  <div className={`w-24 h-24 rounded-2xl ${service.color} flex flex-col items-center justify-center shrink-0`}>
                    <span className="text-3xl mb-1">{service.avatar}</span>
                    <span className="text-xs font-bold uppercase tracking-wide opacity-75">
                      {service.name}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {service.role}
                      </h3>
                      <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded text-xs font-medium text-amber-700 border border-amber-100">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />
                        {service.rating}/5
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-4">
                      ${service.price}
                      <span className="text-sm font-normal text-slate-500">
                        /month
                      </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                          What {service.name} Does:
                        </h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              {feature}
                            </li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                          Integrates With:
                        </h4>
                        <ul className="space-y-2">
                          {service.integrations.map((integration, i) => <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {integration}
                            </li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Quick Setup */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">
                    Quick Setup (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">
                        Output Volume
                      </label>
                      <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-blue-300 transition-colors">
                        4 posts per month
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">
                        Primary Topic
                      </label>
                      <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-blue-300 transition-colors">
                        Industry News
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">
                      Tone:
                    </span>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="radio" name="tone" className="text-blue-600 focus:ring-blue-500" />{' '}
                      Professional
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="radio" name="tone" defaultChecked className="text-blue-600 focus:ring-blue-500" />{' '}
                      Friendly
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="radio" name="tone" className="text-blue-600 focus:ring-blue-500" />{' '}
                      Casual
                    </label>
                  </div>

                  <label className="flex items-start gap-2 mt-4 cursor-pointer group">
                    <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      Let {service.name} review my website and suggest strategy
                      automatically
                    </span>
                  </label>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {service.name} ({service.role})
                      </span>
                      <span className="font-medium text-slate-900">
                        ${service.price.toFixed(2)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        Current Plan (Tier 2)
                      </span>
                      <span className="font-medium text-slate-900">
                        $199.00/mo
                      </span>
                    </div>
                    <div className="h-px bg-slate-200 my-2" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-slate-900">New Monthly Total</span>
                      <span className="text-blue-600">
                        ${(199 + service.price).toFixed(2)}/mo
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 mb-6 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs text-slate-500">
                      I agree to the service terms and conditions
                    </span>
                  </label>

                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98]">
                    Add {service.name} - ${service.price}/mo
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Questions?
                  <button className="text-blue-600 hover:underline font-medium">
                    Chat with AI
                  </button>
                  or
                  <button className="text-blue-600 hover:underline font-medium">
                    Talk to Account Team
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>}
    </AnimatePresence>;
}