import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ContentManagerDashboard,
  ContentLibrary,
  ContentCreationFlow,
  ContentScheduling,
  ContentTemplateLibrary,
} from '../modules/content';
import { LayoutDashboard, Library, Plus, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard, component: ContentManagerDashboard },
  { path: 'library', label: 'Library', icon: Library, component: ContentLibrary },
  { path: 'create', label: 'Create', icon: Plus, component: ContentCreationFlow },
  { path: 'scheduling', label: 'Scheduling', icon: Calendar, component: ContentScheduling },
  { path: 'templates', label: 'Templates', icon: FileText, component: ContentTemplateLibrary },
];

export default function ContentPage() {
  const location = useLocation();
  const path = location.pathname.replace(/\/command-center\/content\/?/, '') || '';
  const currentPath = path.split('/')[0] || '';
  const activeTab = tabs.find((t) => t.path === currentPath) ?? tabs[0];
  const ActiveComponent = activeTab.component;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={`/command-center/content${tab.path ? `/${tab.path}` : ''}`}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              (tab.path ? currentPath === tab.path : !currentPath)
                ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
}

