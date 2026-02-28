import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Linkedin, Briefcase, Clock, Calendar } from 'lucide-react';
export function ContactDetailPage({
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
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Contacts
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500">
            JS
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">John Smith</h1>
              <p className="text-lg text-slate-600 mt-1">
                VP Operations at{' '}
                <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                  🏢 Acme Corporation
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-5 h-5 text-slate-400" />
                <a href="mailto:john.smith@acmecorp.com" className="hover:text-blue-600">
                  john.smith@acmecorp.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-5 h-5 text-slate-400" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-5 h-5 text-slate-400" />
                <span>(555) 987-6543 (Mobile)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Linkedin className="w-5 h-5 text-slate-400" />
                <a href="#" className="hover:text-blue-600">
                  linkedin.com/in/johnsmith
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                <Mail className="w-4 h-4" /> Send Email
              </button>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4" /> Log Call
              </button>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 flex">
              {['Overview', 'Deals', 'Activities', 'Communications'].map((tab, i) => <button key={tab} className={`px-6 py-4 text-sm font-medium transition-colors ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                    {tab}
                  </button>)}
            </div>

            <div className="p-6 space-y-8">
              {/* Associated Deals */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" /> Associated
                  Deals
                </h3>
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          Q1 Service Contract
                        </h4>
                        <p className="text-sm text-slate-600">
                          $25,000 • Proposal stage
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Decision Maker
                      </span>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                      View Deal →
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          Equipment Upgrade
                        </h4>
                        <p className="text-sm text-slate-600">
                          $18,000 • Qualified stage
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Influencer
                      </span>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                      View Deal →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Activity
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-slate-900">
                  Email opened
                </p>
                <p className="text-xs text-slate-500">Today, 10:45 AM</p>
              </div>
              <div className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-slate-900">
                  Call logged (15 min)
                </p>
                <p className="text-xs text-slate-500">Dec 28, 2:30 PM</p>
              </div>
              <div className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-slate-900">
                  Proposal sent
                </p>
                <p className="text-xs text-slate-500">Dec 20, 11:00 AM</p>
              </div>
              <div className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white" />
                <p className="text-sm font-medium text-slate-900">
                  Meeting completed
                </p>
                <p className="text-xs text-slate-500">Dec 18, 9:00 AM</p>
              </div>
            </div>
            <button className="w-full mt-4 text-sm font-medium text-blue-600 hover:underline">
              View All Activity →
            </button>
          </div>
        </div>
      </div>
    </motion.div>;
}