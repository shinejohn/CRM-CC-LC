import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArticleServiceView } from './ArticleServiceView';
import { AdServiceView } from './AdServiceView';
import { Settings, Activity, AlertTriangle } from 'lucide-react';
interface ServiceDetailViewProps {
  service: any;
  onAction: (action: string, item: any) => void;
}
export function ServiceDetailView({
  service,
  onAction
}: ServiceDetailViewProps) {
  if (!service) {
    return <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No Service Selected
        </h3>
        <p className="max-w-xs mt-2">
          Select a service from the list to view details, performance metrics,
          and management options.
        </p>
      </div>;
  }
  const renderContent = () => {
    switch (service.type) {
      case 'article':
        return <ArticleServiceView service={service} onAction={onAction} />;
      case 'ads':
        return <AdServiceView service={service} onAction={onAction} />;
      default:
        return <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Settings className="w-12 h-12 mb-4 text-gray-300" />
            <p>Configuration for {service.type} services is coming soon.</p>
          </div>;
    }
  };
  return <AnimatePresence mode="wait">
      <motion.div key={service.id} initial={{
      opacity: 0,
      x: 20
    }} animate={{
      opacity: 1,
      x: 0
    }} exit={{
      opacity: 0,
      x: -20
    }} transition={{
      duration: 0.3,
      ease: 'easeOut'
    }} className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${service.colorBg} ${service.colorText}`}>
                <service.icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {service.name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${service.status === 'active' ? 'bg-green-100 text-green-800' : service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : service.status === 'issue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {service.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Last updated: {service.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAction('settings', service)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Settings
              </button>
              {service.status === 'issue' && <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Resolve Issue
                </button>}
            </div>
          </div>

          <p className="mt-4 text-gray-600 max-w-3xl">{service.description}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {renderContent()}
        </div>
      </motion.div>
    </AnimatePresence>;
}