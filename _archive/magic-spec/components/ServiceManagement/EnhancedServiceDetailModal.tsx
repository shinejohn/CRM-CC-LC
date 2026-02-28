import React, { useState } from 'react';
import { X, Settings, Activity, BarChart3, Info, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArticleServiceView } from './ArticleServiceView';
import { AdServiceView } from './AdServiceView';
import { EventServiceView } from './EventServiceView';
import { CouponServiceView } from './CouponServiceView';
import { ClassifiedServiceView } from './ClassifiedServiceView';
import { EmailAdServiceView } from './EmailAdServiceView';
import { BookingSystemView } from './BookingSystemView';
import { PollServiceView } from './PollServiceView';
import { SocialPostServiceView } from './SocialPostServiceView';
interface EnhancedServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
}
export function EnhancedServiceDetailModal({
  isOpen,
  onClose,
  service
}: EnhancedServiceDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  if (!isOpen || !service) return null;
  // Determine which view component to render based on service type
  const renderServiceView = () => {
    const name = service.name.toLowerCase();
    if (name.includes('article') || name.includes('news')) return <ArticleServiceView service={service} />;
    if (name.includes('ad') || name.includes('sponsor')) return <AdServiceView service={service} />;
    if (name.includes('event') || name.includes('venue')) return <EventServiceView service={service} />;
    if (name.includes('coupon')) return <CouponServiceView service={service} />;
    if (name.includes('classified') || name.includes('listing')) return <ClassifiedServiceView service={service} />;
    if (name.includes('email')) return <EmailAdServiceView service={service} />;
    if (name.includes('booking') || name.includes('reservation')) return <BookingSystemView service={service} />;
    if (name.includes('poll')) return <PollServiceView service={service} />;
    if (name.includes('social') || name.includes('post')) return <SocialPostServiceView service={service} />;
    // Default fallback
    return <div className="text-center py-12">
        <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Info className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Service Details</h3>
        <p className="text-slate-500 mt-2">
          Detailed view for this service type is being configured.
        </p>
      </div>;
  };
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50" />

          {/* Modal */}
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
      }} transition={{
        duration: 0.2
      }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${service.status === 'Active' ? 'bg-green-50 text-green-600' : service.status === 'Expiring Soon' ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-50 text-slate-500'}`}>
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {service.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${service.status === 'Active' ? 'bg-green-100 text-green-800' : service.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                        {service.status === 'Expiring Soon' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {service.status}
                      </span>
                      <span className="text-sm text-slate-500">
                        {service.category}
                      </span>
                      <span className="text-sm text-slate-300">•</span>
                      <span className="text-sm font-medium text-slate-700">
                        {service.price}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <ExternalLink className="h-5 w-5" />
                  </button>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-slate-100 bg-white">
                <nav className="flex space-x-8" aria-label="Tabs">
                  {[{
                id: 'overview',
                label: 'Overview',
                icon: Info
              }, {
                id: 'activity',
                label: 'Activity',
                icon: Activity
              }, {
                id: 'analytics',
                label: 'Analytics',
                icon: BarChart3
              }, {
                id: 'settings',
                label: 'Settings',
                icon: Settings
              }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                      `}>
                      <tab.icon className={`
                        -ml-0.5 mr-2 h-4 w-4
                        ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}
                      `} />
                      {tab.label}
                    </button>)}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                {activeTab === 'overview' && <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }}>
                    {renderServiceView()}
                  </motion.div>}

                {activeTab === 'activity' && <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Recent Activity
                    </h3>
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                      <div className="flow-root">
                        <ul className="-mb-8">
                          {[1, 2, 3, 4].map((item, itemIdx) => <li key={itemIdx}>
                              <div className="relative pb-8">
                                {itemIdx !== 3 ? <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" /> : null}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                      <Activity className="h-4 w-4 text-white" aria-hidden="true" />
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      <p className="text-sm text-slate-500">
                                        Service updated automatically{' '}
                                        <a href="#" className="font-medium text-slate-900">
                                          System
                                        </a>
                                      </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-slate-500">
                                      <time dateTime="2020-09-20">
                                        {item}h ago
                                      </time>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>)}
                        </ul>
                      </div>
                    </div>
                  </div>}

                {activeTab === 'analytics' && <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">
                      Deep Analytics
                    </h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                      Detailed performance metrics and historical data
                      visualizations will appear here.
                    </p>
                  </div>}

                {activeTab === 'settings' && <div className="space-y-6">
                    <div className="bg-white shadow-sm rounded-lg border border-slate-200">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-slate-900">
                          Service Configuration
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-slate-500">
                          <p>
                            Manage how this service operates and interacts with
                            your other tools.
                          </p>
                        </div>
                        <div className="mt-5">
                          <button type="button" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                            Change settings
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg border border-red-100">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-red-600">
                          Danger Zone
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-slate-500">
                          <p>
                            Pause or cancel this service. This may affect your
                            billing and active campaigns.
                          </p>
                        </div>
                        <div className="mt-5 flex gap-3">
                          <button type="button" className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100">
                            Pause Service
                          </button>
                          <button type="button" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                            Cancel Subscription
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  Close
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                  View Full Report
                </button>
              </div>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}