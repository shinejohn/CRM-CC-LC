import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, UserPlus, Send, RefreshCw, CheckCircle, ArrowRight, Sparkles, Users, FileText } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

interface SpecialistSuggestion {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  avatarColor: string;
  reason: string;
}
interface OrchestratorDecisionPromptProps {
  specialist: SpecialistSuggestion;
  customerNeed: string;
  onAddToCall: () => void;
  onAssignTask: () => void;
  onStartNewSession: () => void;
  onDismiss: () => void;
}
export function OrchestratorDecisionPrompt({
  specialist,
  customerNeed,
  onAddToCall,
  onAssignTask,
  onStartNewSession,
  onDismiss
}: OrchestratorDecisionPromptProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleOptionSelect = async (option: string, action: () => void) => {
    setSelectedOption(option);
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    action();
    setIsProcessing(false);
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20,
    scale: 0.95
  }} animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }} exit={{
    opacity: 0,
    y: -20,
    scale: 0.95
  }} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-lg">
      {/* Orchestrator Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
          <MessageSquare className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">Account Manager AI</h3>
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium">
              Orchestrator
            </span>
          </div>
          <p className="text-sm text-slate-600">Making a recommendation...</p>
        </div>
      </div>

      {/* AI Message */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-blue-100 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="text-blue-600 shrink-0 mt-1" size={18} />
          <div className="flex-1">
            <p className="text-slate-700 leading-relaxed mb-3">
              I've identified that the customer needs help with{' '}
              <span className="font-semibold text-slate-900">
                {customerNeed}
              </span>
              .
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              <span className="font-semibold text-slate-900">
                {specialist.name}
              </span>{' '}
              is our expert in{' '}
              <span className="font-semibold text-slate-900">
                {specialist.specialty}
              </span>
              . {specialist.reason}
            </p>
            <p className="text-slate-700 leading-relaxed font-medium">
              How would you like me to proceed?
            </p>
          </div>
        </div>

        {/* Specialist Card */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${specialist.avatarColor} flex items-center justify-center text-2xl shadow-md`}>
              {specialist.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">
                {specialist.name}
              </h4>
              <p className="text-sm text-slate-600">{specialist.specialty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {!selectedOption ? <>
              {/* Option 1: Add to Current Call */}
              <motion.button key="add-to-call" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 20
          }} transition={{
            delay: 0.1
          }} whileHover={{
            scale: 1.02,
            x: 4
          }} whileTap={{
            scale: 0.98
          }} onClick={() => handleOptionSelect('add-to-call', onAddToCall)} className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <UserPlus className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      Add {specialist.name} to This Call
                      <ArrowRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-slate-600">
                      Bring {specialist.name} into the current conversation for
                      real-time collaboration with the customer
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* Option 2: Assign as Task */}
              <motion.button key="assign-task" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 20
          }} transition={{
            delay: 0.2
          }} whileHover={{
            scale: 1.02,
            x: 4
          }} whileTap={{
            scale: 0.98
          }} onClick={() => handleOptionSelect('assign-task', onAssignTask)} className="w-full bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-left transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FileText className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      Assign Task to {specialist.name}
                      <ArrowRight size={16} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-slate-600">
                      Pass this as a task for {specialist.name} to handle
                      offline and follow up with the customer directly
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* Option 3: Start New Session */}
              <motion.button key="new-session" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 20
          }} transition={{
            delay: 0.3
          }} whileHover={{
            scale: 1.02,
            x: 4
          }} whileTap={{
            scale: 0.98
          }} onClick={() => handleOptionSelect('new-session', onStartNewSession)} className="w-full bg-white hover:bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 text-left transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <RefreshCw className="text-emerald-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      End & Start New Session with {specialist.name}
                      <ArrowRight size={16} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-slate-600">
                      Conclude this call and schedule a dedicated session with{' '}
                      {specialist.name} for focused discussion
                    </p>
                  </div>
                </div>
              </motion.button>
            </> : <motion.div key="processing" initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="bg-white rounded-lg p-6 border-2 border-emerald-200">
              <div className="flex items-center gap-4">
                {isProcessing ? <>
                    <motion.div animate={{
                rotate: 360
              }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }} className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        Processing your choice...
                      </h4>
                      <p className="text-sm text-slate-600">
                        {selectedOption === 'add-to-call' && `Inviting ${specialist.name} to join the call`}
                        {selectedOption === 'assign-task' && `Creating task for ${specialist.name}`}
                        {selectedOption === 'new-session' && `Scheduling new session with ${specialist.name}`}
                      </p>
                    </div>
                  </> : <>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-emerald-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        Done!
                      </h4>
                      <p className="text-sm text-slate-600">
                        Action completed successfully
                      </p>
                    </div>
                  </>}
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Dismiss */}
      {!selectedOption && <motion.button initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.4
    }} onClick={onDismiss} className="w-full mt-3 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          Not right now
        </motion.button>}
    </motion.div>;
}
// Example usage component showing the orchestrator in action
export function OrchestratorInAction() {
  const [showPrompt, setShowPrompt] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const specialist = {
    id: 'marcus-social',
    name: 'Marcus',
    specialty: 'Social Media Strategy',
    avatar: '📱',
    avatarColor: 'from-pink-500 to-rose-600',
    reason: "He's helped dozens of clients build engaging social media campaigns with proven results."
  };
  const handleAction = (action: string) => {
    setResult(action);
    simulateApiDelay(2000).then(() => {
      setShowPrompt(false);
    });
  };
  return <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            AI Orchestrator Decision Flow
          </h1>
          <p className="text-slate-600">
            The Account Manager AI identifies needs and offers intelligent
            options for specialist involvement
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showPrompt ? <OrchestratorDecisionPrompt key="prompt" specialist={specialist} customerNeed="social media strategy and content planning" onAddToCall={() => handleAction('Added Marcus to the current call')} onAssignTask={() => handleAction('Created task for Marcus to handle offline')} onStartNewSession={() => handleAction('Scheduled new session with Marcus')} onDismiss={() => setShowPrompt(false)} /> : <motion.div key="result" initial={{
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
                Action Completed
              </h3>
              {result && <p className="text-slate-600 mb-6">{result}</p>}
              <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => {
            setShowPrompt(true);
            setResult(null);
          }} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Show Another Example
              </motion.button>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}