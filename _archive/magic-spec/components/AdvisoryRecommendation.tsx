import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Target, CheckCircle, ArrowRight, ChevronDown, ChevronUp, Users, TrendingUp, Shield } from 'lucide-react';
interface AdvisoryRecommendationProps {
  recommendation: {
    customerChallenge: string;
    proposedSolution: string;
    specialist: {
      name: string;
      expertise: string;
      avatar: string;
      avatarColor: string;
    };
    howItHelps: string[];
    expectedOutcomes: {
      label: string;
      description: string;
    }[];
    investment: {
      monthly: number;
      context: string;
    };
    nextSteps: string;
  };
  onBringInAdvisor: () => void;
  onExploreMore: () => void;
  onNotRightNow: () => void;
}
export function AdvisoryRecommendation({
  recommendation,
  onBringInAdvisor,
  onExploreMore,
  onNotRightNow
}: AdvisoryRecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-2xl">
      {/* Header - Advisory Focus */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Lightbulb className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">
                Advisory Recommendation
              </h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Based on your needs
              </span>
            </div>
            <p className="text-slate-600 text-sm">
              I've been listening to your challenges and have a recommendation
              that might help.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Customer Challenge */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-slate-600" size={18} />
            <h4 className="font-semibold text-slate-900">What I'm hearing:</h4>
          </div>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            "{recommendation.customerChallenge}"
          </p>
        </div>

        {/* Proposed Solution */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-blue-600" size={18} />
            <h4 className="font-semibold text-slate-900">What could help:</h4>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            {recommendation.proposedSolution}
          </p>

          {/* How It Helps */}
          <div className="space-y-2">
            {recommendation.howItHelps.slice(0, isExpanded ? undefined : 3).map((benefit, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.05
          }} className="flex items-start gap-3 text-sm">
                  <CheckCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{benefit}</span>
                </motion.div>)}
          </div>

          {recommendation.howItHelps.length > 3 && <button onClick={() => setIsExpanded(!isExpanded)} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              {isExpanded ? <>
                  Show less <ChevronUp size={16} />
                </> : <>
                  See all benefits ({recommendation.howItHelps.length - 3} more){' '}
                  <ChevronDown size={16} />
                </>}
            </button>}
        </div>

        {/* Expected Outcomes */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-900 mb-3">
            What you can expect:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendation.expectedOutcomes.map((outcome, index) => <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="font-medium text-slate-900 mb-1 text-sm">
                  {outcome.label}
                </div>
                <div className="text-xs text-slate-600">
                  {outcome.description}
                </div>
              </div>)}
          </div>
        </div>

        {/* Meet the Advisor */}
        <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${recommendation.specialist.avatarColor} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
              {recommendation.specialist.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">
                Meet {recommendation.specialist.name}
              </h4>
              <p className="text-sm text-slate-700 mb-2">
                {recommendation.specialist.expertise}
              </p>
              <p className="text-sm text-blue-900">
                {recommendation.specialist.name} can walk you through exactly
                how this works and help you determine if it's the right fit for
                your specific situation.
              </p>
            </div>
          </div>
        </div>

        {/* Investment Context */}
        <div className="mb-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">Investment</h4>
              <p className="text-sm text-slate-600 mb-2">
                {recommendation.investment.context}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${recommendation.investment.monthly}
              </div>
              <div className="text-xs text-slate-600">per month</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-900 mb-2">
            Suggested next step:
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {recommendation.nextSteps}
          </p>
        </div>

        {/* Actions - Advisory Language */}
        <div className="space-y-3">
          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} onClick={onBringInAdvisor} className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
            <Users size={20} />
            Yes, I'd like to speak with {recommendation.specialist.name}
            <ArrowRight size={20} />
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={onExploreMore} className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
              Tell me more
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={onNotRightNow} className="px-4 py-3 bg-white text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors border border-slate-300">
              Not right now
            </motion.button>
          </div>
        </div>

        {/* Trust Signal */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield size={12} />
          <span>
            No obligation - just a conversation to see if this fits your needs
          </span>
        </div>
      </div>
    </motion.div>;
}
// In-chat version with consultative approach
export function AdvisoryChatMessage({
  challenge,
  solution,
  specialist,
  onConnect,
  onLearnMore
}: {
  challenge: string;
  solution: string;
  specialist: {
    name: string;
    avatar: string;
    avatarColor: string;
    expertise: string;
  };
  onConnect: () => void;
  onLearnMore: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          {/* Advisory Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">
              Recommendation
            </span>
          </div>

          {/* Challenge Recognition */}
          <div className="mb-3">
            <p className="text-sm text-slate-600 mb-2">
              I've been thinking about your challenge:
            </p>
            <p className="text-sm text-slate-900 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              "{challenge}"
            </p>
          </div>

          {/* Solution Suggestion */}
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            {solution}
          </p>

          {/* Advisor Introduction */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${specialist.avatarColor} flex items-center justify-center text-xl shadow-md`}>
                {specialist.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm">
                  {specialist.name}
                </h4>
                <p className="text-xs text-slate-600">{specialist.expertise}</p>
              </div>
            </div>
            <p className="text-xs text-blue-900">
              {specialist.name} specializes in this area and can help you
              explore if this is the right approach for your situation.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={onConnect} className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Users size={16} />
              Connect me with {specialist.name}
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={onLearnMore} className="w-full bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition-colors">
              Tell me more first
            </motion.button>
          </div>

          {/* Trust Signal */}
          <p className="text-xs text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
            <Shield size={10} />
            No pressure - just exploring options
          </p>
        </div>
        <div className="text-xs text-slate-500 mt-1 ml-3">Just now</div>
      </div>
    </motion.div>;
}