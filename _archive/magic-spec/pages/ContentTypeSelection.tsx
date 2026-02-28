import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone, FileText, Calendar, Star, Newspaper, Ticket, Tag, Bell, Mail, Share2, CheckCircle, AlertCircle, Clock, ChevronRight, Sparkles } from 'lucide-react';
interface ContentTypeSelectionProps {
  onNavigate?: (page: string, contentType?: string) => void;
  onBack?: () => void;
}
interface ContentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'included' | 'expert' | 'additional';
  used: number;
  total: number;
  status: 'open' | 'complete' | 'active' | 'due';
  statusLabel: string;
  statusColor: string;
  price?: string;
  description?: string;
  dueDate?: string;
}
export function ContentTypeSelection({
  onNavigate,
  onBack
}: ContentTypeSelectionProps) {
  const contentTypes: ContentType[] = [{
    id: 'ad',
    name: 'Ad',
    icon: <Megaphone className="w-6 h-6" />,
    category: 'included',
    used: 1,
    total: 2,
    status: 'open',
    statusLabel: '1 slot open',
    statusColor: 'amber'
  }, {
    id: 'classified',
    name: 'Classified',
    icon: <FileText className="w-6 h-6" />,
    category: 'included',
    used: 2,
    total: 2,
    status: 'complete',
    statusLabel: 'Complete',
    statusColor: 'emerald'
  }, {
    id: 'announcement',
    name: 'Announcement',
    icon: <Megaphone className="w-6 h-6" />,
    category: 'included',
    used: 0,
    total: 2,
    status: 'open',
    statusLabel: '2 slots open',
    statusColor: 'red'
  }, {
    id: 'event',
    name: 'Premium Event',
    icon: <Calendar className="w-6 h-6" />,
    category: 'included',
    used: 2,
    total: 2,
    status: 'complete',
    statusLabel: 'Complete',
    statusColor: 'emerald'
  }, {
    id: 'headliner-business',
    name: 'Headliner (Business)',
    icon: <Star className="w-6 h-6" />,
    category: 'included',
    used: 1,
    total: 1,
    status: 'active',
    statusLabel: 'Active',
    statusColor: 'emerald'
  }, {
    id: 'headliner-event',
    name: 'Headliner (Event)',
    icon: <Star className="w-6 h-6" />,
    category: 'included',
    used: 1,
    total: 1,
    status: 'active',
    statusLabel: 'Active',
    statusColor: 'emerald'
  }, {
    id: 'expert-article',
    name: 'Expert Article',
    icon: <Newspaper className="w-6 h-6" />,
    category: 'expert',
    used: 0,
    total: 1,
    status: 'due',
    statusLabel: 'Due Jan 20',
    statusColor: 'amber',
    dueDate: 'Jan 20'
  }, {
    id: 'tickets',
    name: 'Tickets',
    icon: <Ticket className="w-6 h-6" />,
    category: 'additional',
    used: 0,
    total: 0,
    status: 'open',
    statusLabel: '',
    statusColor: '',
    price: '6.9% + $0.99',
    description: 'Sell event tickets'
  }, {
    id: 'coupon',
    name: 'Coupon',
    icon: <Tag className="w-6 h-6" />,
    category: 'additional',
    used: 0,
    total: 0,
    status: 'open',
    statusLabel: '',
    statusColor: '',
    price: 'From $20',
    description: 'Digital offers & discounts'
  }, {
    id: 'alert-ad',
    name: 'Alert Ad',
    icon: <Bell className="w-6 h-6" />,
    category: 'additional',
    used: 0,
    total: 0,
    status: 'open',
    statusLabel: '',
    statusColor: '',
    price: 'From $35',
    description: 'Urgent notices & flash sales'
  }, {
    id: 'newsletter-ad',
    name: 'Newsletter Ad',
    icon: <Mail className="w-6 h-6" />,
    category: 'additional',
    used: 0,
    total: 0,
    status: 'open',
    statusLabel: '',
    statusColor: '',
    price: 'From $75',
    description: 'Email placement'
  }, {
    id: 'social-post-ad',
    name: 'Social Post Ad',
    icon: <Share2 className="w-6 h-6" />,
    category: 'additional',
    used: 0,
    total: 0,
    status: 'open',
    statusLabel: '',
    statusColor: '',
    price: 'From $40',
    description: 'Boosted social'
  }, {
    id: 'sponsored-article',
    name: 'Sponsored Article',
    icon: <Newspaper className="w-6 h-6" />,
    category: 'additional',
    used: 0,
    total: 0,
    status: 'open',
    statusLabel: '',
    statusColor: '',
    price: 'From $150',
    description: 'Feature story'
  }];
  const getStatusBadgeColor = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'red':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  const getActionButton = (type: ContentType) => {
    if (type.category === 'additional') {
      return <button className="w-full px-4 py-2 bg-[color:var(--nexus-1e3a5f)] hover:bg-[color:var(--nexus-152d4a)] text-white rounded-lg font-medium text-sm transition-colors">
          {type.id === 'tickets' ? 'Set Up' : 'Purchase'}
        </button>;
    }
    if (type.status === 'complete' || type.status === 'active') {
      return <button className="w-full px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
          {type.status === 'active' ? 'Manage' : 'View'}
        </button>;
    }
    if (type.category === 'expert') {
      return <button onClick={() => onNavigate?.('content-create', type.id)} className="w-full px-4 py-2 bg-[color:var(--nexus-1e3a5f)] hover:bg-[color:var(--nexus-152d4a)] text-white rounded-lg font-medium text-sm transition-colors">
          Start Writing
        </button>;
    }
    return <button onClick={() => onNavigate?.('content-create', type.id)} className="w-full px-4 py-2 bg-[color:var(--nexus-1e3a5f)] hover:bg-[color:var(--nexus-152d4a)] text-white rounded-lg font-medium text-sm transition-colors">
        Create
      </button>;
  };
  const includedTypes = contentTypes.filter(t => t.category === 'included');
  const expertTypes = contentTypes.filter(t => t.category === 'expert');
  const additionalTypes = contentTypes.filter(t => t.category === 'additional');
  return <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            What would you like to create?
          </h1>
          <p className="text-slate-600">Select content type to get started</p>
        </div>

        {/* Included in Package */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
            INCLUDED IN YOUR PACKAGE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {includedTypes.map(type => <motion.div key={type.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-[color:var(--nexus-1e3a5f)] transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">
                      {type.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {type.used} of {type.total} used
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  {type.status === 'complete' || type.status === 'active' ? <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(type.statusColor)}`}>
                      <CheckCircle className="w-3 h-3" />
                      {type.statusLabel}
                    </div> : <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(type.statusColor)}`}>
                      {type.statusColor === 'red' ? '🔴' : '🟡'}{' '}
                      {type.statusLabel}
                    </div>}
                </div>

                {getActionButton(type)}
              </motion.div>)}
          </div>
        </div>

        {/* Expert Content */}
        {expertTypes.length > 0 && <div className="mb-8">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
              EXPERT CONTENT
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertTypes.map(type => <motion.div key={type.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6 hover:border-purple-400 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">
                        {type.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {type.used} of {type.total} used
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(type.statusColor)}`}>
                      <Clock className="w-3 h-3" />
                      {type.statusLabel}
                    </div>
                  </div>

                  {getActionButton(type)}
                </motion.div>)}
            </div>
          </div>}

        {/* Additional Content */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
            ADDITIONAL CONTENT (Purchase Required)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {additionalTypes.map(type => <motion.div key={type.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-[color:var(--nexus-1e3a5f)] transition-all">
                <div className="flex items-start gap-4 mb-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">
                      {type.name}
                    </h3>
                    <p className="text-sm text-slate-600">{type.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-lg font-bold text-[color:var(--nexus-1e3a5f)]">
                    {type.price}
                  </p>
                </div>

                {getActionButton(type)}
              </motion.div>)}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-blue-900">
                💡 Package holders save 25% on all additional purchases!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}