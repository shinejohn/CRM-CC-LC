import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ChevronDown, Image as ImageIcon, Eye, Copy, Edit, Trash2, TrendingUp, Calendar, Archive, FileText } from 'lucide-react';
interface ContentLibraryProps {
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}
interface LibraryItem {
  id: string;
  type: 'ad' | 'classified' | 'announcement' | 'event' | 'article';
  title: string;
  date: string;
  status: 'active' | 'archived' | 'draft';
  performance?: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
    views?: number;
  };
  thumbnail?: boolean;
}
export function ContentLibrary({
  onNavigate,
  onBack
}: ContentLibraryProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ad' | 'classified' | 'announcement' | 'event' | 'article'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('most-recent');
  const libraryItems: LibraryItem[] = [
  // Ads
  {
    id: '1',
    type: 'ad',
    title: 'Winter Sale',
    date: 'Jan 2026',
    status: 'active',
    performance: {
      impressions: 8450,
      clicks: 203,
      ctr: 2.6
    },
    thumbnail: true
  }, {
    id: '2',
    type: 'ad',
    title: 'Holiday Special',
    date: 'Dec 2025',
    status: 'archived',
    performance: {
      impressions: 6200,
      clicks: 112,
      ctr: 1.8
    },
    thumbnail: true
  }, {
    id: '3',
    type: 'ad',
    title: 'Fall Promo',
    date: 'Oct 2025',
    status: 'archived',
    performance: {
      impressions: 7100,
      clicks: 149,
      ctr: 2.1
    },
    thumbnail: true
  }, {
    id: '4',
    type: 'ad',
    title: 'Summer Menu',
    date: 'Jul 2025',
    status: 'archived',
    performance: {
      impressions: 5800,
      clicks: 110,
      ctr: 1.9
    },
    thumbnail: true
  },
  // Announcements
  {
    id: '5',
    type: 'announcement',
    title: '25 Year Anniversary',
    date: 'Draft',
    status: 'draft'
  }, {
    id: '6',
    type: 'announcement',
    title: 'Holiday Hours',
    date: 'Dec 2025',
    status: 'archived'
  }, {
    id: '7',
    type: 'announcement',
    title: 'New Menu Launch',
    date: 'Sep 2025',
    status: 'archived'
  }, {
    id: '8',
    type: 'announcement',
    title: 'Award Winner',
    date: 'Aug 2025',
    status: 'archived'
  },
  // Expert Articles
  {
    id: '9',
    type: 'article',
    title: 'Perfect Pasta',
    date: 'Draft',
    status: 'draft'
  }, {
    id: '10',
    type: 'article',
    title: 'Wine Pairing',
    date: 'Dec 2025',
    status: 'archived',
    performance: {
      views: 847
    }
  }, {
    id: '11',
    type: 'article',
    title: 'Sauce Secrets',
    date: 'Nov 2025',
    status: 'archived',
    performance: {
      views: 1203
    }
  }, {
    id: '12',
    type: 'article',
    title: 'Choosing Olive Oil',
    date: 'Oct 2025',
    status: 'archived',
    performance: {
      views: 956
    }
  },
  // Classifieds
  {
    id: '13',
    type: 'classified',
    title: 'Hiring Line Cook',
    date: 'Jan 2026',
    status: 'active'
  }, {
    id: '14',
    type: 'classified',
    title: 'Equipment Sale',
    date: 'Jan 2026',
    status: 'active'
  },
  // Events
  {
    id: '15',
    type: 'event',
    title: "Valentine's Dinner",
    date: 'Jan 2026',
    status: 'active'
  }, {
    id: '16',
    type: 'event',
    title: 'Live Jazz Night',
    date: 'Scheduled Feb 1',
    status: 'active'
  }];
  const getFilteredItems = () => {
    let filtered = libraryItems;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };
  const getItemsByType = (type: LibraryItem['type']) => {
    return libraryItems.filter(item => item.type === type);
  };
  const getStatusBadge = (status: LibraryItem['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded border border-emerald-200">
            🟢 Active
          </span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200">
            <Archive className="w-3 h-3" />
            Archived
          </span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded border border-amber-200">
            🟡 Draft
          </span>;
    }
  };
  const getTypeIcon = (type: LibraryItem['type']) => {
    switch (type) {
      case 'ad':
        return '📢';
      case 'classified':
        return '📝';
      case 'announcement':
        return '📣';
      case 'event':
        return '🎫';
      case 'article':
        return '✍️';
    }
  };
  const filters = [{
    id: 'all',
    label: 'All'
  }, {
    id: 'ad',
    label: 'Ads'
  }, {
    id: 'classified',
    label: 'Classifieds'
  }, {
    id: 'announcement',
    label: 'Announcements'
  }, {
    id: 'event',
    label: 'Events'
  }, {
    id: 'article',
    label: 'Articles'
  }];
  return <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Content Library
          </h1>
          <p className="text-slate-600">
            Browse, reuse, and manage your content
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {filters.map(filter => <button key={filter.id} onClick={() => setActiveFilter(filter.id as any)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeFilter === filter.id ? 'bg-[color:var(--nexus-1e3a5f)] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {filter.label}
              </button>)}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search content..." className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[color:var(--nexus-1e3a5f)] focus:outline-none" />
            </div>

            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none px-4 py-3 pr-10 border-2 border-slate-200 rounded-lg focus:border-[color:var(--nexus-1e3a5f)] focus:outline-none bg-white font-medium text-slate-700">
                <option value="most-recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="best-performance">Best Performance</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Ads Section */}
          {(activeFilter === 'all' || activeFilter === 'ad') && <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  ADS ({getItemsByType('ad').length} items)
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All Ads
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getItemsByType('ad').slice(0, 4).map(item => <motion.div key={item.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-[color:var(--nexus-1e3a5f)] transition-all group">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-slate-100 flex items-center justify-center border-b border-slate-200">
                        {item.thumbnail ? <ImageIcon className="w-12 h-12 text-slate-400" /> : <span className="text-4xl">
                            {getTypeIcon(item.type)}
                          </span>}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {item.date}
                        </p>

                        {item.performance && <div className="mb-3">
                            <p className="text-xs text-slate-500 mb-1">
                              {item.performance.impressions?.toLocaleString()}{' '}
                              impressions • {item.performance.clicks} clicks
                            </p>
                            <p className="text-sm font-bold text-emerald-600">
                              {item.performance.ctr}% CTR
                            </p>
                          </div>}

                        <div className="mb-3">
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button className="flex-1 px-3 py-2 bg-[color:var(--nexus-1e3a5f)] hover:bg-[color:var(--nexus-152d4a)] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            <Copy className="w-4 h-4" />
                            Reuse
                          </button>
                        </div>
                      </div>
                    </motion.div>)}
              </div>
            </div>}

          {/* Announcements Section */}
          {(activeFilter === 'all' || activeFilter === 'announcement') && <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  ANNOUNCEMENTS ({getItemsByType('announcement').length} items)
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All Announcements
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getItemsByType('announcement').slice(0, 4).map(item => <motion.div key={item.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-[color:var(--nexus-1e3a5f)] transition-all group">
                      {/* Icon */}
                      <div className="aspect-video bg-purple-50 flex items-center justify-center border-b border-slate-200">
                        <span className="text-6xl">
                          {getTypeIcon(item.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {item.date}
                        </p>

                        <div className="mb-3">
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            {item.status === 'draft' ? <>
                                <Edit className="w-4 h-4" />
                                Edit
                              </> : <>
                                <Eye className="w-4 h-4" />
                                View
                              </>}
                          </button>
                          <button className="flex-1 px-3 py-2 bg-[color:var(--nexus-1e3a5f)] hover:bg-[color:var(--nexus-152d4a)] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            <Copy className="w-4 h-4" />
                            Reuse
                          </button>
                        </div>
                      </div>
                    </motion.div>)}
              </div>
            </div>}

          {/* Expert Articles Section */}
          {(activeFilter === 'all' || activeFilter === 'article') && <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  EXPERT ARTICLES ({getItemsByType('article').length} items)
                  <span className="ml-2 text-sm font-normal text-purple-600">
                    - Community Expert Only
                  </span>
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All Articles
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getItemsByType('article').slice(0, 4).map(item => <motion.div key={item.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-[color:var(--nexus-1e3a5f)] transition-all group">
                      {/* Icon */}
                      <div className="aspect-video bg-indigo-50 flex items-center justify-center border-b border-slate-200">
                        <span className="text-6xl">
                          {getTypeIcon(item.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {item.date}
                        </p>

                        {item.performance?.views && <div className="mb-3">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <TrendingUp className="w-4 h-4" />
                              {item.performance.views.toLocaleString()} views
                            </div>
                          </div>}

                        <div className="mb-3">
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            {item.status === 'draft' ? <>
                                <Edit className="w-4 h-4" />
                                Edit
                              </> : <>
                                <Eye className="w-4 h-4" />
                                View
                              </>}
                          </button>
                          {item.status !== 'draft' && <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>}
                        </div>
                      </div>
                    </motion.div>)}
              </div>
            </div>}

          {/* Empty State */}
          {getFilteredItems().length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No content found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery ? `No results for "${searchQuery}"` : 'Start creating content to build your library'}
              </p>
              <button onClick={() => onNavigate?.('content-type-selection')} className="px-6 py-3 bg-[color:var(--nexus-1e3a5f)] hover:bg-[color:var(--nexus-152d4a)] text-white rounded-lg font-medium transition-colors">
                Create Content
              </button>
            </div>}
        </div>
      </div>
    </div>;
}