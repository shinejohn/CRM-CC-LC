import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Calendar, FileText, Megaphone, Newspaper, Star, TrendingUp, Clock, ChevronRight, Lightbulb, BarChart3, List, CalendarDays, Sparkles, Edit, Eye, Copy } from 'lucide-react';
interface ContentManagerDashboardProps {
  onNavigate?: (page: string) => void;
}
interface ContentSlot {
  id: string;
  type: 'ad' | 'classified' | 'announcement' | 'event' | 'article';
  slotNumber: number;
  status: 'complete' | 'scheduled' | 'needed' | 'overdue' | 'draft';
  title?: string;
  dueDate?: string;
  liveDate?: string;
  endDate?: string;
  performance?: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}
export function ContentManagerDashboard({
  onNavigate
}: ContentManagerDashboardProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');
  const [selectedMonth] = useState('January 2026');
  // Mock data
  const packageData = {
    name: 'Community Influencer',
    billingPeriod: 'Jan 1 - Jan 31',
    businessName: 'ABC Home Services'
  };
  const stats = {
    complete: 5,
    needed: 3,
    scheduled: 2,
    drafts: 1
  };
  const contentSlots: ContentSlot[] = [{
    id: '1',
    type: 'ad',
    slotNumber: 1,
    status: 'complete',
    title: 'Winter Sale Banner',
    liveDate: 'Jan 1',
    endDate: 'Jan 15',
    performance: {
      impressions: 8450,
      clicks: 203,
      ctr: 2.4
    }
  }, {
    id: '2',
    type: 'ad',
    slotNumber: 2,
    status: 'needed',
    dueDate: 'Jan 15'
  }, {
    id: '3',
    type: 'classified',
    slotNumber: 1,
    status: 'complete',
    title: 'Hiring Line Cook',
    liveDate: 'Jan 1',
    endDate: 'Jan 14'
  }, {
    id: '4',
    type: 'classified',
    slotNumber: 2,
    status: 'scheduled',
    title: 'Equipment Sale',
    liveDate: 'Jan 15',
    endDate: 'Jan 31'
  }, {
    id: '5',
    type: 'announcement',
    slotNumber: 1,
    status: 'overdue',
    dueDate: 'Jan 5'
  }, {
    id: '6',
    type: 'announcement',
    slotNumber: 2,
    status: 'needed',
    dueDate: 'Jan 20'
  }, {
    id: '7',
    type: 'event',
    slotNumber: 1,
    status: 'complete',
    title: "Valentine's Dinner Special",
    liveDate: 'Jan 14'
  }, {
    id: '8',
    type: 'event',
    slotNumber: 2,
    status: 'scheduled',
    title: 'Live Jazz Night',
    liveDate: 'Feb 1'
  }];
  const getStatusColor = (status: ContentSlot['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'needed':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  const getTypeIcon = (type: ContentSlot['type']) => {
    switch (type) {
      case 'ad':
        return <Megaphone className="w-4 h-4" />;
      case 'classified':
        return <FileText className="w-4 h-4" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'article':
        return <Newspaper className="w-4 h-4" />;
    }
  };
  const getTypeLabel = (type: ContentSlot['type']) => {
    switch (type) {
      case 'ad':
        return 'Ads';
      case 'classified':
        return 'Classifieds';
      case 'announcement':
        return 'Announcements';
      case 'event':
        return 'Premium Events';
      case 'article':
        return 'Expertise Article';
    }
  };
  const getContentByType = (type: ContentSlot['type']) => {
    return contentSlots.filter(slot => slot.type === type);
  };
  const getCompletionPercentage = (type: ContentSlot['type']) => {
    const slots = getContentByType(type);
    const completed = slots.filter(s => s.status === 'complete' || s.status === 'scheduled').length;
    return Math.round(completed / slots.length * 100);
  };
  return <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Content Manager
              </h1>
              <p className="text-slate-600 mt-1">{packageData.businessName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">
                Package: {packageData.name}
              </p>
              <p className="text-sm text-slate-500">
                Billing Period: {packageData.billingPeriod}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">
                  COMPLETE
                </span>
              </div>
              <p className="text-3xl font-bold text-emerald-900">
                {stats.complete}
              </p>
              <p className="text-xs text-emerald-700">items</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  NEEDED
                </span>
              </div>
              <p className="text-3xl font-bold text-amber-900">
                {stats.needed}
              </p>
              <p className="text-xs text-amber-700">items</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  SCHEDULED
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {stats.scheduled}
              </p>
              <p className="text-xs text-blue-700">items</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">
                  DRAFTS
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.drafts}
              </p>
              <p className="text-xs text-slate-700">item</p>
            </div>
          </div>
        </div>

        {/* Needs Attention Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5" />
              <h2 className="text-lg font-bold">NEEDS YOUR ATTENTION</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Overdue Item */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Megaphone className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-200 text-red-900 text-xs font-bold rounded">
                      OVERDUE
                    </span>
                    <h3 className="font-bold text-slate-900">
                      Announcement Slot 1
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    Was due: January 5, 2026
                  </p>
                  <p className="text-sm text-slate-700 mb-4">
                    No content was created for this slot. The system used your
                    last announcement "Holiday Hours Update" as a placeholder.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors">
                      Create New Announcement
                    </button>
                    <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                      Keep Current
                    </button>
                    <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                      Use Library
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Due Soon - Ad */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Megaphone className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-200 text-amber-900 text-xs font-bold rounded">
                      DUE SOON
                    </span>
                    <h3 className="font-bold text-slate-900">Ad Slot 2</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Due: January 15, 2026 (3 days)
                  </p>
                  <p className="text-sm text-slate-700 mb-3">
                    Create your ad for the Jan 16-31 slot, or we'll suggest one
                    from your library.
                  </p>

                  <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          AI Suggestion
                        </p>
                        <p className="text-sm text-blue-800">
                          Reuse "Winter Sale Banner" with updated dates? It
                          performed well (2.4% CTR)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors">
                      Create New Ad
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Use AI Suggestion
                    </button>
                    <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                      Browse Library
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Due Soon - Announcement */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Megaphone className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-200 text-amber-900 text-xs font-bold rounded">
                      DUE SOON
                    </span>
                    <h3 className="font-bold text-slate-900">
                      Announcement Slot 2
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Due: January 20, 2026 (8 days)
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors">
                      Create Now
                    </button>
                    <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                      Schedule Reminder
                    </button>
                    <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                      Use Library
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Monthly Content Allowance */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-[#1E3A5F] px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-lg font-bold">
                YOUR MONTHLY CONTENT ALLOWANCE
              </h2>
              <span className="text-sm font-medium">{selectedMonth}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Advertising Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                ADVERTISING
              </h3>

              {/* Ads */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">Ads</h4>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{
                        width: `${getCompletionPercentage('ad')}%`
                      }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {getContentByType('ad').filter(s => s.status === 'complete' || s.status === 'scheduled').length}{' '}
                        of {getContentByType('ad').length} created
                      </span>
                    </div>

                    <div className="space-y-3">
                      {getContentByType('ad').map(slot => <div key={slot.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">
                              • Slot {slot.slotNumber}:
                            </span>
                            {slot.status === 'complete' || slot.status === 'scheduled' ? <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900">
                                  "{slot.title}"
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(slot.status)}`}>
                                  {slot.status === 'complete' ? `✓ Live ${slot.liveDate}-${slot.endDate}` : `Scheduled ${slot.liveDate}-${slot.endDate}`}
                                </span>
                              </div> : <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusColor(slot.status)}`}>
                                  {slot.status === 'overdue' ? '❌ OVERDUE' : '⚠️ Not created'}
                                </span>
                                <span className="text-sm text-slate-600">
                                  - Due {slot.dueDate} for Jan 16-31 slot
                                </span>
                              </div>}
                          </div>
                        </div>)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                    Create Now
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                    Use Library
                  </button>
                </div>
              </div>

              {/* Classifieds */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Classifieds
                    </h4>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{
                        width: `${getCompletionPercentage('classified')}%`
                      }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {getContentByType('classified').filter(s => s.status === 'complete' || s.status === 'scheduled').length}{' '}
                        of {getContentByType('classified').length} created
                      </span>
                    </div>

                    <div className="space-y-3">
                      {getContentByType('classified').map(slot => <div key={slot.id} className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">
                            • Slot {slot.slotNumber}:
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            "{slot.title}"
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(slot.status)}`}>
                            {slot.status === 'complete' ? `✓ Live ${slot.liveDate}-${slot.endDate}` : `✓ Scheduled ${slot.liveDate}-${slot.endDate}`}
                          </span>
                        </div>)}
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                  View All
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                CONTENT
              </h3>

              {/* Announcements */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Megaphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Announcements
                    </h4>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" style={{
                        width: `${getCompletionPercentage('announcement')}%`
                      }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {getContentByType('announcement').filter(s => s.status === 'complete' || s.status === 'scheduled').length}{' '}
                        of {getContentByType('announcement').length} created
                      </span>
                    </div>

                    <div className="space-y-3">
                      {getContentByType('announcement').map(slot => <div key={slot.id} className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">
                            • Slot {slot.slotNumber}:
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStatusColor(slot.status)}`}>
                            {slot.status === 'overdue' ? `❌ OVERDUE - Was due ${slot.dueDate}` : `⚠️ Not created - Due ${slot.dueDate}`}
                          </span>
                        </div>)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors">
                    Create Now
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                    Use Library
                  </button>
                </div>
              </div>

              {/* Premium Events */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Premium Events
                    </h4>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{
                        width: `${getCompletionPercentage('event')}%`
                      }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {getContentByType('event').filter(s => s.status === 'complete' || s.status === 'scheduled').length}{' '}
                        of {getContentByType('event').length} created
                      </span>
                    </div>

                    <div className="space-y-3">
                      {getContentByType('event').map(slot => <div key={slot.id} className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">
                            • Slot {slot.slotNumber}:
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            "{slot.title}"
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(slot.status)}`}>
                            {slot.status === 'complete' ? '✓ Live' : `✓ Scheduled ${slot.liveDate}`}
                          </span>
                        </div>)}
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                  View All
                </button>
              </div>
            </div>

            {/* Premium Placements */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                PREMIUM PLACEMENTS
              </h3>

              {/* Headliner - Business Category */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200 mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">
                      ⭐ Headliner (Business Category)
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-amber-900">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">
                      Currently featuring:{' '}
                      <span className="font-medium">
                        Premium Business Profile
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Placement: "Restaurants" category - All publications
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-white border-2 border-amber-300 hover:border-amber-400 text-amber-900 rounded-lg font-medium text-sm transition-colors">
                    Manage
                  </button>
                </div>
              </div>

              {/* Headliner - Events */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">
                      ⭐ Headliner (Events)
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-full" />
                      </div>
                      <span className="text-xs font-bold text-amber-900">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">
                      Currently featuring:{' '}
                      <span className="font-medium">
                        "Valentine's Dinner Special"
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Placement: Go Event City homepage
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-white border-2 border-amber-300 hover:border-amber-400 text-amber-900 rounded-lg font-medium text-sm transition-colors">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${viewMode === 'list' ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <List className="w-4 h-4 inline mr-2" />
              List View
            </button>
            <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${viewMode === 'calendar' ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <CalendarDays className="w-4 h-4 inline mr-2" />
              Calendar View
            </button>
            <button onClick={() => setViewMode('timeline')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${viewMode === 'timeline' ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <div className="w-4 h-4 inline mr-2" />
              Timeline View
            </button>
          </div>

          {viewMode === 'calendar' && <div>
              <h3 className="text-center text-lg font-bold text-slate-900 mb-4">
                JANUARY 2026
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-xs font-bold text-slate-600 py-2">
                      {day}
                    </div>)}
                {/* Calendar grid - simplified for demo */}
                {Array.from({
              length: 35
            }, (_, i) => {
              const day = i - 2; // Start on Wednesday
              const isCurrentMonth = day >= 1 && day <= 31;
              return <div key={i} className={`aspect-square border rounded-lg p-2 ${isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                        {isCurrentMonth && <>
                            <div className="text-xs font-medium text-slate-900 mb-1">
                              {day}
                            </div>
                            {day === 1 && <div className="space-y-1">
                                <div className="w-full h-1 bg-emerald-500 rounded" title="Ad Live" />
                                <div className="w-full h-1 bg-emerald-500 rounded" title="Classified Live" />
                              </div>}
                            {day === 5 && <div className="w-full h-1 bg-red-500 rounded" title="Announcement Overdue" />}
                            {day === 14 && <div className="w-full h-1 bg-emerald-500 rounded" title="Event Live" />}
                            {day === 15 && <div className="space-y-1">
                                <div className="w-full h-1 bg-amber-500 rounded" title="Ad Due" />
                                <div className="w-full h-1 bg-blue-500 rounded" title="Classified Scheduled" />
                              </div>}
                            {day === 20 && <div className="w-full h-1 bg-amber-500 rounded" title="Announcement Due" />}
                          </>}
                      </div>;
            })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded" />
                  <span className="text-slate-600">Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span className="text-slate-600">Due/Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-slate-600">Overdue</span>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}