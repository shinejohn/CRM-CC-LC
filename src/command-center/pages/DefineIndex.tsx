import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Building2, ClipboardList, HelpCircle, Bot,
  ArrowRight, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

// TODO: wire to API — derive from actual profile data
const profileFields = [
  { name: 'Business Name', completed: true },
  { name: 'Description', completed: true },
  { name: 'Hours', completed: true },
  { name: 'Photos', completed: false },
  { name: 'Services/Menu', completed: true },
  { name: 'Contact Info', completed: true },
  { name: 'Social Links', completed: false },
  { name: 'Location', completed: true },
];

const completedCount = profileFields.filter((f) => f.completed).length;
const completionPercent = Math.round((completedCount / profileFields.length) * 100);

export function DefineIndex() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Define"
        subtitle="Establish your business identity — profile, survey, FAQ, and AI context"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile Completion */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Profile Completion" icon={Building2}
            headerAction={
              <button onClick={() => navigate('/command-center/define/profile')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                Edit Profile <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-[var(--nexus-text-primary)]">{completionPercent}%</span>
                  <span className="text-xs text-[var(--nexus-text-tertiary)]">{completedCount}/{profileFields.length} sections</span>
                </div>
                <div className="h-2.5 rounded-full bg-[var(--nexus-divider)]">
                  <div className="h-full rounded-full bg-[var(--nexus-accent-primary)] transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>

              {/* Field Checklist */}
              <div className="space-y-2">
                {profileFields.map((field) => (
                  <div key={field.name} className="flex items-center gap-2">
                    {field.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[var(--nexus-text-tertiary)] shrink-0" />
                    )}
                    <span className={`text-sm ${field.completed ? 'text-[var(--nexus-text-secondary)]' : 'text-[var(--nexus-text-primary)] font-medium'}`}>
                      {field.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>
        </motion.div>

        {/* Survey & FAQ */}
        <div className="space-y-5">
          {/* Survey Status */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <DataCard title="Business Survey" icon={ClipboardList}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">Survey not completed</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">Help us understand your business goals and challenges</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/command-center/define/survey')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
                >
                  Take Survey
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </DataCard>
          </motion.div>

          {/* FAQ Coverage */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <DataCard title="FAQ Coverage" icon={HelpCircle}
              headerAction={
                <button onClick={() => navigate('/command-center/define/faq')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                  Edit FAQs <ArrowRight className="w-3 h-3" />
                </button>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--nexus-text-secondary)]">FAQs created</span>
                  <span className="text-lg font-bold text-[var(--nexus-text-primary)]">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--nexus-text-secondary)]">Suggested gaps</span>
                  <span className="text-lg font-bold text-amber-500">2</span>
                </div>
                <p className="text-xs text-[var(--nexus-text-tertiary)]">Based on your industry, consider adding FAQs about pricing and service areas.</p>
              </div>
            </DataCard>
          </motion.div>
        </div>

        {/* AI Context Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <DataCard title="AI Context Status" icon={Bot} subtitle="The bridge between DEFINE and AUTOMATE — define your business so AI can represent you">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center">
                <Bot className="w-6 h-6 text-[var(--nexus-accent-primary)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--nexus-text-primary)]">AI Context File</p>
                <p className="text-xs text-[var(--nexus-text-secondary)]">
                  {completionPercent >= 80
                    ? 'Your profile is complete enough to generate an AI context file. AI employees will use this to represent your business.'
                    : `Complete your profile to ${completionPercent >= 50 ? '80%' : 'at least 80%'} to generate an AI context file.`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                completionPercent >= 80
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {completionPercent >= 80 ? 'Ready' : 'Needs Profile'}
              </span>
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
