import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Download, Send, CheckCircle2, Calendar, DollarSign, Clock, AlertCircle, FileText } from 'lucide-react';
export function InvoiceDetailPage({
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
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" /> Send
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Invoice #INV-2024-0142
        </h1>
        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> OVERDUE
        </span>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Addresses */}
        <div className="p-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">
              From
            </h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Your Company Name</p>
              <p>123 Business St</p>
              <p>Suite 100</p>
              <p>City, ST 12345</p>
              <p className="text-blue-600">contact@yourcompany.com</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">
              To
            </h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Acme Corporation</p>
              <p>456 Corporate Blvd</p>
              <p>Suite 500</p>
              <p>City, ST 67890</p>
              <p className="text-blue-600">billing@acmecorp.com</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100">
          <div className="p-6 border-r border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">
              Invoice Date
            </p>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Nov 1, 2024
            </p>
          </div>
          <div className="p-6 border-r border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">Due Date</p>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Dec 1, 2024
            </p>
          </div>
          <div className="p-6 border-r border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">Amount Due</p>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> $4,500.00
            </p>
          </div>
          <div className="p-6 bg-red-50">
            <p className="text-xs text-red-600 uppercase mb-1">Days Overdue</p>
            <p className="font-bold text-red-700 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 32 days
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-8">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">
                  Description
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">
                  Qty
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">
                  Rate
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 text-sm text-slate-900">
                  Q1 Services - Consulting
                </td>
                <td className="py-4 text-right text-sm text-slate-600">
                  10 hrs
                </td>
                <td className="py-4 text-right text-sm text-slate-600">
                  $350.00
                </td>
                <td className="py-4 text-right text-sm font-medium text-slate-900">
                  $3,500.00
                </td>
              </tr>
              <tr>
                <td className="py-4 text-sm text-slate-900">
                  Q1 Services - Implementation
                </td>
                <td className="py-4 text-right text-sm text-slate-600">
                  4 hrs
                </td>
                <td className="py-4 text-right text-sm text-slate-600">
                  $250.00
                </td>
                <td className="py-4 text-right text-sm font-medium text-slate-900">
                  $1,000.00
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium text-slate-900">$4,500.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (0%):</span>
                <span className="font-medium text-slate-900">$0.00</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold">
                <span className="text-slate-900">TOTAL:</span>
                <span className="text-slate-900">$4,500.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount Paid:</span>
                <span className="font-medium text-slate-900">$0.00</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-base font-bold border border-slate-200">
                <span className="text-slate-900">BALANCE DUE:</span>
                <span className="text-slate-900">$4,500.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Related */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
            Activity Timeline
          </h3>
          <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
            <div className="relative">
              <div className="absolute -left-5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Reminder email sent (3rd)
                  </p>
                  <p className="text-xs text-slate-500">Automated system</p>
                </div>
                <span className="text-xs text-slate-500">Dec 15</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Reminder email sent (2nd)
                  </p>
                  <p className="text-xs text-slate-500">Automated system</p>
                </div>
                <span className="text-xs text-slate-500">Dec 8</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Invoice sent to billing@acmecorp.com
                  </p>
                  <p className="text-xs text-slate-500">Sarah M.</p>
                </div>
                <span className="text-xs text-slate-500">Nov 1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
              Related
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">View Deal</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">View Account</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">
                  View Proposal
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>;
}
function ArrowRight({
  className
}: {
  className?: string;
}) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>;
}