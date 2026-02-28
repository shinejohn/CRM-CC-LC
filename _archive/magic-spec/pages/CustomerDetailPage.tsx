import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, MessageSquare, MoreVertical, Phone, Mail, MapPin, Calendar, DollarSign, Package, Clock, Star, Plus, Home, Wrench, AlertCircle, FileText, Heart, Award, Gift, Cake, CheckCircle2 } from 'lucide-react';
import { useBusinessMode } from '../contexts/BusinessModeContext';
import { ScheduleActivityModal } from '../components/ScheduleActivityModal';
import { QuickCreateModal } from '../components/QuickCreateModal';
interface CustomerDetailPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}
export function CustomerDetailPage({
  onBack,
  onNavigate
}: CustomerDetailPageProps) {
  const {
    mode,
    terminology
  } = useBusinessMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  // Mode-specific tabs
  const tabs = mode === 'b2c-services' ? ['Overview', 'Jobs', 'Quotes', 'Invoices', 'Property Notes', 'Communications'] : mode === 'b2b-pipeline' ? ['Overview', 'Contacts', 'Deals', 'Proposals', 'Invoices', 'Activity', 'Files'] : ['Overview', 'Visits', 'Preferences', 'Rewards', 'Communications'];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {terminology.customers}
        </button>
        <div className="flex gap-3">
          <button onClick={() => onNavigate?.('customer-add')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </button>

          {mode === 'b2c-services' && <>
              <button onClick={() => setShowQuoteModal(true)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" /> Quote
              </button>
              <button onClick={() => setShowScheduleModal(true)} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule Job
              </button>
            </>}

          {mode === 'b2c-retail' && <>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Gift className="w-4 h-4" /> Send Offer
              </button>
              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Log Visit
              </button>
            </>}

          {mode === 'b2b-pipeline' && <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Message
            </button>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'b2b-pipeline' ? '🏢 Acme Corporation' : mode === 'b2c-retail' ? '👤 Sarah Mitchell' : '👤 John Smith'}
          </h1>
          {mode === 'b2c-retail' && <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full flex items-center gap-1">
              💎 VIP
            </span>}
        </div>
        {mode !== 'b2c-retail' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
            Active
          </span>}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>
              {mode === 'b2c-retail' ? 'sarah.m@email.com' : 'john.smith@email.com'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>(555) {mode === 'b2c-retail' ? '234-5678' : '987-6543'}</span>
          </div>
          {mode !== 'b2c-retail' && <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>456 Oak Lane, Anytown</span>
            </div>}
          {mode === 'b2c-retail' && <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-slate-400" />
              <span>Birthday: Jan 2</span>
            </div>}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
            <span className="text-slate-400">
              {mode === 'b2c-retail' ? 'Member since:' : 'Client since:'}
            </span>
            <span className="font-medium text-slate-900">
              {mode === 'b2c-retail' ? 'April 2023' : 'March 2022'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        label: mode === 'b2c-retail' ? 'Total Spent' : 'Total Spent',
        value: mode === 'b2c-retail' ? '$1,840' : '$2,840',
        icon: DollarSign
      }, {
        label: mode === 'b2b-pipeline' ? 'Open Deals' : mode === 'b2c-services' ? 'Jobs Completed' : 'Visits',
        value: mode === 'b2c-retail' ? '12' : '8',
        icon: mode === 'b2c-retail' ? Calendar : Package
      }, {
        label: mode === 'b2c-retail' ? 'Avg Check' : 'Outstanding Balance',
        value: mode === 'b2c-retail' ? '$153' : '$0',
        icon: DollarSign
      }, {
        label: mode === 'b2c-retail' ? 'Last Visit' : 'Last Service',
        value: mode === 'b2c-retail' ? '8 days ago' : '14 days ago',
        icon: Clock
      }].map((metric, i) => <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">
              {metric.label}
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {metric.value}
            </h3>
          </div>)}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 flex overflow-x-auto">
          {tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab}
            </button>)}
        </div>

        <div className="p-6">
          {mode === 'b2c-retail' ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preferences */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Preferences
                  </h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">
                    Edit Preferences
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Seating
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        Table 7 (window)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Dietary
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        Gluten-free
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Favorites
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        Seafood, Pinot Noir
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Allergies
                      </p>
                      <p className="text-sm font-medium text-red-600">
                        Shellfish
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Staff Notes
                    </p>
                    <p className="text-sm text-slate-600 italic">
                      "Anniversary in April. Partner: James. Usually visits on
                      Fridays."
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Visits */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Recent Visits
                  </h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">
                    View All 12 Visits →
                  </button>
                </div>
                <div className="space-y-3">
                  {[{
                date: 'Dec 24',
                amount: '$185',
                guests: 2,
                note: 'Christmas Eve dinner'
              }, {
                date: 'Dec 15',
                amount: '$142',
                guests: 2,
                note: 'Date night'
              }, {
                date: 'Dec 1',
                amount: '$78',
                guests: 1,
                note: 'Quick lunch'
              }].map((visit, i) => <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">
                          {visit.date} • {visit.amount}
                        </p>
                        <p className="text-sm text-slate-500">"{visit.note}"</p>
                      </div>
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {visit.guests} guests
                      </span>
                    </div>)}
                </div>
              </div>
            </div> : mode === 'b2c-services' ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Notes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <Home className="w-4 h-4" /> Property Notes
                  </h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">
                    Edit Notes
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Property Details
                    </p>
                    <p className="text-sm text-slate-600">
                      Single Family Home • Built 1985
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <span className="font-bold">Water Heater:</span> 12 years
                      old (recommend replacement)
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Access Notes
                    </p>
                    <p className="text-sm text-slate-600 italic">
                      "Gate code: 1234. Dog friendly. Shutoff behind water
                      heater."
                    </p>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Service History
                  </h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">
                    View All 8 Jobs →
                  </button>
                </div>
                <div className="space-y-3">
                  {[{
                date: 'Dec 15',
                service: 'Drain cleaning',
                price: '$185',
                rating: 5
              }, {
                date: 'Oct 20',
                service: 'Annual inspection',
                price: '$75',
                rating: 5
              }, {
                date: 'Aug 5',
                service: 'Water heater repair',
                price: '$450',
                rating: 4
              }].map((job, i) => <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">
                          {job.service}
                        </p>
                        <p className="text-sm text-slate-500">
                          {job.date} • {job.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                          Completed
                        </span>
                        <div className="flex text-amber-400">
                          {[...Array(job.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>
            </div> /* Default Content for other modes */ : <div className="text-center py-12 text-slate-500">
              Content for {activeTab} tab
            </div>}

          {/* Shared Sections */}
          {mode === 'b2c-services' && <>
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Open Quotes */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Open Quotes
                  </h3>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-900">
                          Water Heater Replacement
                        </p>
                        <p className="text-sm text-slate-500">
                          $2,400 | Sent Dec 26
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button className="text-sm font-medium text-blue-600 hover:underline">
                        Follow Up
                      </button>
                      <button className="text-sm font-medium text-blue-600 hover:underline">
                        View
                      </button>
                      <button className="text-sm font-medium text-blue-600 hover:underline">
                        → Invoice
                      </button>
                    </div>
                  </div>
                  <button className="mt-3 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> New Quote
                  </button>
                </div>

                {/* Invoices */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Invoices
                  </h3>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3 flex items-center gap-2 text-emerald-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> All invoices paid
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded">
                      <span className="text-slate-900">INV-0198 (Dec 15)</span>
                      <span className="text-slate-600">$185</span>
                    </div>
                    <div className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded">
                      <span className="text-slate-900">INV-0187 (Oct 20)</span>
                      <span className="text-slate-600">$75</span>
                    </div>
                  </div>
                  <button className="mt-2 text-sm font-medium text-blue-600 hover:underline">
                    View All Invoices →
                  </button>
                </div>
              </div>

              {/* AI Insights */}
              <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  💡 AI Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm text-indigo-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Water heater is 12 years old - proactive replacement
                      recommended
                    </span>
                  </div>
                  <div className="flex gap-3 text-sm text-indigo-800">
                    <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Annual inspection due in October - set reminder</span>
                  </div>
                  <div className="flex gap-3 text-sm text-indigo-800">
                    <Star className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Excellent client - always pays on time, 5-star ratings
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-sm font-medium rounded hover:bg-indigo-50 transition-colors">
                    Create Quote for Water Heater
                  </button>
                  <button className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-sm font-medium rounded hover:bg-indigo-50 transition-colors">
                    Schedule Reminder
                  </button>
                </div>
              </div>
            </>}

          {mode === 'b2c-retail' && <>
              {/* Rewards Status */}
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6 flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Rewards Status
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          💎 VIP TIER
                        </p>
                        <p className="text-sm text-slate-500">11+ visits</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">
                          340 pts
                        </p>
                        <p className="text-xs text-slate-500">
                          Next reward: 50 pts
                        </p>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-purple-600 rounded-full w-[68%]" />
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors">
                        Redeem Reward
                      </button>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        Add Points
                      </button>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 w-full md:w-64">
                    <p className="text-sm font-bold text-purple-900 mb-2">
                      VIP Perks
                    </p>
                    <ul className="space-y-2">
                      <li className="text-sm text-purple-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Priority
                        reservations
                      </li>
                      <li className="text-sm text-purple-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 10% off
                      </li>
                      <li className="text-sm text-purple-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Birthday dessert
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Birthday Alert */}
              <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <Cake className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Birthday in 2 Days!</h3>
                      <p className="text-purple-100">
                        Don't forget to send a birthday offer.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-colors shadow-sm">
                      Send Birthday Email
                    </button>
                    <button className="px-4 py-2 bg-purple-700 text-white font-medium rounded-lg hover:bg-purple-800 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </>}
        </div>
      </div>

      {/* Modals */}
      <ScheduleActivityModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={data => {
      localStorage.setItem('cc_activity_' + Date.now(), JSON.stringify(data));
      console.log('[API POST] /api/v1/activities', data);
      setShowScheduleModal(false);
    }} />

      <QuickCreateModal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} type="quote" onQuickCreate={data => {
      localStorage.setItem('cc_quote_' + Date.now(), JSON.stringify(data));
      console.log('[API POST] /api/v1/quotes', data);
      setShowQuoteModal(false);
    }} />
    </motion.div>;
}