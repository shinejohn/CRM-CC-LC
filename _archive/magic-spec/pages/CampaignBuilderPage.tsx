import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, Bold, Italic, Underline, Link, Image, Layout, Type, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
async function createEmailCampaign(payload: {
  name: string;
  subject: string;
  message: string;
  scheduled_at?: string;
  recipient_segments?: Record<string, unknown>;
}) {
  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('tenant_id');
  const res = await fetch(`${API_BASE}/outbound/email/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(tenantId && { 'X-Tenant-ID': tenantId }),
    },
    body: JSON.stringify({
      ...payload,
      recipient_segments: payload.recipient_segments ?? { has_email: true },
    }),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || res.statusText);
  }
  return res.json();
}

export function CampaignBuilderPage({
  onBack
}: {
  onBack: () => void;
}) {
  const [step, setStep] = useState(2);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState(`Hi {{first_name}},

Happy New Year! 🎉

Here are our top tips for starting the year right:

1. Check your air filters
2. Inspect your water heater
3. Test smoke detectors

Need help? We're just a call away.

Best,
The Team`);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveDraft = async () => {
    if (!name.trim() || !subject.trim() || !message.trim()) {
      setSaveError('Campaign name, subject, and message are required.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await createEmailCampaign({ name: name.trim(), subject: subject.trim(), message });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleNextOrLaunch = () => {
    if (step === 4) {
      handleSaveDraft();
    } else {
      setStep((s) => Math.min(4, s + 1));
    }
  };

  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Communications
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={saving || !name.trim() || !subject.trim() || !message.trim()}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          📧 Create Email Campaign
        </h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Step {step} of 4: Design Email</span>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10" />
          <div className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -z-10 transition-all duration-500" style={{
          width: '33%'
        }} />

          {['Audience', 'Design', 'Schedule', 'Review'].map((label, i) => <div key={i} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i + 1 < step ? 'bg-blue-600 text-white' : i + 1 === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${i + 1 <= step ? 'text-blue-600' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>)}
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Campaign Details
        </h3>
        <div className="space-y-6">
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> Campaign saved successfully.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., January Newsletter"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject Line *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., New Year, New Home Tips"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preview Text
            </label>
            <input
              type="text"
              placeholder="Optional preview text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* AI Suggestions - wired when AI endpoint available */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-900 text-sm">
                AI Suggestions
              </span>
            </div>
            <p className="text-sm text-blue-800">Select a suggestion to apply as subject line.</p>
            <div className="space-y-2 mt-2">
              <button
                type="button"
                onClick={() => setSubject('5 Home Maintenance Tips for January')}
                className="w-full text-left p-2 hover:bg-blue-100 rounded transition-colors text-sm text-blue-800"
              >
                &quot;5 Home Maintenance Tips for January&quot;
              </button>
              <button
                type="button"
                onClick={() => setSubject('Your 2025 Home Care Checklist')}
                className="w-full text-left p-2 hover:bg-blue-100 rounded transition-colors text-sm text-blue-800"
              >
                &quot;Your 2025 Home Care Checklist&quot;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Email Content
          </h3>
          <div className="flex gap-3">
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
              <option>Newsletter Template</option>
              <option>Promotional Template</option>
              <option>Plain Text</option>
            </select>
            <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Image className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Layout className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600">
              <Type className="w-4 h-4" />
            </button>
            <div className="flex-1" />
            <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 hover:bg-blue-200 transition-colors">
              <Sparkles className="w-3 h-3" /> AI Write
            </button>
          </div>

          {/* Editor */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-96 p-6 focus:outline-none resize-none font-sans text-slate-700 leading-relaxed"
            placeholder="Enter your email content. Use {{first_name}} for personalization."
          />
        </div>
      </div>

      {/* Audience Summary - recipient count from API when wired */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
            Audience Summary
          </h3>
          <p className="text-slate-900 font-medium">
            Sending to: <span className="font-bold">Customers with email</span>
            {' '}(recipient count from segments)
          </p>
        </div>
        <button type="button" className="text-sm font-bold text-blue-600 hover:underline">
          Edit Audience
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => setStep(Math.max(1, step - 1))} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button
          onClick={handleNextOrLaunch}
          disabled={step === 4 && (saving || !name.trim() || !subject.trim() || !message.trim())}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {step === 4 ? (saving ? 'Creating...' : 'Create Campaign') : 'Next Step'}
        </button>
      </div>
    </motion.div>;
}