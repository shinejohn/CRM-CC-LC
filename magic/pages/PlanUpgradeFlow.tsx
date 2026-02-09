import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
export function PlanUpgradeFlow({
  onBack,
  onComplete
}: {
  onBack: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(2); // Starting at review step as per mock
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Upgrade Your Plan
          </h1>
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
            <span>Step {step} of 3: Review Changes</span>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10" />
            <div className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -z-10 transition-all duration-500" style={{
            width: '50%'
          }} />

            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <span className="text-xs font-medium text-blue-600">Select</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="text-xs font-medium text-blue-600">Review</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="text-xs font-medium text-slate-500">
                Confirm
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                UPGRADING FROM
              </p>
              <p className="font-bold text-slate-900">Tier 2 Growth</p>
              <p className="text-sm text-slate-500">$199/month</p>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-300" />
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                UPGRADING TO
              </p>
              <p className="font-bold text-blue-600">Tier 3 Enterprise</p>
              <p className="text-sm text-slate-500">$399/month</p>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
              WHAT YOU'LL GET
            </h3>
            <div className="space-y-3 mb-8">
              {['Unlimited AI Employees (was 4)', '25,000 email sends/month (was 5,000)', 'Unlimited CRM contacts (was 2,500)', 'Priority support', 'Custom analytics', 'White label option'].map((feature, i) => <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {feature}
                </div>)}
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                PRICE CHANGE
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Current monthly:</span>
                  <span className="font-medium text-slate-900">$199.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">New monthly:</span>
                  <span className="font-medium text-slate-900">$399.00</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900">
                    Difference:
                  </span>
                  <span className="font-bold text-blue-600">+$200.00/mo</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">
                    Prorated amount due today:
                  </span>
                  <span className="font-bold text-slate-900">$103.33</span>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  (15 days remaining in billing cycle)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                  <div className="w-6 h-4 bg-blue-600/20 rounded-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Visa ending in 4242
                  </p>
                  <p className="text-xs text-slate-500">Expires 12/2026</p>
                </div>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                Change
              </button>
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-8">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">
                I understand my billing will change to $399/month
              </span>
            </label>

            <div className="flex gap-4">
              <button onClick={onBack} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                Back
              </button>
              <button onClick={onComplete} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Confirm Upgrade - $103.33
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>;
}