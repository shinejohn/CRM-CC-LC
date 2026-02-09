import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronDown, Mail, Download, MoreVertical } from 'lucide-react';
export function ContactsListPage({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const contacts = [{
    id: 1,
    name: 'John Smith',
    role: 'VP Operations',
    account: 'Acme Corporation',
    email: 'john@acmecorp.com'
  }, {
    id: 2,
    name: 'Sarah Chen',
    role: 'Procurement Mgr',
    account: 'Acme Corporation',
    email: 'sarah.c@acmecorp.com'
  }, {
    id: 3,
    name: 'Mike Johnson',
    role: 'CEO',
    account: 'Beta Industries',
    email: 'mike@betaind.com'
  }, {
    id: 4,
    name: 'Lisa Park',
    role: 'Director',
    account: 'Gamma LLC',
    email: 'lisa@gammallc.com'
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
          <h1 className="text-2xl font-bold text-slate-900">👥 Contacts</h1>
          <p className="text-slate-500">Manage your business contacts</p>
        </div>
        <button onClick={() => onNavigate('contact-add')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Contact
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search contacts..." className="bg-transparent outline-none text-sm flex-1" />
            </div>
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
              Account <ChevronDown className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
              Role <ChevronDown className="w-4 h-4" />
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
              <th className="px-6 py-3 text-left w-10">
                <input type="checkbox" className="w-4 h-4 rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map(contact => <tr key={contact.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('contact-detail')}>
                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded" />
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">
                    {contact.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {contact.role}
                </td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium hover:underline">
                  {contact.account}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {contact.email}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1-4 of 312</p>
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