import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, Check, X, Sparkles, Edit2, GripVertical, Lightbulb, Search, BarChart3, Download, MessageCircle } from 'lucide-react';
interface MarketingDiagnosticWizardProps {
  onComplete?: (data: DiagnosticData) => void;
  onCancel?: () => void;
}
interface DiagnosticData {
  businessConfirmed: boolean;
  businessSubtype: string;
  differentiator: string;
  differentiatorCustom?: string;
  customerSources: string[];
  marketingActivities: string[];
  biggestChallenge: string;
  challengeFreeform?: string;
  googleReviews: string;
  phoneHandling: string;
  marketingSpend: string;
}
interface BusinessInfo {
  name: string;
  category: string;
  location: string;
  icon: string;
}
export function MarketingDiagnosticWizard({
  onComplete,
  onCancel
}: MarketingDiagnosticWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{
    role: 'ai' | 'user';
    text: string;
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [businessConfirmed, setBusinessConfirmed] = useState(false);
  const [businessSubtype, setBusinessSubtype] = useState('');
  const [differentiator, setDifferentiator] = useState('');
  const [differentiatorCustom, setDifferentiatorCustom] = useState('');
  const [customerSources, setCustomerSources] = useState<string[]>(['referrals', 'google', 'repeat', 'lead-services', 'truck-sign', 'social', 'key-source', 'dont-know']);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [marketingActivities, setMarketingActivities] = useState<string[]>([]);
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [challengeFreeform, setChallengeFreeform] = useState('');
  const [showLostPath, setShowLostPath] = useState(false);
  const [googleReviews, setGoogleReviews] = useState('');
  const [phoneHandling, setPhoneHandling] = useState('');
  const [marketingSpend, setMarketingSpend] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);
  const totalSteps = 7;
  const businessInfo: BusinessInfo = {
    name: 'ABC Home Services',
    category: 'Plumbing',
    location: 'Tampa, FL',
    icon: '🔧'
  };
  const subtypeOptions = [{
    id: 'emergency',
    label: 'Emergency & Repairs',
    description: 'Burst pipes, clogs, leaks, no hot water'
  }, {
    id: 'scheduled',
    label: 'Scheduled Service & Maintenance',
    description: 'Water heater flushes, inspections, tune-ups'
  }, {
    id: 'projects',
    label: 'Projects & Installations',
    description: 'Bathroom remodels, new fixtures, re-pipes'
  }, {
    id: 'mix',
    label: 'Mix of everything',
    description: 'I do whatever comes in'
  }];
  const differentiatorOptions = [{
    id: 'reliable',
    label: 'He shows up when he says he will'
  }, {
    id: 'honest',
    label: "He's honest — no surprise bills"
  }, {
    id: 'available',
    label: "He'll come out anytime — even 2am"
  }, {
    id: 'explains',
    label: 'He explains everything so I understand'
  }, {
    id: 'established',
    label: "He's been around forever — everyone uses him"
  }, {
    id: 'cheapest',
    label: "He's the cheapest"
  }, {
    id: 'no-thing',
    label: 'I don\'t really have a "thing" yet'
  }, {
    id: 'custom',
    label: 'Something else...'
  }];
  const customerSourceOptions = [{
    id: 'referrals',
    label: 'Referrals',
    description: 'Past customers told them about you'
  }, {
    id: 'google',
    label: 'Google / Search',
    description: 'They searched "plumber near me" or similar'
  }, {
    id: 'repeat',
    label: 'Repeat customers',
    description: "They've used you before"
  }, {
    id: 'lead-services',
    label: 'Lead services',
    description: 'HomeAdvisor, Thumbtack, Angi, etc.'
  }, {
    id: 'truck-sign',
    label: 'Saw your truck / sign',
    description: 'Yard signs, vehicle wrap, local visibility'
  }, {
    id: 'social',
    label: 'Social media',
    description: 'Nextdoor, Facebook, Instagram'
  }, {
    id: 'key-source',
    label: 'One key source',
    description: 'Realtor, contractor, or other partner'
  }, {
    id: 'dont-know',
    label: "Don't know",
    description: 'Honestly not sure where they come from'
  }];
  const marketingActivityOptions = [{
    id: 'nothing',
    label: 'Nothing — they just find me',
    category: 'basics'
  }, {
    id: 'google-business',
    label: 'Google Business Profile (the map listing)',
    category: 'basics'
  }, {
    id: 'reviews',
    label: 'Asking customers for reviews',
    category: 'basics'
  }, {
    id: 'website',
    label: 'Website',
    category: 'basics'
  }, {
    id: 'google-ads',
    label: 'Google Ads',
    category: 'paid'
  }, {
    id: 'facebook-ads',
    label: 'Facebook/Instagram Ads',
    category: 'paid'
  }, {
    id: 'lead-services',
    label: 'Lead services (HomeAdvisor, Thumbtack, etc.)',
    category: 'paid'
  }, {
    id: 'social-posting',
    label: 'Facebook/Instagram posting',
    category: 'organic'
  }, {
    id: 'nextdoor',
    label: 'Nextdoor',
    category: 'organic'
  }, {
    id: 'email-text',
    label: 'Email or text past customers',
    category: 'organic'
  }, {
    id: 'ask-referrals',
    label: 'Asking for referrals',
    category: 'organic'
  }, {
    id: 'vehicle-wrap',
    label: 'Vehicle wrap',
    category: 'offline'
  }, {
    id: 'yard-signs',
    label: 'Yard signs',
    category: 'offline'
  }, {
    id: 'direct-mail',
    label: 'Direct mail / Door hangers',
    category: 'offline'
  }];
  const challengeOptions = [{
    id: 'not-ringing',
    label: "Phone's not ringing enough",
    description: 'I need more people calling me'
  }, {
    id: 'call-no-book',
    label: "People call but don't book",
    description: 'I give quotes but they go elsewhere'
  }, {
    id: 'losing-price',
    label: 'Losing to cheaper competitors',
    description: 'Customers choosing the low-price guys'
  }, {
    id: 'one-source',
    label: 'Too dependent on one source',
    description: "If my main lead source dries up, I'm in trouble"
  }, {
    id: 'busy-no-money',
    label: "I'm busy but not making money",
    description: 'Jobs are coming but margins are thin'
  }, {
    id: 'want-grow',
    label: "I'm doing OK — just want to grow",
    description: 'Things are fine, looking for the next level'
  }, {
    id: 'lost',
    label: "I'm lost — I don't know what's wrong",
    description: "Something's off but I can't pinpoint it"
  }];
  const lostPathOptions = [{
    id: 'not-ringing',
    label: "Phone's not ringing"
  }, {
    id: 'call-no-buy',
    label: "People call but don't buy"
  }, {
    id: 'busy-no-money',
    label: "I'm busy but not making money"
  }, {
    id: 'no-idea',
    label: 'I just have no idea'
  }];
  const processingSteps = ['Business profile reviewed', 'Customer sources analyzed', 'Marketing activities evaluated', 'Generating diagnosis...', 'Building action plan'];
  const processingQuotes = ["Most plumbing businesses I analyze have a visibility problem. Let's see if you're different...", 'Interesting pattern in your customer sources. This tells me a lot...', 'Your marketing activities are revealing. Give me a moment...'];
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProcessingStep(prev => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setIsProcessing(false);
              setShowResults(true);
            }, 500);
            return prev;
          }
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);
  const handleDragStart = (sourceId: string) => setDraggedItem(sourceId);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
    const newSources = [...customerSources];
    const draggedIndex = newSources.indexOf(draggedItem);
    const targetIndex = newSources.indexOf(targetId);
    newSources.splice(draggedIndex, 1);
    newSources.splice(targetIndex, 0, draggedItem);
    setCustomerSources(newSources);
  };
  const handleDragEnd = () => setDraggedItem(null);
  const handleActivityToggle = (activityId: string) => {
    setMarketingActivities(prev => prev.includes(activityId) ? prev.filter(id => id !== activityId) : [...prev, activityId]);
  };
  const handleChallengeSelect = (challengeId: string) => {
    setBiggestChallenge(challengeId);
    if (challengeId === 'lost') setShowLostPath(true);
  };
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setIsAIExpanded(false);
      setAiMessages([]);
    } else {
      setIsProcessing(true);
      setProcessingStep(0);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 6 && showLostPath) setShowLostPath(false);
    }
  };
  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return businessConfirmed;
    if (currentStep === 2) return businessSubtype !== '';
    if (currentStep === 3) return differentiator !== '' && (differentiator !== 'custom' || differentiatorCustom.trim() !== '');
    if (currentStep === 4) return true;
    if (currentStep === 5) return marketingActivities.length > 0;
    if (currentStep === 6) return biggestChallenge !== '' || showLostPath && (challengeFreeform.trim() !== '' || biggestChallenge !== '');
    if (currentStep === 7) return googleReviews !== '' && phoneHandling !== '' && marketingSpend !== '';
    return true;
  };
  const getTimeEstimate = () => {
    const remainingMinutes = Math.ceil((totalSteps - currentStep) * (5 / totalSteps));
    return `~${remainingMinutes} min left`;
  };
  const getStepTitle = () => {
    const titles = ['Welcome', 'Your Business', 'Your Business', 'What Makes You Different', 'Where Customers Come From', "What You're Doing", showLostPath ? "Let's Figure This Out" : "What's Not Working", 'Quick Numbers'];
    return titles[currentStep];
  };
  const getActivitiesByCategory = (category: string) => {
    return marketingActivityOptions.filter(a => a.category === category);
  };
  if (showFullResults) {
    return <FullResultsDashboard businessInfo={businessInfo} onBack={() => setShowFullResults(false)} />;
  }
  if (showResults) {
    return <ResultsSummary businessInfo={businessInfo} onViewFull={() => setShowFullResults(true)} />;
  }
  if (isProcessing) {
    return <ProcessingScreen currentStep={processingStep} steps={processingSteps} quote={processingQuotes[Math.min(processingStep, processingQuotes.length - 1)]} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 relative">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {currentStep > 0 && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Step {currentStep} of {totalSteps} • {getStepTitle()}
              </span>
              <span className="text-sm text-slate-500">
                {getTimeEstimate()}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500" initial={{
            width: 0
          }} animate={{
            width: `${currentStep / totalSteps * 100}%`
          }} transition={{
            duration: 0.5,
            ease: 'easeOut'
          }} />
            </div>
          </motion.div>}

        <AnimatePresence mode="wait">
          {currentStep === 0 && <motion.div key="step0" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="text-center mb-8">
                <motion.div initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 200
            }} className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Marketing Check-Up
                </h1>
                <p className="text-lg text-slate-600 mb-2">
                  Hey {businessInfo.name}! 👋
                </p>
                <p className="text-slate-600 max-w-lg mx-auto mb-6">
                  I'm going to ask you a few questions about how customers find
                  you and what's working (or not).
                </p>
                <p className="text-slate-600 max-w-lg mx-auto mb-8">
                  This takes about 5 minutes. There are no wrong answers — I
                  just need your honest perspective.
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-6 mb-8 border border-emerald-100">
                <h3 className="font-bold text-slate-900 mb-3">
                  At the end, I'll give you:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700">
                      A clear picture of your marketing health
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700">
                      The ONE thing that's holding you back
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700">
                      A simple action plan to fix it
                    </span>
                  </li>
                </ul>
              </div>
              <button onClick={handleNext} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2">
                Let's Start
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-slate-500 mt-4">
                Have a question before we start?
              </p>
            </motion.div>}

          {currentStep === 1 && <motion.div key="step1" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                First, let me make sure I have this right:
              </h2>
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-6 border-2 border-slate-200 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{businessInfo.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {businessInfo.name}
                    </h3>
                    <p className="text-slate-600">{businessInfo.category}</p>
                    <p className="text-slate-500 text-sm">
                      {businessInfo.location}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-lg text-slate-700 mb-6">Is this correct?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button onClick={() => {
              setBusinessConfirmed(true);
              handleNext();
            }} className="py-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white rounded-xl font-bold shadow-lg transition-all">
                  Yes, that's me
                </button>
                <button onClick={() => alert('Navigate to business profile edit')} className="py-4 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Update my info
                </button>
              </div>
              <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                ← Back
              </button>
            </motion.div>}

          {currentStep === 2 && <motion.div key="step2" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                What kind of {businessInfo.category.toLowerCase()} work do you
                mostly do?
              </h2>
              <p className="text-slate-600 mb-8">
                Pick the one that fits best:
              </p>
              <div className="space-y-3 mb-8">
                {subtypeOptions.map(option => <motion.button key={option.id} whileTap={{
              scale: 0.98
            }} onClick={() => setBusinessSubtype(option.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${businessSubtype === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${businessSubtype === option.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {businessSubtype === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>)}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}

          {currentStep === 3 && <motion.div key="step3" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                When your happiest customers tell their friends about you, what
                do they say?
              </h2>
              <p className="text-slate-600 mb-8">
                Pick the ONE thing you're most known for:
              </p>
              <div className="space-y-3 mb-8">
                {differentiatorOptions.map(option => <motion.button key={option.id} whileTap={{
              scale: 0.98
            }} onClick={() => setDifferentiator(option.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${differentiator === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${differentiator === option.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {differentiator === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {option.label}
                        </p>
                        {option.id === 'custom' && differentiator === 'custom' && <input type="text" value={differentiatorCustom} onChange={e => setDifferentiatorCustom(e.target.value)} placeholder="Describe what makes you different..." className="w-full mt-3 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" onClick={e => e.stopPropagation()} />}
                      </div>
                    </div>
                  </motion.button>)}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}

          {currentStep === 4 && <motion.div key="step4" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Think about your last 10 customers. Where did they come from?
              </h2>
              <p className="text-slate-600 mb-8">
                Drag to rank from MOST to LEAST:
              </p>
              <div className="space-y-2 mb-6">
                {customerSources.map((sourceId, index) => {
              const source = customerSourceOptions.find(s => s.id === sourceId);
              if (!source) return null;
              return <motion.div key={source.id} draggable onDragStart={() => handleDragStart(source.id)} onDragOver={e => handleDragOver(e, source.id)} onDragEnd={handleDragEnd} className={`p-4 rounded-xl border-2 transition-all cursor-move ${draggedItem === source.id ? 'border-emerald-500 bg-emerald-50 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">
                            {source.label}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {source.description}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {index + 1}
                        </div>
                      </div>
                    </motion.div>;
            })}
              </div>
              <div className="bg-sky-50 rounded-xl p-4 mb-8 border border-sky-100 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                <p className="text-sm text-sky-900">
                  <strong>Tip:</strong> Just rank the top 3-4, the rest don't
                  matter much
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg transition-all flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}

          {currentStep === 5 && <motion.div key="step5" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                What are you actively doing to get customers?
              </h2>
              <p className="text-slate-600 mb-8">Check all that apply:</p>
              <div className="space-y-6 mb-8">
                {['basics', 'paid', 'organic', 'offline'].map(category => <div key={category}>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {getActivitiesByCategory(category).map(activity => <button key={activity.id} onClick={() => handleActivityToggle(activity.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${marketingActivities.includes(activity.id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${marketingActivities.includes(activity.id) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                            {marketingActivities.includes(activity.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium text-slate-900">
                            {activity.label}
                          </span>
                        </button>)}
                    </div>
                  </div>)}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}

          {currentStep === 6 && !showLostPath && <motion.div key="step6" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Let's talk about what's frustrating you.
              </h2>
              <p className="text-slate-600 mb-8">
                What's your biggest challenge right now?
              </p>
              <div className="space-y-3 mb-8">
                {challengeOptions.map(option => <motion.button key={option.id} whileTap={{
              scale: 0.98
            }} onClick={() => handleChallengeSelect(option.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${biggestChallenge === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${biggestChallenge === option.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {biggestChallenge === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>)}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}

          {currentStep === 6 && showLostPath && <motion.div key="step6b" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                That's OK. Let's slow down.
              </h2>
              <p className="text-slate-600 mb-6">
                Forget the categories. Just tell me:
              </p>
              <p className="text-lg font-medium text-slate-900 mb-4">
                What happened this week that frustrated you?
              </p>
              <textarea value={challengeFreeform} onChange={e => setChallengeFreeform(e.target.value)} placeholder="Type whatever's on your mind..." rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none resize-none mb-8" />
              <p className="text-slate-600 mb-4">Or pick what's closest:</p>
              <div className="space-y-3 mb-8">
                {lostPathOptions.map(option => <motion.button key={option.id} whileTap={{
              scale: 0.98
            }} onClick={() => setBiggestChallenge(option.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${biggestChallenge === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${biggestChallenge === option.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {biggestChallenge === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="font-medium text-slate-900">
                        {option.label}
                      </span>
                    </div>
                  </motion.button>)}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}

          {currentStep === 7 && <motion.div key="step7" initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -50
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Last few questions — quick numbers:
              </h2>
              <div className="mb-8">
                <p className="text-lg font-medium text-slate-900 mb-4">
                  How many Google reviews do you have?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['0-10', '11-30', '31-50', '50+', 'Not sure'].map(option => <button key={option} onClick={() => setGoogleReviews(option)} className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${googleReviews === option ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                        {option}
                      </button>)}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-lg font-medium text-slate-900 mb-4">
                  When someone calls, what typically happens?
                </p>
                <div className="space-y-3">
                  {[{
                id: 'answer-live',
                label: 'I answer live most of the time'
              }, {
                id: 'vm-quick',
                label: 'Voicemail — I call back within a few hours'
              }, {
                id: 'vm-when-can',
                label: 'Voicemail — I call back when I can'
              }, {
                id: 'someone-else',
                label: 'Someone else answers (office/service)'
              }].map(option => <button key={option.id} onClick={() => setPhoneHandling(option.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${phoneHandling === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${phoneHandling === option.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                          {phoneHandling === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="font-medium text-slate-900">
                          {option.label}
                        </span>
                      </div>
                    </button>)}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-lg font-medium text-slate-900 mb-4">
                  Roughly, how much do you spend on marketing per month?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['$0', '<$500', '$500-1500', '$1500+', 'Unsure'].map(option => <button key={option} onClick={() => setMarketingSpend(option)} className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${marketingSpend === option ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                        {option}
                      </button>)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={handleBack} className="text-slate-600 hover:text-slate-900 font-medium">
                  ← Back
                </button>
                <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  See Results
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* AI Assistant Button - Simplified for now */}
      <motion.button initial={{
      scale: 0
    }} animate={{
      scale: 1
    }} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full shadow-2xl flex items-center justify-center text-white z-50">
        <Sparkles className="w-6 h-6" />
      </motion.button>
    </div>;
}
function ProcessingScreen({
  currentStep,
  steps,
  quote
}: {
  currentStep: number;
  steps: string[];
  quote: string;
}) {
  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center p-4">
      <motion.div initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
        <motion.div animate={{
        rotate: 360
      }} transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }} className="w-20 h-20 mx-auto mb-8">
          <Search className="w-20 h-20 text-emerald-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
          Analyzing your answers...
        </h2>
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => <motion.div key={index} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.2
        }} className="flex items-center gap-3">
              {index < currentStep ? <Check className="w-5 h-5 text-green-500 shrink-0" /> : index === currentStep ? <motion.div animate={{
            rotate: 360
          }} transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }} className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full shrink-0" /> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full shrink-0" />}
              <span className={`text-lg ${index <= currentStep ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {step}
              </span>
            </motion.div>)}
        </div>
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 1
      }} className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
          <p className="text-slate-700 italic">💬 "{quote}"</p>
        </motion.div>
      </motion.div>
    </div>;
}
function ResultsSummary({
  businessInfo,
  onViewFull
}: {
  businessInfo: BusinessInfo;
  onViewFull: () => void;
}) {
  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4">
      <div className="max-w-3xl mx-auto py-12">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-emerald-600" />
            Your Marketing Assessment
          </h1>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-slate-200">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{businessInfo.icon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {businessInfo.name}
              </h2>
              <p className="text-slate-600">
                {businessInfo.category} • Emergency & Repair Focus
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Your thing: "Shows up when he says he will"
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              YOUR DIAGNOSIS
            </h3>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200 mb-4">
            <p className="text-lg font-bold text-orange-900 mb-2">
              Primary Challenge: VISIBILITY
            </p>
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed mb-4">
              "You're the plumber people love once they find you. The problem?
              Not enough people are finding you.
            </p>
            <p className="text-slate-700 leading-relaxed">
              You're running on referrals and repeat business — which is great —
              but you're invisible to everyone else. When someone's toilet
              overflows and they don't have 'a guy,' they're Googling. And right
              now, they're not finding you."
            </p>
          </div>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <button onClick={onViewFull} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2">
            See Full Results
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-sm text-slate-500 mt-4">
            Have questions about your diagnosis?
          </p>
        </motion.div>
      </div>
    </div>;
}
function FullResultsDashboard({
  businessInfo,
  onBack
}: {
  businessInfo: BusinessInfo;
  onBack: () => void;
}) {
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const toggleAction = (actionId: string) => {
    setCompletedActions(prev => prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]);
  };
  return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4">
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            Your Marketing Assessment
          </h1>
          <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 rounded-xl font-medium text-slate-700 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            MARKETING HEALTH
          </h2>
          <div className="space-y-4">
            {[{
            label: 'Reach',
            value: 20,
            status: '⚠️ This is the gap',
            color: 'red'
          }, {
            label: 'Reputation',
            value: 60,
            status: '→ Build more proof',
            color: 'yellow'
          }, {
            label: 'Conversion',
            value: 80,
            status: '✓ Strong',
            color: 'green'
          }, {
            label: 'Retention',
            value: 70,
            status: '✓ Good',
            color: 'green'
          }, {
            label: 'Referrals',
            value: 50,
            status: '→ Opportunity',
            color: 'yellow'
          }].map(metric => <div key={metric.label} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-slate-700">
                  {metric.label}
                </div>
                <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${metric.value}%`
              }} transition={{
                duration: 1,
                delay: 0.2
              }} className={`h-full ${metric.color === 'red' ? 'bg-red-500' : metric.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
                <div className="w-12 text-sm font-bold text-slate-700">
                  {metric.value}%
                </div>
                <div className="w-48 text-sm text-slate-600">
                  {metric.status}
                </div>
              </div>)}
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            WHERE YOUR CUSTOMERS COME FROM{' '}
            <span className="text-sm font-normal text-slate-500">
              (Your estimate)
            </span>
          </h2>
          <div className="space-y-3">
            {[{
            label: 'Referrals',
            value: 65
          }, {
            label: 'Google',
            value: 20
          }, {
            label: 'Repeat',
            value: 10
          }, {
            label: 'Other',
            value: 5
          }].map(source => <div key={source.label} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700">
                  {source.label}
                </div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${source.value}%`
              }} transition={{
                duration: 1,
                delay: 0.3
              }} className="h-full bg-gradient-to-r from-emerald-500 to-sky-500" />
                </div>
                <div className="w-12 text-sm font-bold text-slate-700">
                  {source.value}%
                </div>
              </div>)}
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">
              YOUR ACTION PLAN
            </h2>
          </div>
          <p className="text-slate-600 mb-6">
            Start here — ONE thing at a time:
          </p>
          <div className="space-y-4">
            {[{
            id: '1',
            title: 'Get to 30 Google reviews',
            desc: 'You have ~15 now. Ask every happy customer.'
          }, {
            id: '2',
            title: 'Start asking "How\'d you find us?"',
            desc: 'Every call. Write it down. Know your numbers.'
          }, {
            id: '3',
            title: 'Post a job photo to Google weekly',
            desc: "Shows you're active. Helps you show up."
          }].map(action => <div key={action.id} className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition-all">
                <button onClick={() => toggleAction(action.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${completedActions.includes(action.id) ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-emerald-500'}`}>
                  {completedActions.includes(action.id) && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">
                    {action.id}. {action.title}
                  </h3>
                  <p className="text-sm text-slate-600">{action.desc}</p>
                </div>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Mark Complete
                </button>
              </div>)}
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            WHAT'S NEXT?
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border-2 border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">
                Option 1: Do It Yourself
              </h3>
              <p className="text-slate-600 mb-4">
                Follow the action plan above. I'll check in monthly.
              </p>
              <button className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all">
                Save to My Business
              </button>
            </div>
            <div className="p-6 rounded-xl border-2 border-emerald-200 bg-emerald-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">
                  Option 2: Get Customer Insights
                </h3>
                <span className="text-lg font-bold text-emerald-600">$299</span>
              </div>
              <p className="text-slate-600 mb-4">
                Let's find out what your customers ACTUALLY think. We'll survey
                them and show you the gaps between what you think and what they
                say.
              </p>
              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all">
                Learn More
              </button>
            </div>
            <div className="p-6 rounded-xl border-2 border-violet-200 bg-violet-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">
                  Option 3: We'll Handle It
                </h3>
                <span className="text-lg font-bold text-violet-600">
                  Starting $199/mo
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                Our AI Marketing Coordinator will build and run campaigns based
                on your diagnosis. You approve, we execute.
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg font-medium transition-all">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
            <h3 className="text-2xl font-bold text-white">
              Questions? Talk to your AI Consultant
            </h3>
          </div>
          <button className="px-8 py-3 bg-white hover:bg-slate-100 text-violet-600 rounded-xl font-bold transition-all">
            Start Chat →
          </button>
        </motion.div>
      </div>
    </div>;
}