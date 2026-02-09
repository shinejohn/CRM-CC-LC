import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Presentation, Sparkles, TrendingUp, Clock, DollarSign, Search, Filter, Plus, Play, Edit, Copy, Archive, BarChart3, Users, Zap } from 'lucide-react';
interface Template {
  id: string;
  name: string;
  type: 'full-presentation' | 'single-exhibit' | 'dynamic';
  category: string;
  description: string;
  slideCount: number;
  usageCount: number;
  completionRate: number;
  avgEngagementTime: number;
  costSavings: number;
  narrationCached: boolean;
  createdBy: 'ai' | 'human';
  lastUsed: Date;
  thumbnail: string;
}
export function TemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const categories = [{
    id: 'all',
    label: 'All Templates',
    icon: FileText
  }, {
    id: 'onboarding',
    label: 'Onboarding',
    icon: Users
  }, {
    id: 'discovery',
    label: 'Discovery',
    icon: Search
  }, {
    id: 'proposal',
    label: 'Proposals',
    icon: Presentation
  }, {
    id: 'education',
    label: 'Education',
    icon: Sparkles
  }, {
    id: 'data-collection',
    label: 'Data Collection',
    icon: BarChart3
  }];
  const templates: Template[] = [{
    id: '1',
    name: 'Healthcare Industry Discovery',
    type: 'full-presentation',
    category: 'discovery',
    description: 'Comprehensive discovery presentation for healthcare clients with compliance focus',
    slideCount: 12,
    usageCount: 47,
    completionRate: 89,
    avgEngagementTime: 18,
    costSavings: 423.5,
    narrationCached: true,
    createdBy: 'ai',
    lastUsed: new Date('2024-01-15'),
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400'
  }, {
    id: '2',
    name: 'SaaS Pricing Proposal',
    type: 'full-presentation',
    category: 'proposal',
    description: 'Dynamic pricing presentation with ROI calculator and tier comparison',
    slideCount: 8,
    usageCount: 134,
    completionRate: 92,
    avgEngagementTime: 12,
    costSavings: 1205.8,
    narrationCached: true,
    createdBy: 'human',
    lastUsed: new Date('2024-01-16'),
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
  }, {
    id: '3',
    name: 'Company Overview Exhibit',
    type: 'single-exhibit',
    category: 'education',
    description: 'Reusable company background slide with key metrics and timeline',
    slideCount: 1,
    usageCount: 289,
    completionRate: 98,
    avgEngagementTime: 3,
    costSavings: 867.0,
    narrationCached: true,
    createdBy: 'human',
    lastUsed: new Date('2024-01-17'),
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400'
  }, {
    id: '4',
    name: 'Customer Data Collection Form',
    type: 'single-exhibit',
    category: 'data-collection',
    description: 'Interactive form for collecting essential customer information with validation',
    slideCount: 1,
    usageCount: 412,
    completionRate: 95,
    avgEngagementTime: 8,
    costSavings: 1236.0,
    narrationCached: true,
    createdBy: 'ai',
    lastUsed: new Date('2024-01-17'),
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400'
  }, {
    id: '5',
    name: 'New Client Onboarding Journey',
    type: 'full-presentation',
    category: 'onboarding',
    description: 'Step-by-step onboarding presentation with interactive checklists and milestones',
    slideCount: 15,
    usageCount: 78,
    completionRate: 87,
    avgEngagementTime: 22,
    costSavings: 702.0,
    narrationCached: true,
    createdBy: 'ai',
    lastUsed: new Date('2024-01-14'),
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
  }, {
    id: '6',
    name: 'AI-Generated: Tech Stack Analysis',
    type: 'dynamic',
    category: 'discovery',
    description: 'Custom presentation generated during client conversation about technical requirements',
    slideCount: 9,
    usageCount: 3,
    completionRate: 100,
    avgEngagementTime: 16,
    costSavings: 27.0,
    narrationCached: false,
    createdBy: 'ai',
    lastUsed: new Date('2024-01-17'),
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400'
  }];
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });
  const totalCostSavings = templates.reduce((sum, t) => sum + t.costSavings, 0);
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const avgCompletionRate = templates.reduce((sum, t) => sum + t.completionRate, 0) / templates.length;
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Presentation Template Library
              </h1>
              <p className="text-slate-600 mt-1">
                Reusable presentations and exhibits for AI agents
              </p>
            </div>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={18} />
              Create Template
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Total Templates" value={templates.length.toString()} color="blue" />
            <StatCard icon={TrendingUp} label="Total Usage" value={totalUsage.toLocaleString()} color="emerald" />
            <StatCard icon={DollarSign} label="Cost Savings" value={`$${totalCostSavings.toLocaleString()}`} color="purple" />
            <StatCard icon={BarChart3} label="Avg Completion" value={`${avgCompletionRate.toFixed(0)}%`} color="amber" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => <motion.button key={category.id} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <category.icon size={16} />
                  {category.label}
                </motion.button>)}
            </div>

            {/* Type Filter */}
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option value="all">All Types</option>
              <option value="full-presentation">Full Presentations</option>
              <option value="single-exhibit">Single Exhibits</option>
              <option value="dynamic">AI-Generated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, index) => <TemplateCard key={template.id} template={template} index={index} onClick={() => setSelectedTemplate(template)} />)}
            </AnimatePresence>
          </div>

          {filteredTemplates.length === 0 && <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No templates found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search or filters
              </p>
            </div>}
        </div>
      </div>

      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && <TemplateDetailModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />}
      </AnimatePresence>
    </div>;
}
// Stat Card Component
interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}
function StatCard({
  icon: Icon,
  label,
  value,
  color
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <div>
          <div className="text-xs font-medium opacity-75">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>;
}
// Template Card Component
interface TemplateCardProps {
  template: Template;
  index: number;
  onClick: () => void;
}
function TemplateCard({
  template,
  index,
  onClick
}: TemplateCardProps) {
  const typeIcons = {
    'full-presentation': Presentation,
    'single-exhibit': FileText,
    dynamic: Sparkles
  };
  const TypeIcon = typeIcons[template.type];
  return <motion.div layout initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    scale: 0.9
  }} transition={{
    duration: 0.3,
    delay: index * 0.05
  }} whileHover={{
    y: -4
  }} onClick={onClick} className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-900 overflow-hidden">
        <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute top-3 right-3 flex gap-2">
          {template.narrationCached && <div className="px-2 py-1 bg-emerald-500 text-white rounded text-xs font-medium flex items-center gap-1">
              <Zap size={12} />
              Cached
            </div>}
          <div className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white rounded text-xs font-medium flex items-center gap-1">
            <TypeIcon size={12} />
            {template.slideCount}{' '}
            {template.slideCount === 1 ? 'slide' : 'slides'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">
            {template.name}
          </h3>
          {template.createdBy === 'ai' && <Sparkles size={16} className="text-blue-600 shrink-0 ml-2" />}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {template.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-slate-500">Usage</div>
            <div className="text-sm font-semibold text-slate-900">
              {template.usageCount}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Completion</div>
            <div className="text-sm font-semibold text-slate-900">
              {template.completionRate}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Saved</div>
            <div className="text-sm font-semibold text-emerald-600">
              ${template.costSavings}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Play size={14} />
            Use Template
          </motion.button>
          <motion.button whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <Edit size={16} />
          </motion.button>
          <motion.button whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <Copy size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>;
}
// Template Detail Modal
interface TemplateDetailModalProps {
  template: Template;
  onClose: () => void;
}
function TemplateDetailModal({
  template,
  onClose
}: TemplateDetailModalProps) {
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{
      scale: 0.9,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: 0.9,
      opacity: 0
    }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative h-64 bg-slate-900">
          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {template.name}
            </h2>
            <p className="text-slate-300">{template.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">
                {template.usageCount}
              </div>
              <div className="text-sm text-slate-600">Times Used</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">
                {template.completionRate}%
              </div>
              <div className="text-sm text-slate-600">Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">
                {template.avgEngagementTime}m
              </div>
              <div className="text-sm text-slate-600">Avg Time</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                ${template.costSavings}
              </div>
              <div className="text-sm text-emerald-700">Cost Savings</div>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Play size={18} />
              Use This Template
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
              <Edit size={18} />
              Edit
            </motion.button>
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
              <Copy size={18} />
              Duplicate
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>;
}