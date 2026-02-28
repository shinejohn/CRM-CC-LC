import React, { useState, Component } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Play, Clock, TrendingUp, Sparkles, Filter, Grid, List, ArrowRight } from 'lucide-react';
interface LearningTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  views: number;
  completionRate: number;
  tags: string[];
  relatedTopics: string[];
}
// Mock data commented out - wire to GET /v1/content (courses/lessons) API
// const LEARNING_TOPICS: LearningTopic[] = [{
//   id: 'ai-customer-service',
//   title: 'AI-Powered Customer Service: Transform Your Support',
//   ...
// }];
const LEARNING_TOPICS: LearningTopic[] = [];
const CATEGORIES = ['All Topics', 'Customer Service', 'Marketing', 'Sales', 'Analytics', 'Operations'];
interface LearningCenterHubProps {
  onNavigateToLesson: (topicId: string) => void;
}
export function LearningCenterHub({
  onNavigateToLesson
}: LearningCenterHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const filteredTopics = (LEARNING_TOPICS ?? []).filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || topic.description.toLowerCase().includes(searchQuery.toLowerCase()) || topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Topics' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Learning Center
              </h1>
              <p className="text-slate-600">
                Discover how AI can transform your business through interactive
                lessons
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                <Grid size={20} />
              </motion.button>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                <List size={20} />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search topics, categories, or keywords..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => <motion.button key={category} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {category}
              </motion.button>)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic, index) => <TopicCard key={topic.id} topic={topic} index={index} onNavigate={onNavigateToLesson} />)}
            </div> : <div className="space-y-4">
              {filteredTopics.map((topic, index) => <TopicListItem key={topic.id} topic={topic} index={index} onNavigate={onNavigateToLesson} />)}
            </div>}

          {filteredTopics.length === 0 && <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No topics found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search or filters
              </p>
            </div>}
        </div>
      </div>
    </div>;
}
// Topic Card Component
function TopicCard({
  topic,
  index,
  onNavigate
}: {
  topic: LearningTopic;
  index: number;
  onNavigate: (topicId: string) => void;
}) {
  const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700'
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: index * 0.05
  }} whileHover={{
    y: -4
  }} onClick={() => onNavigate(topic.id)} className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <img src={topic.thumbnail} alt={topic.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-white rounded text-xs font-medium flex items-center gap-1">
          <Clock size={12} />
          {topic.duration}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[topic.difficulty]}`}>
            {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
            <Play size={24} className="text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-blue-600 font-medium mb-2">
          {topic.category}
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {topic.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {topic.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <Play size={12} />
            <span>{topic.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-600" />
            <span>{topic.completionRate}% complete</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {topic.tags.slice(0, 2).map(tag => <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
              {tag}
            </span>)}
        </div>
      </div>
    </motion.div>;
}
// Topic List Item Component
function TopicListItem({
  topic,
  index,
  onNavigate
}: {
  topic: LearningTopic;
  index: number;
  onNavigate: (topicId: string) => void;
}) {
  const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700'
  };
  return <motion.div initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: 1,
    x: 0
  }} transition={{
    delay: index * 0.05
  }} whileHover={{
    x: 4
  }} onClick={() => onNavigate(topic.id)} className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-all group flex gap-4">
      {/* Thumbnail */}
      <div className="relative w-48 h-32 bg-slate-900 rounded-lg overflow-hidden shrink-0">
        <img src={topic.thumbnail} alt={topic.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Play size={20} className="text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs text-blue-600 font-medium mb-1">
              {topic.category}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
              {topic.title}
            </h3>
          </div>
          <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-4" />
        </div>
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {topic.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          <span className={`px-2 py-1 rounded font-medium ${difficultyColors[topic.difficulty]}`}>
            {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
          </span>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {topic.duration}
          </div>
          <div className="flex items-center gap-1">
            <Play size={12} />
            {topic.views.toLocaleString()} views
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-600" />
            {topic.completionRate}% complete
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {topic.tags.map(tag => <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
              {tag}
            </span>)}
        </div>
      </div>
    </motion.div>;
}