import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FileText, RefreshCw, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
interface OrchestratorOption {
  id: string;
  icon: ElementType;
  label: string;
  description: string;
  color: string;
  hoverColor: string;
  iconBg: string;
  iconHoverBg: string;
}
interface OrchestratorChatMessageProps {
  specialist: {
    name: string;
    specialty: string;
    avatar: string;
    avatarColor: string;
  };
  customerNeed: string;
  onOptionSelect: (optionId: string) => void;
}
export function OrchestratorChatMessage({
  specialist,
  customerNeed,
  onOptionSelect
}: OrchestratorChatMessageProps) {
  const options: OrchestratorOption[] = [{
    id: 'add-to-call',
    icon: UserPlus,
    label: `Add ${specialist.name} to this call`,
    description: 'Join the conversation now',
    color: 'border-blue-200',
    hoverColor: 'hover:bg-blue-50',
    iconBg: 'bg-blue-100',
    iconHoverBg: 'group-hover:bg-blue-200'
  }, {
    id: 'assign-task',
    icon: FileText,
    label: `Assign task to ${specialist.name}`,
    description: 'Handle offline and follow up',
    color: 'border-purple-200',
    hoverColor: 'hover:bg-purple-50',
    iconBg: 'bg-purple-100',
    iconHoverBg: 'group-hover:bg-purple-200'
  }, {
    id: 'new-session',
    icon: RefreshCw,
    label: `Start new session with ${specialist.name}`,
    description: 'Schedule dedicated meeting',
    color: 'border-emerald-200',
    hoverColor: 'hover:bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconHoverBg: 'group-hover:bg-emerald-200'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        {/* AI Message Bubble */}
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">
              Account Manager AI
            </span>
          </div>

          <p className="text-slate-700 leading-relaxed mb-3">
            I've identified that you need help with{' '}
            <span className="font-semibold text-slate-900">{customerNeed}</span>
            .
          </p>

          {/* Specialist Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 mb-3 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${specialist.avatarColor} flex items-center justify-center text-xl shadow-md`}>
                {specialist.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm">
                  {specialist.name}
                </h4>
                <p className="text-xs text-slate-600">{specialist.specialty}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {specialist.name} is our expert in this area and can help you
              achieve your goals.
            </p>
          </div>

          <p className="text-slate-700 font-medium mb-3">
            How would you like to proceed?
          </p>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            {options.map((option, index) => <motion.button key={option.id} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.1 * index
          }} whileHover={{
            scale: 1.02,
            x: 4
          }} whileTap={{
            scale: 0.98
          }} onClick={() => onOptionSelect(option.id)} className={`w-full bg-white ${option.hoverColor} border ${option.color} rounded-lg p-3 text-left transition-all group flex items-center gap-3`}>
                <div className={`p-2 ${option.iconBg} rounded-lg ${option.iconHoverBg} transition-colors shrink-0`}>
                  <option.icon size={16} className="text-slate-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm mb-0.5 flex items-center gap-2">
                    {option.label}
                    <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="text-xs text-slate-600">
                    {option.description}
                  </div>
                </div>
              </motion.button>)}
          </div>
        </div>

        <div className="text-xs text-slate-500 mt-1 ml-3">Just now</div>
      </div>
    </motion.div>;
}
// Confirmation message after selection
export function OrchestratorConfirmationMessage({
  action,
  specialistName
}: {
  action: string;
  specialistName: string;
}) {
  const messages = {
    'add-to-call': `Perfect! I'm inviting ${specialistName} to join us now. They'll be with us in just a moment.`,
    'assign-task': `Got it! I've created a task for ${specialistName}. They'll review the details and reach out to you directly within 24 hours.`,
    'new-session': `Excellent! I'm ending this call and scheduling a dedicated session with ${specialistName}. You'll receive a calendar invite shortly.`
  };
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-emerald-900">
                  Account Manager AI
                </span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                {messages[action as keyof typeof messages]}
              </p>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-1 ml-3">Just now</div>
      </div>
    </motion.div>;
}
// Example of orchestrator suggesting specialist during conversation
export function OrchestratorSuggestionInline({
  specialistName,
  reason,
  onAccept,
  onDecline
}: {
  specialistName: string;
  reason: string;
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
        <div className="bg-blue-50 border border-blue-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">
              Quick Suggestion
            </span>
          </div>

          <p className="text-blue-900 leading-relaxed mb-3">
            {reason} Would you like me to bring {specialistName} into this
            conversation?
          </p>

          <div className="flex gap-2">
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={onAccept} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Yes, add {specialistName}
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