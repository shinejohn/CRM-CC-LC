// ============================================
// Ops Layout - Admin operations dashboard shell
// ============================================

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Activity,
  MessageSquare,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/ops' },
  { id: 'metrics', label: 'Metrics Explorer', icon: BarChart3, path: '/ops/metrics' },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: '/ops/alerts' },
  { id: 'incidents', label: 'Incidents', icon: AlertCircle, path: '/ops/incidents' },
  { id: 'costs', label: 'Cost Tracker', icon: DollarSign, path: '/ops/costs' },
  { id: 'health', label: 'System Health', icon: Activity, path: '/ops/health' },
  { id: 'foa', label: 'FOA Chat', icon: MessageSquare, path: '/ops/foa' },
  { id: 'actions', label: 'Action Log', icon: ListChecks, path: '/ops/actions' },
];

export function OpsLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeId =
    navItems.find((i) => location.pathname.startsWith(i.path) && i.path !== '/ops')?.id ??
    (location.pathname === '/ops' ? 'dashboard' : 'dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <aside
        className={`flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <Link
            to="/ops"
            className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold"
          >
            <Activity className="w-6 h-6 text-indigo-600" />
            {!collapsed && <span>Operations</span>}
          </Link>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-slate-700">
          <Link
            to="/command-center"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Back to Command Center</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
