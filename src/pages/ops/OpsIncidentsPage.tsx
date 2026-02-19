// ============================================
// Ops Incidents Page - Incident management
// Create/update lifecycle
// ============================================

import React, { useState } from 'react';
import {
  useOpsIncidents,
  useOpsCreateIncident,
  useOpsUpdateIncident,
} from '@/hooks/ops/useOpsIncidents';
import { OpsIncidentTimeline } from '@/components/ops/OpsIncidentTimeline';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Incident } from '@/types/operations';

export function OpsIncidentsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    severity: 'major' as Incident['severity'],
  });

  const { data, isLoading } = useOpsIncidents();
  const createMutation = useOpsCreateIncident();
  const updateMutation = useOpsUpdateIncident();

  const incidents = data?.data ?? [];

  const handleCreate = () => {
    if (!createForm.title.trim()) return;
    createMutation.mutate(
      {
        title: createForm.title,
        description: createForm.description || undefined,
        severity: createForm.severity,
        status: 'investigating',
      },
      {
        onSuccess: () => {
          setCreateForm({ title: '', description: '', severity: 'major' });
          setShowCreate(false);
        },
      }
    );
  };

  const handleStatusChange = (id: string, status: Incident['status']) => {
    updateMutation.mutate({ id, payload: { status } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Incidents
        </h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Incident
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create Incident
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Brief incident title"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional details"
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                value={createForm.severity}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    severity: e.target.value as Incident['severity'],
                  }))
                }
                className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!createForm.title.trim() || createMutation.isPending}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <p className="text-gray-500">No incidents.</p>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === inc.id ? null : inc.id)
                }
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{inc.incidentNumber} {inc.title}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {inc.severity} · {inc.status}
                  </p>
                </div>
                {expandedId === inc.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
              {expandedId === inc.id && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                  <OpsIncidentTimeline incident={inc} />
                  <div className="mt-4 flex gap-2">
                    {inc.status !== 'resolved' && inc.status !== 'postmortem' && (
                      <>
                        {inc.status !== 'identified' && (
                          <button
                            onClick={() =>
                              handleStatusChange(inc.id, 'identified')
                            }
                            className="px-3 py-1.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 text-sm"
                          >
                            Mark Identified
                          </button>
                        )}
                        {inc.status !== 'resolved' && (
                          <button
                            onClick={() =>
                              handleStatusChange(inc.id, 'resolved')
                            }
                            className="px-3 py-1.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 text-sm"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
