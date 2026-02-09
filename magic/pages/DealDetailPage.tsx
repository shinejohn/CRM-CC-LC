import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, CheckCircle2, Star, Calendar, User, Mail, Phone, FileText, DollarSign, Clock, Plus } from 'lucide-react';
export function DealDetailPage({
  onBack
}: {
  onBack: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-6xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pipeline
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> Create Proposal
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Mark Won
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Q1 Service Contract
            </h1>
            <div className="flex gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <Star className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <p className="text-lg text-slate-600">Acme Corporation</p>
        </div>
      </div>

      {/* Pipeline Stage */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="relative flex justify-between items-center">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10" />
          {[{
          label: 'Lead',
          status: 'completed'
        }, {
          label: 'Qualified',
          status: 'completed'
        }, {
          label: 'Proposal',
          status: 'current'
        }, {
          label: 'Negotiate',
          status: 'upcoming'
        }, {
          label: 'Won',
          status: 'upcoming'
        }].map((stage, i) => <div key={i} className="flex flex-col items-center gap-2 bg-white px-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage.status === 'completed' ? 'bg-blue-600 border-blue-600 text-white' : stage.status === 'current' ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                {stage.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-current" />}
              </div>
              <span className={`text-sm font-medium ${stage.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>
                {stage.label}
              </span>
            </div>)}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{
        label: 'Expected Revenue',
        value: '$25,000',
        icon: DollarSign
      }, {
        label: 'Probability',
        value: '60%',
        icon: TrendingUp
      }, {
        label: 'Prorated Revenue',
        value: '$15,000',
        icon: DollarSign
      }, {
        label: 'Close Date',
        value: 'Jan 15',
        icon: Calendar
      }].map((metric, i) => <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">
              {metric.label}
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {metric.value}
            </h3>
          </div>)}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 flex overflow-x-auto">
              {['Overview', 'Proposals', 'Invoices', 'Activities', 'Files', 'Notes'].map((tab, i) => <button key={tab} className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  {tab}
                </button>)}
            </div>

            <div className="p-6 space-y-8">
              {/* Proposals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">
                    Proposals
                  </h3>
                  <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> New Proposal
                  </button>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        PROP-2024-0089: Q1 Services Package
                      </p>
                      <p className="text-sm text-slate-500">
                        Sent Dec 20 • $25,000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      Pending
                    </span>
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">
                    Activity Feed
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + Activity
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + Note
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Scheduled */}
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Phone className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">
                            Call - Follow up on proposal
                          </p>
                          <p className="text-sm text-slate-600">
                            Assigned to: Sarah M.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        Due Today
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3 ml-8">
                      <button className="text-xs font-medium text-emerald-600 hover:underline">
                        Mark Done
                      </button>
                      <button className="text-xs font-medium text-slate-500 hover:text-slate-700">
                        Reschedule
                      </button>
                    </div>
                  </div>

                  {/* History */}
                  <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
                    <div className="relative">
                      <div className="absolute -left-8 bg-white p-1 rounded-full border border-slate-200">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mb-1">
                        Today, 10:30 AM
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="font-medium text-slate-900">
                          Email sent: "Following up on our proposal"
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Opened by recipient ✓
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8 bg-white p-1 rounded-full border border-slate-200">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mb-1">
                        Dec 20, 2:15 PM
                      </p>
                      <p className="text-slate-900">
                        Proposal{' '}
                        <span className="font-medium text-blue-600">
                          PROP-2024-0089
                        </span>{' '}
                        sent
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8 bg-white p-1 rounded-full border border-slate-200">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mb-1">
                        Dec 18, 11:00 AM
                      </p>
                      <p className="text-slate-900">
                        Call logged: "Discussed requirements, ready for
                        proposal"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Deal Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
              Deal Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    SM
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    Sarah Martinez
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Team</p>
                <p className="text-sm font-medium text-slate-900">
                  Direct Sales
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Source</p>
                <p className="text-sm font-medium text-slate-900">Website</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Campaign</p>
                <p className="text-sm font-medium text-slate-900">
                  Q1 Outreach
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                    Enterprise
                  </span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                    Q1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account & Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
              Account & Contact
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-slate-100 rounded">🏢</div>
                  <span className="font-bold text-slate-900">
                    Acme Corporation
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Manufacturing | 50-100 employees
                </p>
                <button className="text-sm font-medium text-blue-600 hover:underline">
                  View Account →
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-slate-100 rounded">👤</div>
                  <div>
                    <span className="font-bold text-slate-900">John Smith</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">VP Operations</p>
                <p className="text-sm text-slate-600 mb-1">john@acmecorp.com</p>
                <p className="text-sm text-slate-600 mb-3">(555) 123-4567</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Email
                  </button>
                  <button className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>;
}