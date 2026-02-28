import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Sparkles, Eye, EyeOff, Filter, ChevronDown, MessageSquare, Send, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, RefreshCw, Globe } from 'lucide-react';
import { simulateApiDelay } from '../../magic/utils/mockApi';

interface FAQManagementPageProps {
  onBack: () => void;
}
interface FAQ {
  id: string;
  question: string;
  answer: string;
  proposedAnswer?: string;
  userRoughAnswer?: string;
  category: string;
  visible: boolean;
  aiEnabled: boolean;
  createdBy: 'user' | 'ai';
  status: 'confirmed' | 'proposed' | 'needs-review';
  lastUpdated: string;
  shareOnAlphaSite?: boolean;
}
export function FAQManagementPage({
  onBack
}: FAQManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [reviewingFAQ, setReviewingFAQ] = useState<FAQ | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  // Mock data commented out - wire to GET/POST /v1/faq-categories/* API
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const categories = ['all', 'Services', 'Pricing', 'Policies & Terms', 'General'];
  const statuses = ['all', 'confirmed', 'proposed', 'needs-review'];
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) || faq.proposedAnswer && faq.proposedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || faq.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const handleConfirmAnswer = (faqId: string) => {
    setFaqs(faqs.map(f => {
      if (f.id === faqId && f.proposedAnswer) {
        return {
          ...f,
          answer: f.proposedAnswer,
          proposedAnswer: undefined,
          status: 'confirmed',
          visible: true
        };
      }
      return f;
    }));
    setReviewingFAQ(null);
  };
  const handleRejectAnswer = (faqId: string) => {
    setReviewingFAQ(faqs.find(f => f.id === faqId) || null);
    setUserAnswer('');
  };
  const handleSubmitUserAnswer = (faqId: string) => {
    setIsRefining(true);
    // Simulate AI refining the answer
    simulateApiDelay(1500).then(() => {
      const refinedAnswer = `We accept multiple payment methods for your convenience, including cash, checks, all major credit cards, and digital payment platforms such as Venmo and Zelle. Payment is due upon completion of service.`;
      setFaqs(faqs.map(f => {
        if (f.id === faqId) {
          return {
            ...f,
            userRoughAnswer: userAnswer,
            proposedAnswer: refinedAnswer,
            status: 'proposed'
          };
        }
        return f;
      }));
      setIsRefining(false);
      setUserAnswer('');
    });
  };
  const handleRefineUserAnswer = (faqId: string) => {
    const faq = faqs.find(f => f.id === faqId);
    if (faq?.userRoughAnswer) {
      setIsRefining(true);
      simulateApiDelay(1500).then(() => {
        const refinedAnswer = `We accept multiple payment methods for your convenience, including cash, checks, all major credit cards, and digital payment platforms such as Venmo and Zelle. Payment is due upon completion of service.`;
        setFaqs(faqs.map(f => {
          if (f.id === faqId) {
            return {
              ...f,
              proposedAnswer: refinedAnswer,
              status: 'proposed'
            };
          }
          return f;
        }));
        setIsRefining(false);
      });
    }
  };
  const handleToggleAlphaSite = (faqId: string) => {
    setFaqs(faqs.map(f => {
      if (f.id === faqId) {
        return {
          ...f,
          shareOnAlphaSite: !f.shareOnAlphaSite
        };
      }
      return f;
    }));
  };
  const getStatusBadge = (status: FAQ['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmed
          </span>;
      case 'proposed':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Needs Review
          </span>;
      case 'needs-review':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Awaiting Answer
          </span>;
    }
  };
  const stats = {
    total: faqs.length,
    confirmed: faqs.filter(f => f.status === 'confirmed').length,
    proposed: faqs.filter(f => f.status === 'proposed').length,
    needsReview: faqs.filter(f => f.status === 'needs-review').length
  };
  return <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Profile</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              FAQ Management
            </h1>
            <p className="text-slate-600 mt-1">
              Review and confirm AI-generated answers or provide your own
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search FAQs..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              {categories.map(cat => <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>)}
            </select>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              {statuses.map(status => <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status === 'needs-review' ? 'Needs Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>)}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">
                {stats.total}
              </div>
              <div className="text-sm text-slate-600">Total FAQs</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.confirmed}
              </div>
              <div className="text-sm text-emerald-700">Confirmed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.proposed}
              </div>
              <div className="text-sm text-blue-700">Needs Review</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">
                {stats.needsReview}
              </div>
              <div className="text-sm text-amber-700">Awaiting Answer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {stats.proposed > 0 && <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  {stats.proposed} FAQs Need Your Review
                </h3>
                <p className="text-sm text-blue-800">
                  AI has generated answers for these questions. Please review
                  and confirm or provide your own answer.
                </p>
              </div>
            </div>
          </div>}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => <motion.div key={faq.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.05
        }} className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${faq.status === 'proposed' ? 'border-blue-200 bg-blue-50/30' : faq.status === 'needs-review' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:shadow-md'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-900 text-lg">
                      {faq.question}
                    </h3>
                    {getStatusBadge(faq.status)}
                  </div>

                  {/* Confirmed Answer */}
                  {faq.status === 'confirmed' && faq.answer && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700 uppercase">
                          Confirmed Answer
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>}

                  {/* Proposed Answer */}
                  {faq.status === 'proposed' && faq.proposedAnswer && <div className="space-y-3 mt-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700 uppercase">
                            AI-Generated Answer
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {faq.proposedAnswer}
                        </p>
                      </div>

                      {faq.userRoughAnswer && <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-medium text-slate-600 uppercase">
                              Your Original Answer
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm italic">
                            "{faq.userRoughAnswer}"
                          </p>
                        </div>}

                      <div className="flex gap-3">
                        <button onClick={() => handleConfirmAnswer(faq.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          Confirm Answer
                        </button>
                        <button onClick={() => handleRejectAnswer(faq.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                          Provide My Answer
                        </button>
                      </div>
                    </div>}

                  {/* Needs User Answer */}
                  {faq.status === 'needs-review' && <div className="mt-3">
                      {faq.userRoughAnswer ? <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-medium text-amber-700 uppercase">
                                Your Answer (Unrefined)
                              </span>
                            </div>
                            <p className="text-slate-700 italic">
                              "{faq.userRoughAnswer}"
                            </p>
                          </div>
                          <button onClick={() => handleRefineUserAnswer(faq.id)} disabled={isRefining} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {isRefining ? <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                AI is refining your answer...
                              </> : <>
                                <Sparkles className="w-4 h-4" />
                                Let AI Refine This Answer
                              </>}
                          </button>
                        </div> : <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-800 mb-3">
                            This question needs your answer. Type your response
                            below and AI will help refine it.
                          </p>
                          <textarea value={reviewingFAQ?.id === faq.id ? userAnswer : ''} onChange={e => {
                    setReviewingFAQ(faq);
                    setUserAnswer(e.target.value);
                  }} placeholder="Type your answer here (don't worry about perfect grammar, AI will help refine it)..." rows={3} className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none mb-3" />
                          <button onClick={() => handleSubmitUserAnswer(faq.id)} disabled={!userAnswer.trim() || isRefining} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isRefining ? <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                AI is refining your answer...
                              </> : <>
                                <Send className="w-4 h-4" />
                                Submit & Let AI Refine
                              </>}
                          </button>
                        </div>}
                    </div>}
                </div>

                {faq.status === 'confirmed' && <div className="flex gap-2">
                    <button onClick={() => {
                setEditingFAQ(faq);
                setIsCreating(false);
              }} className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
                  {faq.category}
                </span>
                <span>Updated {faq.lastUpdated}</span>

                {/* AlphaSite Share Toggle */}
                {faq.status === 'confirmed' && <div className="ml-auto flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={faq.shareOnAlphaSite || false} onChange={() => handleToggleAlphaSite(faq.id)} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" />
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                        <Globe className="w-4 h-4" />
                        Share on AlphaSite
                      </span>
                    </label>
                    {faq.shareOnAlphaSite && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        Public
                      </span>}
                  </div>}
              </div>
            </motion.div>)}
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingFAQ && reviewingFAQ.status === 'proposed' && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setReviewingFAQ(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div initial={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">
                    Provide Your Answer
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {reviewingFAQ.question}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Answer
                    </label>
                    <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Type your answer here. Don't worry about perfect grammar or formatting - AI will help refine it for you." rows={6} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Once you submit, AI will refine your answer to make it
                      clear, professional, and consistent with your other FAQs.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => {
                setReviewingFAQ(null);
                setUserAnswer('');
              }} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleSubmitUserAnswer(reviewingFAQ.id)} disabled={!userAnswer.trim() || isRefining} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {isRefining ? <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Refining...
                      </> : <>
                        <Send className="w-4 h-4" />
                        Submit & Refine
                      </>}
                  </button>
                </div>
              </motion.div>
            </div>
          </>}
      </AnimatePresence>
    </div>;
}