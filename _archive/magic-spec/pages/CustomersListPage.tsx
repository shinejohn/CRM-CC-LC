import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, List, Grid, ChevronDown, Mail, Download, Upload } from 'lucide-react';
import { useBusinessMode } from '../contexts/BusinessModeContext';
export function CustomersListPage({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const {
    mode,
    terminology
  } = useBusinessMode();
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const customers = [{
    id: 1,
    name: 'Acme Corporation',
    contact: 'John Smith',
    status: 'active',
    revenue: '$67,500',
    phone: '(555) 123-4567'
  }, {
    id: 2,
    name: 'Beta Industries',
    contact: 'Sarah Chen',
    status: 'active',
    revenue: '$42,000',
    phone: '(555) 234-5678'
  }, {
    id: 3,
    name: 'Gamma LLC',
    contact: 'Mike Johnson',
    status: 'at-risk',
    revenue: '$28,000',
    phone: '(555) 345-6789'
  }, {
    id: 4,
    name: 'Delta Co',
    contact: '—',
    status: 'inactive',
    revenue: '$12,000',
    phone: '(555) 456-7890'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'b2b-pipeline' ? '🏢' : mode === 'b2c-services' ? '👥' : '👤'}{' '}
            {terminology.customers}
          </h1>
          <p className="text-slate-500">
            Manage your {terminology.customers.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('customer-bulk-import')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button onClick={() => onNavigate('customer-add')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New {terminology.customer}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm flex-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
              Status <ChevronDown className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
              + Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="w-4 h-4 rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                {mode === 'b2b-pipeline' ? 'Company' : 'Name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                {mode === 'b2b-pipeline' ? 'Contact' : 'Phone'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                {mode === 'b2c-retail' ? 'Total Visits' : 'Revenue'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map(customer => <tr key={customer.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('customer-detail')}>
                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded" />
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">
                    {customer.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {mode === 'b2b-pipeline' ? customer.contact : customer.phone}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : customer.status === 'at-risk' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? 'bg-emerald-500' : customer.status === 'at-risk' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    {customer.status === 'active' ? 'Active' : customer.status === 'at-risk' ? 'At Risk' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {customer.revenue}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1-4 of 247</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
              ← Prev
            </button>
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Selected: 0</span>
        <div className="flex gap-3">
          <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium">
            <Mail className="w-4 h-4" /> Bulk Email
          </button>
          <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
    </motion.div>;
}