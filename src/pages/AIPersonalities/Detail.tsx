import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  MessageCircle,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import {
  getPersonality,
  updatePersonality,
  deletePersonality,
  type AiPersonality,
} from '@/services/personalities/personality-api';

export const AIPersonalityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [personality, setPersonality] = useState<AiPersonality | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    identity: '',
    persona_description: '',
    communication_style: '',
    system_prompt: '',
    greeting_message: '',
    is_active: true,
    priority: 0,
  });

  useEffect(() => {
    if (id) {
      loadPersonality();
    }
  }, [id]);

  const loadPersonality = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getPersonality(id);
      setPersonality(data);
      setFormData({
        name: data.name,
        identity: data.identity,
        persona_description: data.persona_description,
        communication_style: data.communication_style,
        system_prompt: data.system_prompt,
        greeting_message: data.greeting_message || '',
        is_active: data.is_active,
        priority: data.priority,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personality');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    setError(null);
    try {
      await updatePersonality(id, formData);
      setSuccess(true);
      setIsEditing(false);
      loadPersonality();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update personality');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this personality?')) {
      return;
    }

    try {
      await deletePersonality(id);
      navigate('/ai-personalities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete personality');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!personality) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600">Personality not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/ai-personalities"
              className="text-gray-600 hover:text-gray-900 inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{personality.name}</h1>
              <p className="text-gray-600 mt-1">{personality.identity}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </>
            )}
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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">Personality updated successfully</p>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mb-6">
          {personality.is_active ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Inactive
            </span>
          )}
        </div>

        {/* Contact Capabilities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Capabilities</h2>
          <div className="flex items-center space-x-4">
            {personality.can_email && (
              <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </div>
            )}
            {personality.can_call && (
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </div>
            )}
            {personality.can_sms && (
              <div className="flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </div>
            )}
            {personality.can_chat && (
              <div className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Persona Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Persona Description</h2>
            {isEditing ? (
              <textarea
                value={formData.persona_description}
                onChange={(e) => setFormData({ ...formData, persona_description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{personality.persona_description}</p>
            )}
          </div>

          {/* Communication Style */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Style</h2>
            {isEditing ? (
              <textarea
                value={formData.communication_style}
                onChange={(e) => setFormData({ ...formData, communication_style: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{personality.communication_style}</p>
            )}
          </div>

          {/* System Prompt */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Prompt</h2>
            {isEditing ? (
              <textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
            ) : (
              <pre className="text-gray-700 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                {personality.system_prompt}
              </pre>
            )}
          </div>

          {/* Greeting Message */}
          {personality.greeting_message && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Greeting Message</h2>
              {isEditing ? (
                <textarea
                  value={formData.greeting_message}
                  onChange={(e) => setFormData({ ...formData, greeting_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{personality.greeting_message}</p>
              )}
            </div>
          )}

          {/* Traits & Expertise */}
          {(personality.traits || personality.expertise_areas) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personality.traits && personality.traits.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Traits</h2>
                  <div className="flex flex-wrap gap-2">
                    {personality.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {personality.expertise_areas && personality.expertise_areas.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise Areas</h2>
                  <div className="flex flex-wrap gap-2">
                    {personality.expertise_areas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
