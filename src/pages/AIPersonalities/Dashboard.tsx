import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Users,
  Plus,
  RefreshCw,
  ArrowRight,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MessageCircle,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  listPersonalities,
  deletePersonality,
  type AiPersonality,
} from '@/services/personalities/personality-api';

export const AIPersonalitiesDashboardPage: React.FC = () => {
  const [personalities, setPersonalities] = useState<AiPersonality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPersonalities();
  }, []);

  const loadPersonalities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPersonalities();
      setPersonalities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personalities');
      console.error('Error loading personalities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this personality?')) {
      return;
    }

    try {
      await deletePersonality(id);
      loadPersonalities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete personality');
    }
  };

  if (loading && personalities.length === 0) {
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

  const activeCount = personalities.filter((p) => p.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Personalities</h1>
            <p className="text-gray-600 mt-1">Manage AI personalities for customer interactions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadPersonalities}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <Link
              to="/ai-personalities/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Personality
            </Link>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Personalities</p>
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{personalities.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active</p>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Inactive</p>
              <XCircle className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {personalities.length - activeCount}
            </p>
          </div>
        </div>

        {/* Personalities List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Personalities</h2>
          </div>
          <div className="overflow-x-auto">
            {personalities.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No personalities</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first AI personality.</p>
                <Link
                  to="/ai-personalities/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Personality
                </Link>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Identity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capabilities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personalities.map((personality) => (
                    <tr key={personality.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{personality.name}</div>
                          {personality.description && (
                            <div className="text-sm text-gray-500">{personality.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{personality.identity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {personality.can_email && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Email
                            </span>
                          )}
                          {personality.can_call && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Call
                            </span>
                          )}
                          {personality.can_sms && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              SMS
                            </span>
                          )}
                          {personality.can_chat && (
                            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                              Chat
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {personality.is_active ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {personality.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/ai-personalities/${personality.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                            title="View Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(personality.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
