import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Edit, Trash2, Mail, Send, X, ArrowRight } from 'lucide-react';
export function TeamUsersPage({
  onBack
}: {
  onBack: () => void;
}) {
  const teamMembers = [{
    name: 'John Owner',
    email: 'john@abchome.com',
    role: 'Owner',
    status: 'active',
    lastLogin: 'Today, 10:30 AM',
    canEdit: false
  }, {
    name: 'Mike Manager',
    email: 'mike@abchome.com',
    role: 'Manager',
    status: 'active',
    lastLogin: 'Yesterday, 3:15 PM',
    canEdit: true
  }, {
    name: 'Sue Staff',
    email: 'sue@abchome.com',
    role: 'Staff',
    status: 'active',
    lastLogin: 'Dec 20, 2024',
    canEdit: true
  }];
  const pendingInvites = [{
    email: 'amy@abchome.com',
    role: 'Staff',
    invitedDate: 'Dec 26, 2024'
  }];
  const roles = [{
    name: 'Owner',
    description: 'Full access to everything including billing'
  }, {
    name: 'Manager',
    description: 'Can manage services, view performance, limited purchases'
  }, {
    name: 'Staff',
    description: 'Can use CRM, view dashboard, limited editing'
  }, {
    name: 'Viewer',
    description: 'Read-only access to dashboards and reports'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Settings
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">👥</span> Team & Users
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">
            Team Members ({teamMembers.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {teamMembers.map((member, index) => <motion.div key={index} initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.05
        }} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{member.name}</h4>
                    <p className="text-sm text-slate-500">{member.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Last login: {member.lastLogin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full mb-1">
                      {member.role}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {member.canEdit && <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>}
                  </div>
                </div>
              </div>
            </motion.div>)}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">
            Pending Invitations ({pendingInvites.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingInvites.map((invite, index) => <div key={index} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{invite.email}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Invited: {invite.invitedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full mb-1">
                      {invite.role}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pending
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1">
                      <Send className="w-3 h-3" /> Resend
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-1">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-900 mb-6">Roles & Permissions</h3>
        <div className="space-y-4">
          {roles.map((role, index) => <div key={index} className="flex items-start gap-3">
              <div className="min-w-[100px]">
                <span className="font-bold text-slate-900">{role.name}:</span>
              </div>
              <p className="text-slate-600 text-sm">{role.description}</p>
            </div>)}
        </div>
        <button className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View Full Permission Matrix <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>;
}