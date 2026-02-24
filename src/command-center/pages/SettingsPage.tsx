import { useState } from 'react';
import { Share2, AlertCircle, Save, Check } from 'lucide-react';

export function SettingsPage() {
  const [preferences, setPreferences] = useState({
    auto_post_announcements: true,
    auto_post_classifieds: true,
    auto_post_coupons: true,
    auto_post_events: true,
    post_to_daynews_social: true,
    post_to_goeventcity_social: true,
    broadcast_to_groups: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Social Auto-Post Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 max-w-2xl">
            When you publish paid commerce content (like Announcements, Classifieds, or Coupons),
            we can automatically create a social post in your feed to notify your followers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved' : 'Save Preferences'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Section 1: Auto-Post When I Publish */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Auto-Post When I Publish...</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Choose which content types you want syndicated to your social feeds.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            <ToggleRow
              label="Announcements"
              description="Great for engagement. E.g., birthdays, graduations, business milestones."
              enabled={preferences.auto_post_announcements}
              onToggle={() => handleToggle('auto_post_announcements')}
            />
            <ToggleRow
              label="Classified Listings"
              description="Share your marketplace listings with your social followers."
              enabled={preferences.auto_post_classifieds}
              onToggle={() => handleToggle('auto_post_classifieds')}
            />
            <ToggleRow
              label="Coupons & Deals"
              description="Help deals go viral by sharing them natively in social feeds."
              enabled={preferences.auto_post_coupons}
              onToggle={() => handleToggle('auto_post_coupons')}
            />
            <ToggleRow
              label="Events"
              description="Boost RSVP counts by broadcasting your upcoming events."
              enabled={preferences.auto_post_events}
              onToggle={() => handleToggle('auto_post_events')}
            />
          </div>
        </div>

        {/* Section 2: Post To */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Post To...</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Select the platforms where your auto-posts should appear.</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            <ToggleRow
              label="Day.News Social Feed"
              description="Your primary community feed."
              enabled={preferences.post_to_daynews_social}
              onToggle={() => handleToggle('post_to_daynews_social')}
            />
            <ToggleRow
              label="GoEventCity Social Feed"
              description="Your event and nightlife oriented feed."
              enabled={preferences.post_to_goeventcity_social}
              onToggle={() => handleToggle('post_to_goeventcity_social')}
            />
            <div className="px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Broadcast to My Community Groups</span>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  If enabled, your content will also be shared into relevant community groups you belong to.
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500 ml-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Use carefully to avoid spam.
                  </span>
                </p>
              </div>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${preferences.broadcast_to_groups ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                  }`}
                role="switch"
                aria-checked={preferences.broadcast_to_groups}
                onClick={() => handleToggle('broadcast_to_groups')}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.broadcast_to_groups ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onToggle }: { label: string, description: string, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
      <div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        {description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
          }`}
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  );
}

