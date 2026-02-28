import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Newspaper, Mail, Share2, TrendingUp, Sparkles, CheckCircle, ChevronRight, Save } from 'lucide-react';
interface ContentSchedulingProps {
  contentType: string;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}
export function ContentScheduling({
  contentType,
  onNavigate,
  onBack
}: ContentSchedulingProps) {
  const [startDate, setStartDate] = useState('2026-01-16');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [timingMode, setTimingMode] = useState<'continuous' | 'specific' | 'days'>('specific');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedPublications] = useState(['day-news', 'downtown-guide', 'go-event-city', 'alphasite']);
  const [selectedCommunities, setSelectedCommunities] = useState(['springfield']);
  const [addOns, setAddOns] = useState({
    emailNewsletter: false,
    socialBoost: false,
    priorityPlacement: false
  });
  const publications = [{
    id: 'day-news',
    name: 'Day News',
    readers: '45,000+'
  }, {
    id: 'downtown-guide',
    name: 'Downtown Guide',
    readers: '25,000+ local shoppers'
  }, {
    id: 'go-event-city',
    name: 'Go Event City',
    readers: '30,000+ event seekers'
  }, {
    id: 'alphasite',
    name: 'Alphasite',
    readers: 'B2B professionals'
  }];
  const additionalCommunities = [{
    id: 'riverside',
    name: 'Riverside',
    price: 50,
    discountedPrice: 37.5,
    readers: '12,000'
  }, {
    id: 'oak-park',
    name: 'Oak Park',
    price: 50,
    discountedPrice: 37.5,
    readers: '8,500'
  }, {
    id: 'lakewood',
    name: 'Lakewood',
    price: 50,
    discountedPrice: 37.5,
    readers: '15,000'
  }];
  const expansionOptions = [{
    id: 'county-wide',
    name: 'County-Wide',
    price: 150,
    discountedPrice: 112.5,
    readers: '85,000'
  }, {
    id: 'state-wide',
    name: 'State-Wide',
    price: 400,
    discountedPrice: 300,
    readers: '450,000'
  }];
  const addOnOptions = [{
    id: 'emailNewsletter',
    name: 'Email Newsletter Feature',
    price: 50,
    discountedPrice: 37.5,
    description: 'Featured in weekly newsletter to 12,000+ subscribers'
  }, {
    id: 'socialBoost',
    name: 'Social Media Boost',
    price: 40,
    discountedPrice: 30,
    description: 'Posted to our social channels (8,500+ followers)'
  }, {
    id: 'priorityPlacement',
    name: 'Priority Placement',
    price: 25,
    discountedPrice: 18.75,
    description: 'Appear at top of ad rotation for the period'
  }];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };
  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev => prev.includes(communityId) ? prev.filter(c => c !== communityId) : [...prev, communityId]);
  };
  const toggleAddOn = (addOnId: keyof typeof addOns) => {
    setAddOns(prev => ({
      ...prev,
      [addOnId]: !prev[addOnId]
    }));
  };
  const calculateAdditionalCost = () => {
    let total = 0;
    // Additional communities
    additionalCommunities.forEach(community => {
      if (selectedCommunities.includes(community.id)) {
        total += community.discountedPrice;
      }
    });
    // Expansion options
    expansionOptions.forEach(option => {
      if (selectedCommunities.includes(option.id)) {
        total += option.discountedPrice;
      }
    });
    // Add-ons
    addOnOptions.forEach(option => {
      if (addOns[option.id as keyof typeof addOns]) {
        total += option.discountedPrice;
      }
    });
    return total;
  };
  return <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">
              SCHEDULE: {contentType.toUpperCase()} - Slot 2
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Schedule Your Content
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[color:var(--nexus-1e3a5f)] rounded-full" style={{
                width: '100%'
              }} />
              </div>
              <span className="text-sm font-medium text-slate-600">
                Step 3 of 3
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Timing */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">TIMING</h3>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                This content is for: <strong>Slot 2 (January 16-31)</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[color:var(--nexus-1e3a5f)] focus:outline-none" />
                  <Calendar className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[color:var(--nexus-1e3a5f)] focus:outline-none" />
                  <Calendar className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => setTimingMode('continuous')} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${timingMode === 'continuous' ? 'border-[color:var(--nexus-1e3a5f)] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${timingMode === 'continuous' ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]' : 'border-slate-300'}`}>
                    {timingMode === 'continuous' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-medium text-slate-900">
                    Run continuously until next slot
                  </span>
                </div>
              </button>

              <button onClick={() => setTimingMode('specific')} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${timingMode === 'specific' ? 'border-[color:var(--nexus-1e3a5f)] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${timingMode === 'specific' ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]' : 'border-slate-300'}`}>
                    {timingMode === 'specific' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-medium text-slate-900">
                    Run for specific dates only
                  </span>
                </div>
              </button>

              <button onClick={() => setTimingMode('days')} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${timingMode === 'days' ? 'border-[color:var(--nexus-1e3a5f)] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${timingMode === 'days' ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]' : 'border-slate-300'}`}>
                    {timingMode === 'days' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900 block mb-2">
                      Run on specific days (select below)
                    </span>
                    {timingMode === 'days' && <div className="flex gap-2">
                        {days.map(day => <button key={day} onClick={e => {
                      e.stopPropagation();
                      toggleDay(day);
                    }} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedDays.includes(day) ? 'bg-[color:var(--nexus-1e3a5f)] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
                            {day}
                          </button>)}
                      </div>}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Publications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              PUBLICATIONS
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Your package includes all 4 publications:
            </p>

            <div className="space-y-3">
              {publications.map(pub => <div key={pub.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-slate-900">{pub.name}</p>
                      <p className="text-sm text-slate-600">
                        {pub.readers} readers
                      </p>
                    </div>
                  </div>
                  <Newspaper className="w-5 h-5 text-emerald-600" />
                </div>)}
            </div>
          </div>

          {/* Communities */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              COMMUNITIES
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Your package covers: Springfield
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-slate-900">
                    Springfield (included)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <h4 className="font-bold text-slate-900">
                  📍 EXPAND YOUR REACH
                </h4>
              </div>

              <p className="text-sm text-slate-700 mb-4">
                Add more communities to this content:
              </p>

              <div className="space-y-2 mb-4">
                {additionalCommunities.map(community => <label key={community.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedCommunities.includes(community.id)} onChange={() => toggleCommunity(community.id)} className="w-4 h-4 rounded" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {community.name} (+${community.price}/month)
                        </p>
                        <p className="text-xs text-slate-600">
                          {community.readers} readers
                        </p>
                      </div>
                    </div>
                  </label>)}
              </div>

              <p className="text-sm font-medium text-slate-900 mb-3">
                Or expand further:
              </p>

              <div className="space-y-2 mb-4">
                {expansionOptions.map(option => <label key={option.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedCommunities.includes(option.id)} onChange={() => toggleCommunity(option.id)} className="w-4 h-4 rounded" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {option.name} (+${option.price}/month)
                        </p>
                        <p className="text-xs text-slate-600">
                          {option.readers} readers
                        </p>
                      </div>
                    </div>
                  </label>)}
              </div>

              <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    💡 Package holders save 25% on geographic expansion!
                    <br />
                    <strong>Your price: $37.50/community instead of $50</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Boost Your Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              BOOST YOUR CONTENT (Optional Add-Ons)
            </h3>

            <div className="space-y-3">
              {addOnOptions.map(option => <label key={option.id} className={`flex items-start justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${addOns[option.id as keyof typeof addOns] ? 'border-[color:var(--nexus-1e3a5f)] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-start gap-3 flex-1">
                    <input type="checkbox" checked={addOns[option.id as keyof typeof addOns]} onChange={() => toggleAddOn(option.id as keyof typeof addOns)} className="w-5 h-5 rounded mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-900">
                          {option.name}
                        </p>
                        <span className="text-sm text-slate-500 line-through">
                          +${option.price}
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          → ${option.discountedPrice} (25% off)
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>)}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-300 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">SUMMARY</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Content:</span>
                <span className="font-medium text-slate-900">
                  Winter Clearance Ad (Slot 2)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Running:</span>
                <span className="font-medium text-slate-900">
                  January 16-31, 2026
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Publications:</span>
                <span className="font-medium text-slate-900">
                  Day News, Downtown Guide, GEC, Alphasite
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Communities:</span>
                <span className="font-medium text-slate-900">
                  {selectedCommunities.map(id => {
                  if (id === 'springfield') return 'Springfield';
                  const community = [...additionalCommunities, ...expansionOptions].find(c => c.id === id);
                  return community?.name;
                }).filter(Boolean).join(', ')}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-300 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Base Cost:</span>
                <span className="font-medium text-slate-900">
                  $0.00 (included in package)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Add-Ons:</span>
                <span className="font-medium text-slate-900">
                  ${calculateAdditionalCost().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-300">
                <span className="text-slate-900">Total Additional Cost:</span>
                <span className="text-[color:var(--nexus-1e3a5f)]">
                  ${calculateAdditionalCost().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <button className="px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all flex items-center gap-2">
              Schedule & Publish
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>;
}