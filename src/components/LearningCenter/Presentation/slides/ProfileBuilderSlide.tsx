import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  Pencil,
  X,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Tag,
  FileText,
  Clock,
  Wrench,
} from 'lucide-react';
import { apiClient } from '@/services/api';

interface NotebookData {
  id: string;
  customer_id: string;
  purpose: string;
  status: string;
  data: Record<string, string | string[] | null>;
  field_log: Record<string, { source: string; source_detail?: string; updated_at?: string }>;
  completeness: number;
  committed_at: string | null;
}

interface ProfileBuilderSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
  onAction?: (action: string, payload: Record<string, unknown>) => void;
}

interface FieldDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  type: 'text' | 'email' | 'tel' | 'textarea';
  weight: number;
}

const PROFILE_FIELDS: FieldDef[] = [
  { key: 'business_name', label: 'Business Name', icon: <Building2 size={16} />, type: 'text', weight: 15 },
  { key: 'contact_name', label: 'Contact Name', icon: <User size={16} />, type: 'text', weight: 10 },
  { key: 'email', label: 'Email', icon: <Mail size={16} />, type: 'email', weight: 15 },
  { key: 'phone', label: 'Phone', icon: <Phone size={16} />, type: 'tel', weight: 10 },
  { key: 'address', label: 'Address', icon: <MapPin size={16} />, type: 'text', weight: 5 },
  { key: 'city', label: 'City', icon: <MapPin size={16} />, type: 'text', weight: 5 },
  { key: 'state', label: 'State', icon: <MapPin size={16} />, type: 'text', weight: 5 },
  { key: 'zip', label: 'ZIP Code', icon: <MapPin size={16} />, type: 'text', weight: 3 },
  { key: 'category', label: 'Business Category', icon: <Tag size={16} />, type: 'text', weight: 10 },
  { key: 'website', label: 'Website', icon: <Globe size={16} />, type: 'text', weight: 5 },
  { key: 'description', label: 'Description', icon: <FileText size={16} />, type: 'textarea', weight: 7 },
  { key: 'hours', label: 'Hours', icon: <Clock size={16} />, type: 'text', weight: 5 },
  { key: 'services', label: 'Services', icon: <Wrench size={16} />, type: 'text', weight: 5 },
];

function sourceLabel(source: string): string {
  switch (source) {
    case 'ai': return 'AI-collected';
    case 'user': return 'Verified';
    case 'form': return 'Form entry';
    case 'scrape': return 'Scraped';
    case 'import': return 'Imported';
    default: return source;
  }
}

function sourceBadgeClass(source: string): string {
  switch (source) {
    case 'user': return 'bg-green-100 text-green-700';
    case 'ai': return 'bg-blue-100 text-blue-700';
    case 'form': return 'bg-purple-100 text-purple-700';
    case 'scrape': return 'bg-amber-100 text-amber-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export const ProfileBuilderSlide: React.FC<ProfileBuilderSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
  onAction,
}) => {
  const themeColors = {
    blue: { gradient: 'from-blue-50 to-indigo-100', accent: 'bg-blue-600', ring: 'ring-blue-500', bar: 'bg-blue-500', hover: 'hover:bg-blue-50' },
    green: { gradient: 'from-emerald-50 to-teal-100', accent: 'bg-emerald-600', ring: 'ring-emerald-500', bar: 'bg-emerald-500', hover: 'hover:bg-emerald-50' },
    purple: { gradient: 'from-purple-50 to-pink-100', accent: 'bg-purple-600', ring: 'ring-purple-500', bar: 'bg-purple-500', hover: 'hover:bg-purple-50' },
    orange: { gradient: 'from-orange-50 to-red-100', accent: 'bg-orange-600', ring: 'ring-orange-500', bar: 'bg-orange-500', hover: 'hover:bg-orange-50' },
  };
  const t = themeColors[theme];

  const customerId = content.customer_id as string | undefined;
  const headline = (content.headline as string) ?? (content.title as string) ?? 'Your Business Profile';
  const subheadline = (content.subheadline as string) ?? 'Review and complete your profile. Fields highlighted in green have been verified.';

  const [notebook, setNotebook] = useState<NotebookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  // Load notebook data when slide becomes active
  useEffect(() => {
    if (!isActive || !customerId || notebook) return;
    setLoading(true);
    apiClient
      .get(`/sarah/notebooks/${customerId}`)
      .then((res) => {
        setNotebook(res.data.data as NotebookData);
        if ((res.data.data as NotebookData).status === 'approved') {
          setApproved(true);
        }
      })
      .catch(() => {
        setError('Could not load profile data.');
      })
      .finally(() => setLoading(false));
  }, [isActive, customerId, notebook]);

  const startEdit = useCallback((fieldKey: string) => {
    const current = notebook?.data[fieldKey];
    setEditingField(fieldKey);
    setEditValue(
      Array.isArray(current) ? current.join(', ') : (current ?? '')
    );
  }, [notebook]);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingField || !customerId) return;
    setSaving(true);
    try {
      const res = await apiClient.put(`/sarah/notebooks/${customerId}`, {
        fields: { [editingField]: editValue },
        source: 'user',
      });
      setNotebook((prev) =>
        prev
          ? {
              ...prev,
              data: (res.data.data as NotebookData).data,
              field_log: (res.data.data as NotebookData).field_log,
              completeness: (res.data.data as NotebookData).completeness,
              status: (res.data.data as NotebookData).status,
            }
          : null
      );
      setEditingField(null);
      setEditValue('');
      onAction?.('profile_field_updated', {
        field: editingField,
        value: editValue,
        customer_id: customerId,
      });
    } catch {
      setError('Failed to save field.');
    } finally {
      setSaving(false);
    }
  }, [editingField, editValue, customerId, onAction]);

  const handleApprove = useCallback(async () => {
    if (!customerId) return;
    setApproving(true);
    try {
      await apiClient.post(`/sarah/notebooks/${customerId}/approve`);
      setApproved(true);
      onAction?.('profile_approved', { customer_id: customerId });
    } catch {
      setError('Approval failed. Please try again.');
    } finally {
      setApproving(false);
    }
  }, [customerId, onAction]);

  const completeness = notebook?.completeness ?? 0;
  const data = notebook?.data ?? {};
  const fieldLog = notebook?.field_log ?? {};

  // Count filled vs total
  const filledCount = PROFILE_FIELDS.filter(
    (f) => data[f.key] != null && data[f.key] !== ''
  ).length;

  // If no customer_id configured, show a placeholder
  if (!customerId) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center p-8 bg-gradient-to-br ${t.gradient} ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      >
        <div className="text-center max-w-lg">
          <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{headline}</h2>
          <p className="text-gray-600">
            This profile will be populated as Sarah learns about your business through conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        w-full h-full flex items-start justify-center p-6 md:p-8 overflow-y-auto
        bg-gradient-to-br ${t.gradient}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{headline}</h2>
          <p className="text-gray-600 text-sm md:text-base">{subheadline}</p>
        </div>

        {/* Completeness bar */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">
              {filledCount} of {PROFILE_FIELDS.length} fields complete
            </span>
            <span className="font-bold text-gray-900">{Math.round(completeness)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full shadow-inner overflow-hidden">
            <div
              className={`h-full ${t.bar} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 rounded-lg border border-red-200" role="alert">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600" aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Approved banner */}
        {approved && (
          <div className="flex items-center gap-3 p-4 mb-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
            <ShieldCheck size={24} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Profile Approved</p>
              <p className="text-green-700 text-sm">This profile has been committed to your account.</p>
            </div>
          </div>
        )}

        {/* Field cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROFILE_FIELDS.map((field, idx) => {
              const value = data[field.key];
              const hasValue = value != null && value !== '';
              const log = fieldLog[field.key];
              const source = log?.source ?? '';
              const isEditing = editingField === field.key;

              return (
                <div
                  key={field.key}
                  className={`
                    group relative rounded-xl border p-4 transition-all duration-200
                    ${hasValue ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/60 border-dashed border-gray-300'}
                    ${!isEditing ? `${t.hover} cursor-pointer` : ''}
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${0.15 + idx * 0.03}s` }}
                  onClick={() => {
                    if (!isEditing && !approved) startEdit(field.key);
                  }}
                  role={!isEditing && !approved ? 'button' : undefined}
                  tabIndex={!isEditing && !approved ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!isEditing && !approved && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      startEdit(field.key);
                    }
                  }}
                  aria-label={`${field.label}: ${hasValue ? (Array.isArray(value) ? value.join(', ') : String(value)) : 'Not set'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {hasValue ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-gray-400">{field.icon}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{field.label}</span>
                        {source && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sourceBadgeClass(source)}`}>
                            {sourceLabel(source)}
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={2}
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${t.ring}`}
                              autoFocus
                              aria-label={`Edit ${field.label}`}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${t.ring}`}
                              autoFocus
                              aria-label={`Edit ${field.label}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveEdit();
                                }
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={saving}
                              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md ${t.accent} hover:opacity-90 disabled:opacity-50`}
                              aria-label="Save"
                            >
                              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                              aria-label="Cancel"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm truncate ${hasValue ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
                          {hasValue
                            ? (Array.isArray(value) ? value.join(', ') : String(value))
                            : 'Click to add'}
                        </p>
                      )}
                    </div>

                    {/* Edit pencil (visible on hover, hidden when editing or approved) */}
                    {!isEditing && !approved && hasValue && (
                      <Pencil size={14} className="flex-shrink-0 mt-1 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Approve button */}
        {!loading && !approved && completeness > 0 && (
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving || completeness < 30}
              className={`
                inline-flex items-center gap-2 px-8 py-3.5 text-white font-bold text-lg rounded-xl shadow-lg
                ${t.accent} hover:opacity-90 transition-opacity
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
              aria-label="Approve and commit profile"
            >
              {approving ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <ShieldCheck size={22} />
              )}
              {approving ? 'Approving...' : 'Approve Profile'}
            </button>
            {completeness < 30 && (
              <p className="text-xs text-gray-500 mt-2">
                Complete at least 30% of your profile before approving.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
