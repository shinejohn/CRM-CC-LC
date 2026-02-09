import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, CheckCircle, AlertCircle, Sparkles, Upload, Image as ImageIcon, Lightbulb, TrendingUp, Eye, Save, Wand2, Type, Link as LinkIcon } from 'lucide-react';
interface ContentCreationFlowProps {
  contentType: string;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}
type CreationStep = 'slot-selection' | 'method-selection' | 'content-form' | 'scheduling';
export function ContentCreationFlow({
  contentType,
  onNavigate,
  onBack
}: ContentCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState<CreationStep>('slot-selection');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [creationMethod, setCreationMethod] = useState<'new' | 'library' | 'ai' | null>(null);
  const [formData, setFormData] = useState({
    format: 'medium-rectangle',
    headline: '',
    url: '',
    altText: '',
    announcementType: '',
    body: '',
    articleTitle: '',
    articleSubtitle: '',
    articleBody: ''
  });
  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'ad':
        return 'AD';
      case 'announcement':
        return 'ANNOUNCEMENT';
      case 'expert-article':
        return 'EXPERT ARTICLE';
      default:
        return contentType.toUpperCase();
    }
  };
  const handleSlotSelect = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setCurrentStep('method-selection');
  };
  const handleMethodSelect = (method: 'new' | 'library' | 'ai') => {
    setCreationMethod(method);
    setCurrentStep('content-form');
  };
  return <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              CREATE: {getContentTypeLabel()}
              {selectedSlot && ` - Slot ${selectedSlot}`}
            </h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Slot Selection */}
          {currentStep === 'slot-selection' && contentType === 'ad' && <motion.div key="slot-selection" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Which ad slot are you creating for?
                </h2>

                <div className="space-y-4">
                  {/* Slot 1 - Filled */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 bg-slate-50">
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">
                          SLOT 1: January 1-15
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-slate-700">
                            "Winter Sale Banner" is live
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          Performance: 1,245 impressions • 32 clicks • 2.6% CTR
                        </p>
                        <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                          Replace Current
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Slot 2 - Empty (Recommended) */}
                  <button onClick={() => handleSlotSelect(2)} className="w-full border-2 border-blue-300 rounded-xl p-6 bg-blue-50 hover:bg-blue-100 transition-colors text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-600 mt-1 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">
                            SLOT 2: January 16-31
                          </h3>
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                            RECOMMENDED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-slate-700">
                            Empty - Needs content by Jan 15
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          If not created: System will use library suggestion
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
                          Create for This Slot
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Coming Up */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          💡 COMING UP: February Slots
                        </h4>
                        <p className="text-sm text-slate-700 mb-3">
                          Want to get ahead? You can create February content
                          now.
                        </p>
                        <button className="px-4 py-2 bg-white border-2 border-purple-300 hover:border-purple-400 text-purple-900 rounded-lg font-medium text-sm transition-colors">
                          Plan February Content
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}

          {/* Step 2: Creation Method Selection */}
          {currentStep === 'method-selection' && <motion.div key="method-selection" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  How would you like to create your {contentType}?
                </h2>

                <div className="space-y-4">
                  {/* Create New */}
                  <button onClick={() => handleMethodSelect('new')} className="w-full border-2 border-slate-200 rounded-xl p-6 hover:border-[#1E3A5F] hover:bg-slate-50 transition-all text-left">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Wand2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">
                          🎨 CREATE NEW
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          Start fresh with our {contentType} builder
                        </p>
                        <ul className="text-sm text-slate-600 space-y-1 mb-4">
                          <li>• Upload your own creative</li>
                          <li>• Use our design templates</li>
                          <li>• Get AI-generated suggestions</li>
                        </ul>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg font-medium text-sm">
                          Start Fresh
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Use from Library */}
                  <button onClick={() => handleMethodSelect('library')} className="w-full border-2 border-slate-200 rounded-xl p-6 hover:border-[#1E3A5F] hover:bg-slate-50 transition-all text-left">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">
                          📚 USE FROM LIBRARY
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          Reuse or adapt previous content
                        </p>

                        <div className="mb-4">
                          <p className="text-xs font-medium text-slate-500 mb-2">
                            Recent Ads:
                          </p>
                          <div className="flex gap-3">
                            {['Winter Sale', 'Holiday Special', 'Fall Promo'].map((name, i) => <div key={i} className="flex-1 bg-slate-100 rounded-lg p-3 border border-slate-200">
                                <div className="aspect-video bg-slate-200 rounded mb-2 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-xs font-medium text-slate-900 mb-1">
                                  {name}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {(2.6 - i * 0.4).toFixed(1)}% CTR
                                </p>
                              </div>)}
                          </div>
                        </div>

                        <button className="px-4 py-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium text-sm transition-colors">
                          Browse Full Library
                        </button>
                      </div>
                    </div>
                  </button>

                  {/* AI Suggestion */}
                  <button onClick={() => handleMethodSelect('ai')} className="w-full border-2 border-blue-300 rounded-xl p-6 bg-blue-50 hover:bg-blue-100 transition-all text-left">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">
                            🤖 AI SUGGESTION
                          </h3>
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          Based on your past performance and current trends
                        </p>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                          <p className="text-sm font-medium text-slate-900 mb-2">
                            We suggest adapting "Winter Sale Banner" with:
                          </p>
                          <ul className="text-sm text-slate-700 space-y-1">
                            <li>• Updated dates (Jan 16-31)</li>
                            <li>
                              • New headline: "Winter Clearance - Final Days!"
                            </li>
                            <li>• Same successful design (2.6% CTR)</li>
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-white border-2 border-blue-300 hover:border-blue-400 text-blue-900 rounded-lg font-medium text-sm transition-colors">
                            Preview Suggestion
                          </button>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                            Use This Suggestion
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>}

          {/* Step 3: Content Form */}
          {currentStep === 'content-form' && <motion.div key="content-form" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="space-y-6">
              {contentType === 'ad' && <AdCreationForm formData={formData} setFormData={setFormData} />}
              {contentType === 'announcement' && <AnnouncementCreationForm formData={formData} setFormData={setFormData} />}
              {contentType === 'expert-article' && <ExpertArticleCreationForm formData={formData} setFormData={setFormData} />}
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}
// Ad Creation Form Component
function AdCreationForm({
  formData,
  setFormData
}: any) {
  return <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Design Your Ad
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1E3A5F] rounded-full" style={{
            width: '33%'
          }} />
          </div>
          <span className="text-sm font-medium text-slate-600">
            Step 1 of 3
          </span>
        </div>
      </div>

      {/* Ad Format */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-3">
          AD FORMAT
        </label>
        <div className="space-y-2">
          {[{
          id: 'standard-banner',
          label: 'Standard Banner (728x90)'
        }, {
          id: 'medium-rectangle',
          label: 'Medium Rectangle (300x250)',
          recommended: true
        }, {
          id: 'large-rectangle',
          label: 'Large Rectangle (336x280)'
        }, {
          id: 'leaderboard',
          label: 'Leaderboard (970x250)'
        }].map(format => <button key={format.id} onClick={() => setFormData({
          ...formData,
          format: format.id
        })} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${formData.format === format.id ? 'border-[#1E3A5F] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.format === format.id ? 'border-[#1E3A5F] bg-[#1E3A5F]' : 'border-slate-300'}`}>
                    {formData.format === format.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-medium text-slate-900">
                    {format.label}
                  </span>
                </div>
                {format.recommended && <span className="text-xs text-blue-600 font-medium">
                    ← Recommended for your goals
                  </span>}
              </div>
            </button>)}
        </div>
      </div>

      {/* Creative Upload */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-3">
          CREATIVE
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-[#1E3A5F] transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-medium mb-2">
            Drag & drop your image here
          </p>
          <p className="text-sm text-slate-500 mb-4">or click to upload</p>
          <p className="text-xs text-slate-500">
            Recommended: 300x250px, JPG/PNG
            <br />
            Max file size: 150KB
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="rounded" />I need help creating my
            ad (+$50 design service)
          </label>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Use a template [Browse Templates]
          </button>
        </div>
      </div>

      {/* Ad Details */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Headline (optional, for text overlay)
          </label>
          <input type="text" value={formData.headline} onChange={e => setFormData({
          ...formData,
          headline: e.target.value
        })} placeholder="Winter Clearance - Up to 50% Off!" className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Click-Through URL*
          </label>
          <input type="url" value={formData.url} onChange={e => setFormData({
          ...formData,
          url: e.target.value
        })} placeholder="https://myrestaurant.com/specials" className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Alt Text (for accessibility)
          </label>
          <input type="text" value={formData.altText} onChange={e => setFormData({
          ...formData,
          altText: e.target.value
        })} placeholder="Winter sale promotion banner for Tony's Restaurant" className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button className="px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <button className="px-6 py-3 bg-[#1E3A5F] hover:bg-[#152d4a] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>;
}
// Announcement Creation Form Component
function AnnouncementCreationForm({
  formData,
  setFormData
}: any) {
  const announcementTypes = [{
    id: 'grand-opening',
    label: '🎉 Grand Opening'
  }, {
    id: 'new-product',
    label: '🆕 New Product'
  }, {
    id: 'award',
    label: '🏆 Award'
  }, {
    id: 'general',
    label: '📢 General'
  }, {
    id: 'special-promo',
    label: '🎯 Special Promo'
  }, {
    id: 'hiring',
    label: '👥 Hiring'
  }, {
    id: 'milestone',
    label: '🎊 Milestone'
  }, {
    id: 'partnership',
    label: '🤝 Partnership'
  }];
  return <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Create Your Announcement
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1E3A5F] rounded-full" style={{
            width: '66%'
          }} />
          </div>
          <span className="text-sm font-medium text-slate-600">
            Step 2 of 3
          </span>
        </div>
      </div>

      {/* Announcement Type */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-3">
          ANNOUNCEMENT TYPE
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {announcementTypes.map(type => <button key={type.id} onClick={() => setFormData({
          ...formData,
          announcementType: type.id
        })} className={`p-4 rounded-lg border-2 transition-all text-center ${formData.announcementType === type.id ? 'border-[#1E3A5F] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="text-sm font-medium text-slate-900">
                {type.label}
              </span>
            </button>)}
        </div>
      </div>

      {/* Headline */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          HEADLINE*
        </label>
        <input type="text" value={formData.headline} onChange={e => setFormData({
        ...formData,
        headline: e.target.value
      })} placeholder="Tony's Italian Celebrates 25 Years in Springfield!" maxLength={100} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
        <p className="text-xs text-slate-500 mt-1">
          {formData.headline.length}/100 characters
        </p>
      </div>

      {/* Body */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          ANNOUNCEMENT BODY*
        </label>
        <textarea value={formData.body} onChange={e => setFormData({
        ...formData,
        body: e.target.value
      })} placeholder="This February marks 25 incredible years of serving the Springfield community..." rows={8} maxLength={750} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none resize-none" />
        <p className="text-xs text-slate-500 mt-1">
          {formData.body.length}/750 characters
        </p>

        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Improve with AI
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            Check Grammar
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            Make Shorter
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          IMAGE (Optional but recommended - 3x more engagement)
        </label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <button className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#152d4a] text-white rounded-lg font-medium text-sm transition-colors mb-2">
              Upload Image
            </button>
            <p className="text-xs text-slate-500">JPG or PNG, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Link */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          LINK (Optional)
        </label>
        <input type="url" value={formData.url} onChange={e => setFormData({
        ...formData,
        url: e.target.value
      })} placeholder="https://tonysitalian.com/25years" className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button className="px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <button className="px-6 py-3 bg-[#1E3A5F] hover:bg-[#152d4a] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>;
}
// Expert Article Creation Form Component
function ExpertArticleCreationForm({
  formData,
  setFormData
}: any) {
  const topicSuggestions = ['The Secret to Perfect Homemade Pasta (Trending)', '5 Italian Wines Perfect for Winter', "Planning the Perfect Valentine's Dinner at Home", 'Behind the Scenes: How We Source Our Ingredients'];
  return <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Write Your Expertise Article
        </h2>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>
              You are the Community Expert for: ITALIAN RESTAURANT
            </strong>
            <br />
            This article establishes you as THE authority in your category
          </p>
        </div>
      </div>

      {/* Topic Suggestions */}
      <div className="mb-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-3">
                💡 TOPIC SUGGESTIONS BASED ON TRENDS
              </h3>
              <ul className="space-y-2 mb-4">
                {topicSuggestions.map((suggestion, i) => <li key={i} className="text-sm text-slate-700">
                    • {suggestion}
                  </li>)}
              </ul>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                Use a Suggestion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Title */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          ARTICLE TITLE*
        </label>
        <input type="text" value={formData.articleTitle} onChange={e => setFormData({
        ...formData,
        articleTitle: e.target.value
      })} placeholder="The Secret to Perfect Homemade Pasta: Tips from a Chef" className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
      </div>

      {/* Subtitle */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          SUBTITLE (Optional)
        </label>
        <input type="text" value={formData.articleSubtitle} onChange={e => setFormData({
        ...formData,
        articleSubtitle: e.target.value
      })} placeholder="25 years of pasta-making wisdom in one simple guide" className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none" />
      </div>

      {/* Article Body */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          ARTICLE BODY*
        </label>
        <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1">
            <button className="p-2 hover:bg-slate-200 rounded" title="Bold">
              <Type className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-200 rounded" title="Italic">
              <Type className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-200 rounded" title="Link">
              <LinkIcon className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-200 rounded" title="Image">
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          <textarea value={formData.articleBody} onChange={e => setFormData({
          ...formData,
          articleBody: e.target.value
        })} placeholder="There's something magical about fresh pasta. After 25 years of making pasta at Tony's Italian, I've learned that the difference between good pasta and great pasta comes down to a few simple principles..." rows={12} className="w-full px-4 py-3 focus:outline-none resize-none" />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {formData.articleBody.length}/3,000 characters (minimum 800)
        </p>

        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Writing Assistant
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            Expand This Section
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            Add Tips
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          FEATURED IMAGE*
        </label>
        <div className="flex items-center gap-4">
          <div className="w-48 h-32 bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <button className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#152d4a] text-white rounded-lg font-medium text-sm transition-colors mb-2">
              Upload Image
            </button>
            <p className="text-xs text-slate-500">
              Recommended: 1200x630px
              <br />
              This will be the article thumbnail
            </p>
          </div>
        </div>
      </div>

      {/* Author Bio */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          AUTHOR BIO (Auto-filled from profile, editable)
        </label>
        <textarea rows={3} defaultValue="Chef Tony Russo has been crafting authentic Italian cuisine in Springfield for 25 years. As the Community Expert for Italian dining, he shares his culinary wisdom..." className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[#1E3A5F] focus:outline-none resize-none" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button className="px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
        <button className="px-6 py-3 bg-[#1E3A5F] hover:bg-[#152d4a] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>;
}