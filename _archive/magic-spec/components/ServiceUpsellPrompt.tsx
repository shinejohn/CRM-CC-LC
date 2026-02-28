import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Sparkles, CheckCircle, ArrowRight, Package, Users, Zap, Target, Award } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

interface ServiceOffering {
  id: string;
  name: string;
  tagline: string;
  specialist: {
    name: string;
    avatar: string;
    avatarColor: string;
  };
  pricing: {
    monthly: number;
    setup?: number;
    savings?: string;
  };
  benefits: string[];
  customerFit: {
    score: number;
    reason: string;
  };
  upsellValue: number;
  successMetrics: {
    label: string;
    value: string;
  }[];
}
interface ServiceUpsellPromptProps {
  service: ServiceOffering;
  currentContext: string;
  onAccept: () => void;
  onLearnMore: () => void;
  onDecline: () => void;
}
export function ServiceUpsellPrompt({
  service,
  currentContext,
  onAccept,
  onLearnMore,
  onDecline
}: ServiceUpsellPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return <motion.div initial={{
    opacity: 0,
    y: 20,
    scale: 0.95
  }} animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }} className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-2xl border-2 border-emerald-300 p-6 shadow-xl">
      {/* Opportunity Badge */}
      <div className="flex items-center justify-between mb-4">
        <motion.div initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} transition={{
        type: 'spring',
        delay: 0.2
      }} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-full text-sm font-semibold shadow-lg">
          <TrendingUp size={16} />
          Upsell Opportunity
        </motion.div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm font-semibold border-2 border-emerald-200">
          <DollarSign size={16} className="text-emerald-600" />
          <span className="text-slate-900">
            +${service.upsellValue.toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* Orchestrator Message */}
      <div className="bg-white rounded-xl p-5 mb-4 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">
                Account Manager AI
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Orchestrator
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed mb-3">
              Based on {currentContext}, I think{' '}
              <span className="font-semibold text-slate-900">
                {service.name}
              </span>{' '}
              would be a perfect fit for your needs.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Target size={16} className="text-blue-600" />
              <span className="text-sm text-blue-900">
                <span className="font-semibold">
                  {service.customerFit.score}% match
                </span>{' '}
                - {service.customerFit.reason}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Card */}
      <div className="bg-white rounded-xl p-5 mb-4 border-2 border-slate-200 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-blue-600" size={20} />
              <h3 className="text-xl font-bold text-slate-900">
                {service.name}
              </h3>
            </div>
            <p className="text-slate-600 mb-3">{service.tagline}</p>
          </div>
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${service.specialist.avatarColor} flex items-center justify-center text-2xl shadow-lg`}>
            {service.specialist.avatar}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 mb-4 border border-emerald-200">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-slate-900">
              ${service.pricing.monthly}
            </span>
            <span className="text-slate-600">/month</span>
            {service.pricing.savings && <span className="ml-auto px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold">
                {service.pricing.savings}
              </span>}
          </div>
          {service.pricing.setup && <p className="text-sm text-slate-600">
              One-time setup: ${service.pricing.setup}
            </p>}
        </div>

        {/* Key Benefits */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            What you get:
          </h4>
          <div className="space-y-2">
            {service.benefits.slice(0, isExpanded ? undefined : 3).map((benefit, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.05
          }} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{benefit}</span>
                </motion.div>)}
          </div>
          {service.benefits.length > 3 && !isExpanded && <button onClick={() => setIsExpanded(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
              Show {service.benefits.length - 3} more benefits →
            </button>}
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {service.successMetrics.map((metric, index) => <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">{metric.label}</div>
              <div className="text-lg font-bold text-slate-900">
                {metric.value}
              </div>
            </div>)}
        </div>

        {/* Specialist Introduction */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${service.specialist.avatarColor} flex items-center justify-center text-xl shadow-md`}>
              {service.specialist.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">{service.specialist.name}</span>{' '}
                will join to discuss how this can help you achieve your goals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={onAccept} className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl py-4 font-semibold text-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
          <Users size={20} />
          Yes! Add {service.specialist.name} to discuss {service.name}
          <ArrowRight size={20} />
        </motion.button>

        <div className="grid grid-cols-2 gap-2">
          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} onClick={onLearnMore} className="px-4 py-3 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors border-2 border-slate-300">
            Learn More
          </motion.button>
          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} onClick={onDecline} className="px-4 py-3 bg-white text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors border border-slate-300">
            Not Right Now
          </motion.button>
        </div>
      </div>

      {/* Revenue Impact Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.5
    }} className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
        <Award size={14} className="text-emerald-600" />
        <span>
          Adding this service increases account value by{' '}
          {Math.round(service.upsellValue / 1000 * 100)}%
        </span>
      </motion.div>
    </motion.div>;
}
// Example usage with real service offerings
export function ServiceUpsellExample() {
  const [showPrompt, setShowPrompt] = useState(true);
  const socialMediaService: ServiceOffering = {
    id: 'social-media-management',
    name: 'Social Media Management',
    tagline: 'Professional social media strategy and content creation',
    specialist: {
      name: 'Marcus',
      avatar: '📱',
      avatarColor: 'from-pink-500 to-rose-600'
    },
    pricing: {
      monthly: 2499,
      setup: 999,
      savings: 'Save 20% annually'
    },
    benefits: ['Daily content creation and posting across all platforms', 'Community management and engagement', 'Monthly analytics reports with insights', 'Paid advertising campaign management', 'Influencer outreach and partnerships', 'Brand reputation monitoring'],
    customerFit: {
      score: 94,
      reason: 'Your industry and target audience are highly active on social media'
    },
    upsellValue: 2499,
    successMetrics: [{
      label: 'Avg. Engagement Increase',
      value: '+340%'
    }, {
      label: 'New Leads/Month',
      value: '150+'
    }]
  };
  return <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Service Upsell Flow
          </h1>
          <p className="text-slate-600">
            Account Manager AI identifies opportunities and presents service
            offerings with clear value propositions
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showPrompt ? <ServiceUpsellPrompt key="prompt" service={socialMediaService} currentContext="your discussion about increasing brand awareness and customer engagement" onAccept={() => {
          console.log('Adding specialist to call');
          simulateApiDelay(2000).then(() => setShowPrompt(false));
        }} onLearnMore={() => console.log('Opening service details')} onDecline={() => setShowPrompt(false)} /> : <motion.div key="result" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Marcus is joining the call!
              </h3>
              <p className="text-slate-600 mb-6">
                He'll be here in a moment to discuss how Social Media Management
                can help grow your business.
              </p>
              <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setShowPrompt(true)} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Show Another Example
              </motion.button>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}