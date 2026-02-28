import React, { Children } from 'react';
import { FileText, MessageSquare, Clock, CheckCircle2, AlertCircle, Edit2, Eye, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
interface ArticleServiceViewProps {
  service: any;
  onAction: (action: string, item: any) => void;
}
export function ArticleServiceView({
  service,
  onAction
}: ArticleServiceViewProps) {
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  return <div className="space-y-8">
      {/* Current Article Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Current Article
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Published
          </span>
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {service.currentArticle?.title || 'The Future of AI in Enterprise Business'}
              </h4>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {service.currentArticle?.excerpt || 'Exploring how artificial intelligence is reshaping corporate structures and decision-making processes in the modern era...'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Posted 2 days ago
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> 1,240 views
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAction('view', service.currentArticle)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Live">
                <ExternalLink className="w-5 h-5" />
              </button>
              <button onClick={() => onAction('edit', service.currentArticle)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Article">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Proposed Articles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Proposed Articles
          </h3>
          <button onClick={() => onAction('add', {
          type: 'proposal'
        })} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Propose New
          </button>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
          {[1, 2].map((_, idx) => <motion.div key={idx} variants={item} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">
                    {idx === 0 ? 'Sustainable Growth Strategies' : 'Remote Work Culture 2.0'}
                  </h5>
                  <p className="text-sm text-gray-500 mt-1">
                    Draft • Last edited yesterday
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onAction('approve', {
              id: idx
            })} className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                  Approve
                </button>
                <button onClick={() => onAction('edit', {
              id: idx
            })} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>)}
        </motion.div>
      </section>

      {/* Feedback History */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          Feedback History
        </h3>

        <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
          {[{
          status: 'approved',
          text: 'Approved "Q3 Market Analysis" for publication',
          date: 'Oct 24'
        }, {
          status: 'revision',
          text: 'Requested changes on "Customer Retention Tactics"',
          date: 'Oct 22'
        }, {
          status: 'comment',
          text: 'Added comments to "Brand Voice Guidelines"',
          date: 'Oct 20'
        }].map((log, idx) => <div key={idx} className="relative">
              <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${log.status === 'approved' ? 'bg-green-500' : log.status === 'revision' ? 'bg-orange-500' : 'bg-blue-500'}`} />
              <p className="text-sm text-gray-900">{log.text}</p>
              <p className="text-xs text-gray-500 mt-0.5">{log.date}</p>
            </div>)}
        </div>
      </section>
    </div>;
}