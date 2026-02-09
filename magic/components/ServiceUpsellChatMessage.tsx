import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Sparkles, CheckCircle, ArrowRight, ChevronDown, ChevronUp, Zap, Award } from 'lucide-react';
interface ServiceUpsellChatMessageProps {
  service: {
    name: string;
    tagline: string;
    monthlyPrice: number;
    specialist: {
      name: string;
      avatar: string;
      avatarColor: string;
    };
    keyBenefits: string[];
    fitScore: number;
    upsellValue: number;
    quickWin: string;
  };
  onAddSpecialist: () => void;
  onLearnMore: () => void;
  onDismiss: () => void;
}
export function ServiceUpsellChatMessage({
  service,
  onAddSpecialist,
  onLearnMore,
  onDismiss
}: ServiceUpsellChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex justify-start mb-4">
      <div className="max-w-[90%]">
        {/* Upsell Opportunity Badge */}
        <motion.div initial={{
        scale: 0,
        x: -20
      }} animate={{
        scale: 1,
        x: 0
      }} transition={{
        type: 'spring',
        delay: 0.1
      }} className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full text-xs font-semibold mb-2 shadow-lg">
          <TrendingUp size={12} />
          Revenue Opportunity
          <span className="px-2 py-0.5 bg-white/20 rounded-full">
            +${service.upsellValue.toLocaleString()}/mo
          </span>
        </motion.div>

        {/* Main Message Card */}
        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl rounded-tl-sm shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} />
              <span className="text-xs font-semibold">Account Manager AI</span>
              <span className="ml-auto px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {service.fitScore}% match
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Perfect timing! I think{' '}
              <span className="font-bold">{service.name}</span> would be a great
              addition to help you achieve your goals.
            </p>
          </div>

          {/* Service Overview */}
          <div className="p-4">
            {/* Quick Value Prop */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${service.specialist.avatarColor} flex items-center justify-center text-xl shadow-md shrink-0`}>
                {service.specialist.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">
                  {service.name}
                </h4>
                <p className="text-sm text-slate-600 mb-2">{service.tagline}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    ${service.monthlyPrice}
                  </span>
                  <span className="text-sm text-slate-600">/month</span>
                </div>
              </div>
            </div>

            {/* Quick Win Highlight */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <Zap size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-emerald-900 mb-1">
                    Quick Win
                  </div>
                  <p className="text-sm text-emerald-800">{service.quickWin}</p>
                </div>
              </div>
            </div>

            {/* Expandable Benefits */}
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
            }} className="overflow-hidden mb-3">
                  <div className="space-y-2 mb-3">
                    {service.keyBenefits.map((benefit, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  x: -10
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  delay: index * 0.05
                }} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">
                          {benefit}
                        </span>
                      </motion.div>)}
                  </div>

                  {/* Specialist Introduction */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">
                        {service.specialist.name}
                      </span>{' '}
                      specializes in this and can show you exactly how it works
                      for businesses like yours.
                    </p>
                  </div>
                </motion.div>}
            </AnimatePresence>

            {/* Expand/Collapse Button */}
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              {isExpanded ? <>
                  Show less <ChevronUp size={16} />
                </> : <>
                  See all benefits <ChevronDown size={16} />
                </>}
            </button>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={onAddSpecialist} className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg py-3 font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all shadow-md flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Yes! Add {service.specialist.name} to discuss this
                <ArrowRight size={16} />
              </motion.button>

              <div className="grid grid-cols-2 gap-2">
                <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={onLearnMore} className="px-3 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-300">
                  Learn More
                </motion.button>
                <motion.button whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={onDismiss} className="px-3 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-300">
                  Maybe Later
                </motion.button>
              </div>
            </div>

            {/* Value Indicator */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600">
              <Award size={12} className="text-emerald-600" />
              <span>This adds significant value to your account</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 mt-1 ml-3">Just now</div>
      </div>
    </motion.div>;
}
// Compact version for quick suggestions
export function ServiceUpsellQuickSuggestion({
  serviceName,
  specialistName,
  specialistAvatar,
  avatarColor,
  monthlyValue,
  onAccept,
  onDecline
}: {
  serviceName: string;
  specialistName: string;
  specialistAvatar: string;
  avatarColor: string;
  monthlyValue: number;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300 rounded-2xl rounded-tl-sm p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-900">
              Quick Upsell Opportunity
            </span>
            <span className="ml-auto px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-bold">
              +${monthlyValue}/mo
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-xl shadow-md`}>
              {specialistAvatar}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-900">
                Want to add <span className="font-bold">{serviceName}</span>?{' '}
                {specialistName} can join right now to discuss.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={onAccept} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all shadow-sm">
              Yes, add them
            </motion.button>
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={onDecline} className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-300">
              Not now
            </motion.button>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-1 ml-3">Just now</div>
      </div>
    </motion.div>;
}