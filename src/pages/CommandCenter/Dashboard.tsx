import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { RefreshCw, AlertCircle } from 'lucide-react';
import {
  getPublishingDashboard,
  type PublishingDashboard,
} from '@/services/command-center/publishing-api';
import { operationsApi } from '@/services/operations/operations-api';
import type { OperationsDashboardSnapshot } from '@/types/operations';

import { StatsOverview } from './components/StatsOverview';
import { OperationsSnapshotSection } from './components/OperationsSnapshotSection';
import { QuickActions } from './components/QuickActions';
import { RecentActivity } from './components/RecentActivity';
import { ContentBreakdown } from './components/ContentBreakdown';

export const CommandCenterDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.permissions?.includes('ops:access');
  const [dashboard, setDashboard] = useState<PublishingDashboard | null>(null);
  const [operationsSnapshot, setOperationsSnapshot] = useState<OperationsDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationsError, setOperationsError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    setOperationsError(null);
    try {
      const [publishingData, operationsData] = await Promise.all([
        getPublishingDashboard(),
        operationsApi.getDashboardSnapshot(),
      ]);
      setDashboard(publishingData);
      setOperationsSnapshot(operationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Error loading dashboard:', err);
      try {
        const operationsData = await operationsApi.getDashboardSnapshot();
        setOperationsSnapshot(operationsData);
      } catch (opsErr) {
        setOperationsError(
          opsErr instanceof Error ? opsErr.message : 'Failed to load operations snapshot'
        );
        console.error('Error loading operations snapshot:', opsErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
            <p className="text-gray-600 mt-1">Content generation, ad creation, and publishing</p>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link
                to="/ops"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center"
              >
                Operations
              </Link>
            )}
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Sections */}
        <StatsOverview dashboard={dashboard} />
        <OperationsSnapshotSection snapshot={operationsSnapshot} error={operationsError} />
        <QuickActions />
        <RecentActivity dashboard={dashboard} />
        <ContentBreakdown dashboard={dashboard} />
        
      </div>
    </div>
  );
};
