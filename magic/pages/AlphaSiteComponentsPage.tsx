import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Search, Globe, Code, Eye, Trash2, Send, Loader2, CheckCircle, Sparkles, Layout, Image as ImageIcon, Type, Mail, Phone, MapPin, Star, MessageSquare, Calendar, ShoppingCart, Users, BarChart, Settings, Copy, ExternalLink } from 'lucide-react';
interface AlphaSiteComponentsPageProps {
  onBack: () => void;
}
interface AlphaSiteComponent {
  id: string;
  name: string;
  description: string;
  status: 'generating' | 'ready' | 'deployed';
  category: string;
  createdAt: string;
  previewImage?: string;
}
interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  popular?: boolean;
}
const componentTemplates: ComponentTemplate[] = [{
  id: 'hero',
  name: 'Hero Section',
  description: 'Eye-catching header with CTA',
  category: 'Layout',
  icon: Layout,
  popular: true
}, {
  id: 'contact-form',
  name: 'Contact Form',
  description: 'Professional contact form with validation',
  category: 'Forms',
  icon: Mail,
  popular: true
}, {
  id: 'testimonials',
  name: 'Testimonials',
  description: 'Customer reviews and ratings',
  category: 'Social Proof',
  icon: MessageSquare,
  popular: true
}, {
  id: 'pricing-table',
  name: 'Pricing Table',
  description: 'Compare plans and features',
  category: 'Commerce',
  icon: ShoppingCart
}, {
  id: 'gallery',
  name: 'Image Gallery',
  description: 'Showcase your work',
  category: 'Media',
  icon: ImageIcon
}, {
  id: 'team',
  name: 'Team Section',
  description: 'Meet the team profiles',
  category: 'About',
  icon: Users
}, {
  id: 'stats',
  name: 'Statistics',
  description: 'Key metrics and achievements',
  category: 'Data',
  icon: BarChart
}, {
  id: 'cta',
  name: 'Call to Action',
  description: 'Conversion-focused CTA block',
  category: 'Marketing',
  icon: Sparkles
}, {
  id: 'faq',
  name: 'FAQ Section',
  description: 'Frequently asked questions',
  category: 'Support',
  icon: MessageSquare
}, {
  id: 'location',
  name: 'Location Map',
  description: 'Business location with map',
  category: 'Contact',
  icon: MapPin
}, {
  id: 'booking',
  name: 'Booking Widget',
  description: 'Schedule appointments',
  category: 'Commerce',
  icon: Calendar
}, {
  id: 'newsletter',
  name: 'Newsletter Signup',
  description: 'Email list builder',
  category: 'Marketing',
  icon: Mail
}];
export function AlphaSiteComponentsPage({
  onBack
}: AlphaSiteComponentsPageProps) {
  const [components, setComponents] = useState<AlphaSiteComponent[]>([{
    id: '1',
    name: 'Contact Form',
    description: 'Professional contact form with name, email, and message fields',
    status: 'deployed',
    category: 'Forms',
    createdAt: '2 days ago'
  }, {
    id: '2',
    name: 'Hero Section',
    description: 'Eye-catching hero with business tagline and CTA button',
    status: 'ready',
    category: 'Layout',
    createdAt: '1 day ago'
  }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewComponent, setPreviewComponent] = useState<AlphaSiteComponent | null>(null);
  const categories = ['all', 'Layout', 'Forms', 'Social Proof', 'Commerce', 'Media', 'About', 'Data', 'Marketing', 'Support', 'Contact'];
  const handleGenerateCustom = async () => {
    if (!customPrompt.trim() || components.length >= 3) return;
    setIsGenerating(true);
    const newComponent: AlphaSiteComponent = {
      id: Date.now().toString(),
      name: customPrompt.slice(0, 50),
      description: customPrompt,
      status: 'generating',
      category: 'Custom',
      createdAt: 'Just now'
    };
    setComponents([newComponent, ...components]);
    setCustomPrompt('');
    // Simulate AI generation
    setTimeout(() => {
      setComponents(prev => prev.map(comp => comp.id === newComponent.id ? {
        ...comp,
        status: 'ready'
      } : comp));
      setIsGenerating(false);
    }, 3000);
  };
  const handleGenerateFromTemplate = (template: ComponentTemplate) => {
    if (components.length >= 3) return;
    setIsGenerating(true);
    const newComponent: AlphaSiteComponent = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      status: 'generating',
      category: template.category,
      createdAt: 'Just now'
    };
    setComponents([newComponent, ...components]);
    setShowTemplates(false);
    setTimeout(() => {
      setComponents(prev => prev.map(comp => comp.id === newComponent.id ? {
        ...comp,
        status: 'ready'
      } : comp));
      setIsGenerating(false);
    }, 3000);
  };
  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
  };
  const handleDeployComponent = (id: string) => {
    setComponents(prev => prev.map(comp => comp.id === id ? {
      ...comp,
      status: 'deployed'
    } : comp));
  };
  const getStatusBadge = (status: AlphaSiteComponent['status']) => {
    switch (status) {
      case 'generating':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating
          </span>;
      case 'ready':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Ready
          </span>;
      case 'deployed':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            <Globe className="w-3.5 h-3.5" />
            Live
          </span>;
    }
  };
  const filteredTemplates = componentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Business Profile</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Globe className="w-7 h-7 text-emerald-600" />
                AlphaSite Components
              </h1>
              <p className="text-slate-600 mt-1">
                Build your website with AI-powered components
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
              <Code className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">
                {components.length}/3 Components
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Component Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 shadow-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Create New Component
              </h2>
              <p className="text-sm text-slate-400">
                Describe what you need or choose from templates
              </p>
            </div>
          </div>

          {/* Custom Prompt */}
          {!showTemplates && <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 mb-2">
                  <Sparkles className="inline h-4 w-4 text-emerald-400 mr-1" />
                  Describe your component:
                </p>
                <p className="text-xs text-slate-500">
                  Examples: "Add a testimonials section", "Create a pricing
                  table", "Build a team showcase"
                </p>
              </div>

              <div className="flex gap-3">
                <input type="text" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleGenerateCustom()} placeholder="Describe your component..." disabled={isGenerating || components.length >= 3} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" />
                <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={handleGenerateCustom} disabled={!customPrompt.trim() || isGenerating || components.length >= 3} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isGenerating ? <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating
                    </> : <>
                      <Send className="w-5 h-5" />
                      Generate
                    </>}
                </motion.button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-700"></div>
                <span className="text-sm text-slate-500">or</span>
                <div className="flex-1 h-px bg-slate-700"></div>
              </div>

              <button onClick={() => setShowTemplates(true)} disabled={components.length >= 3} className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Layout className="w-5 h-5" />
                Browse Component Templates
              </button>
            </div>}

          {/* Templates View */}
          {showTemplates && <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Component Templates
                </h3>
                <button onClick={() => setShowTemplates(false)} className="text-sm text-slate-400 hover:text-white transition-colors">
                  ← Back to custom
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search templates..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-emerald-500" />
                </div>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-emerald-500">
                  {categories.map(cat => <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>)}
                </select>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredTemplates.map(template => {
              const Icon = template.icon;
              return <motion.button key={template.id} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => handleGenerateFromTemplate(template)} disabled={components.length >= 3} className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed relative">
                      {template.popular && <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                          Popular
                        </div>}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-slate-700">
                          <Icon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">
                            {template.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 px-2 py-1 bg-slate-900 rounded">
                        {template.category}
                      </span>
                    </motion.button>;
            })}
              </div>
            </div>}

          {components.length >= 3 && <div className="mt-4 p-4 bg-amber-900/20 rounded-lg border border-amber-700">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-200 mb-1">
                    Component Limit Reached
                  </p>
                  <p className="text-xs text-amber-300">
                    You've created the maximum of 3 components. Delete a
                    component to create a new one.
                  </p>
                </div>
              </div>
            </div>}
        </motion.div>

        {/* Components List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Components</h2>

          {components.length === 0 ? <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
              <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                No components yet
              </h3>
              <p className="text-slate-600 mb-4">
                Create your first component to start building your AlphaSite
              </p>
            </div> : components.map((component, index) => <motion.div key={component.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {component.name}
                        </h3>
                        {getStatusBadge(component.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {component.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded">
                          {component.category}
                        </span>
                        <span>Created {component.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {component.status === 'ready' && <>
                        <button onClick={() => setPreviewComponent(component)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button onClick={() => handleDeployComponent(component.id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                          <Globe className="w-4 h-4" />
                          Deploy to AlphaSite
                        </button>
                      </>}
                    {component.status === 'deployed' && <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Live on AlphaSite
                      </button>}
                    <button onClick={() => handleDeleteComponent(component.id)} className="ml-auto p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>)}
        </div>

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Code className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">How it works</h3>
              <p className="text-sm text-blue-800">
                Components are automatically generated by AI and added to your
                AlphaSite. You can preview them before deploying. Once deployed,
                they'll appear on your public website.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewComponent && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setPreviewComponent(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div initial={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {previewComponent.name}
                    </h3>
                    <p className="text-sm text-slate-600">Component Preview</p>
                  </div>
                  <button onClick={() => setPreviewComponent(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="text-2xl text-slate-600">×</span>
                  </button>
                </div>

                <div className="p-8 bg-slate-50 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="bg-white rounded-lg border-2 border-slate-200 p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-2">
                        Component Preview
                      </h4>
                      <p className="text-slate-600 mb-6">
                        This is a preview of your {previewComponent.name}{' '}
                        component
                      </p>
                      <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600">
                          {previewComponent.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setPreviewComponent(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Close
                  </button>
                  <button onClick={() => {
                handleDeployComponent(previewComponent.id);
                setPreviewComponent(null);
              }} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Deploy to AlphaSite
                  </button>
                </div>
              </motion.div>
            </div>
          </>}
      </AnimatePresence>
    </div>;
}