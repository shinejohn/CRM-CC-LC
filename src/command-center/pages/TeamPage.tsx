import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

const tableColumns = ['Name', 'Role', 'Email', 'Last Active'];

export function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="Manage team members, roles, and permissions"
        icon={Users}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Team Member
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <DataCard title="Team Members" icon={Users}>
          <div className="space-y-4">
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-4 py-2 rounded-lg bg-[var(--nexus-bg-secondary)]">
              {tableColumns.map((col) => (
                <span
                  key={col}
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--nexus-text-tertiary)]"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[var(--nexus-text-tertiary)]" />
              </div>
              <p className="text-sm font-medium text-[var(--nexus-text-primary)] mb-1">
                No team members yet
              </p>
              <p className="text-xs text-[var(--nexus-text-tertiary)] max-w-sm mb-6">
                Invite your team to collaborate on campaigns, manage customers, and track performance together.
              </p>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Invite
              </button>
            </div>
          </div>
        </DataCard>
      </motion.div>

      {/* Roles overview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataCard title="Roles & Permissions" icon={Users}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { role: 'Owner', description: 'Full access to all settings and data', count: 1 },
              { role: 'Manager', description: 'Can manage team, campaigns, and billing', count: 0 },
              { role: 'Member', description: 'Can view data and manage assigned tasks', count: 0 },
            ].map((item) => (
              <div
                key={item.role}
                className="p-4 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                    {item.role}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] text-[var(--nexus-text-tertiary)]">
                    {item.count} {item.count === 1 ? 'user' : 'users'}
                  </span>
                </div>
                <p className="text-xs text-[var(--nexus-text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </DataCard>
      </motion.div>
    </div>
  );
}
