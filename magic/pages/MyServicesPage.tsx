import React, { useMemo, useState } from 'react';
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, ArrowUpRight, Zap, AlertTriangle, CheckCircle2, Newspaper, Calendar, Megaphone, Tag, Mail, BarChart3, Users, Sparkles, Eye, MousePointerClick, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceMetricsCard } from '../components/ServiceMetricsCard';
import { EnhancedServiceDetailModal } from '../components/ServiceManagement/EnhancedServiceDetailModal';
// Service type definitions (original)
const SERVICE_TYPES = [{
  id: 'all',
  label: 'All Services',
  icon: LayoutGrid
}, {
  id: 'ads',
  label: 'Advertising',
  icon: Megaphone
}, {
  id: 'articles',
  label: 'Articles & Content',
  icon: Newspaper
}, {
  id: 'events',
  label: 'Events',
  icon: Calendar
}, {
  id: 'coupons',
  label: 'Coupons & Deals',
  icon: Tag
}, {
  id: 'email',
  label: 'Email Marketing',
  icon: Mail
}, {
  id: 'analytics',
  label: 'Analytics & Polls',
  icon: BarChart3
}, {
  id: 'ai',
  label: 'AI Services',
  icon: Sparkles
}, {
  id: 'community',
  label: 'Community',
  icon: Users
}];
const PLATFORMS = [{
  id: 'all',
  label: 'All Platforms',
  color: 'slate'
}, {
  id: 'day-news',
  label: 'Day News',
  color: 'blue'
}, {
  id: 'downtowns-guide',
  label: 'Downtowns Guide',
  color: 'purple'
}, {
  id: 'go-event-city',
  label: 'Go Event City',
  color: 'pink'
}, {
  id: 'ai-service',
  label: 'AI Service',
  color: 'emerald'
}, {
  id: 'general',
  label: 'General',
  color: 'amber'
}, {
  id: 'alphasite',
  label: 'Alphasite',
  color: 'cyan'
}, {
  id: 'go-local-voices',
  label: 'Go Local Voices',
  color: 'rose'
}, {
  id: 'community',
  label: 'Community',
  color: 'lime'
}];
// Complete service catalog
const ALL_SERVICE_DEFINITIONS = [
// Day News Services
{
  name: 'Ads',
  platform: 'Day News',
  type: 'ads',
  price: '$150/mo',
  baseViews: 50000
}, {
  name: 'AI Articles',
  platform: 'Day News',
  type: 'articles',
  price: '$200/mo',
  baseViews: 80000
}, {
  name: 'Announcements',
  platform: 'Day News',
  type: 'articles',
  price: '$75/mo',
  baseViews: 35000
}, {
  name: 'Classifieds/Community',
  platform: 'Day News',
  type: 'ads',
  price: '$50/mo',
  baseViews: 25000
}, {
  name: 'Social Post',
  platform: 'Day News',
  type: 'articles',
  price: '$100/mo',
  baseViews: 45000
}, {
  name: 'Coupons',
  platform: 'Day News',
  type: 'coupons',
  price: '$85/mo',
  baseViews: 40000
}, {
  name: 'Legal Notices',
  platform: 'Day News',
  type: 'articles',
  price: '$125/mo',
  baseViews: 15000
}, {
  name: 'Email Ads',
  platform: 'Day News',
  type: 'email',
  price: '$175/mo',
  baseViews: 60000
}, {
  name: 'Newsletter Ad',
  platform: 'Day News',
  type: 'email',
  price: '$150/mo',
  baseViews: 55000
}, {
  name: 'Premiere Biz Directory',
  platform: 'Day News',
  type: 'ads',
  price: '$250/mo',
  baseViews: 70000
}, {
  name: 'Poll Sponsor',
  platform: 'Day News',
  type: 'analytics',
  price: '$120/mo',
  baseViews: 48000
}, {
  name: 'Poll Choice',
  platform: 'Day News',
  type: 'analytics',
  price: '$80/mo',
  baseViews: 42000
}, {
  name: 'Sponsor Ad - Sports',
  platform: 'Day News',
  type: 'ads',
  price: '$200/mo',
  baseViews: 85000
}, {
  name: 'Sponsor Ad - Weather',
  platform: 'Day News',
  type: 'ads',
  price: '$180/mo',
  baseViews: 75000
}, {
  name: 'Sponsor Ad - Homes',
  platform: 'Day News',
  type: 'ads',
  price: '$220/mo',
  baseViews: 65000
}, {
  name: 'Sponsor Ad - Business Directory',
  platform: 'Day News',
  type: 'ads',
  price: '$190/mo',
  baseViews: 58000
}, {
  name: 'Sponsor Ad - Announcements',
  platform: 'Day News',
  type: 'ads',
  price: '$160/mo',
  baseViews: 52000
}, {
  name: 'Sponsor Ad - Obituaries',
  platform: 'Day News',
  type: 'ads',
  price: '$140/mo',
  baseViews: 38000
}, {
  name: 'Sponsor Ad - Promotions',
  platform: 'Day News',
  type: 'ads',
  price: '$175/mo',
  baseViews: 62000
}, {
  name: 'Sponsor Ad - Headlines',
  platform: 'Day News',
  type: 'ads',
  price: '$250/mo',
  baseViews: 95000
},
// Downtowns Guide Services
{
  name: 'Awards',
  platform: 'Downtowns Guide',
  type: 'community',
  price: '$300/yr',
  baseViews: 100000
}, {
  name: 'Coupons',
  platform: 'Downtowns Guide',
  type: 'coupons',
  price: '$90/mo',
  baseViews: 45000
}, {
  name: 'Premium Listing',
  platform: 'Downtowns Guide',
  type: 'ads',
  price: '$199/mo',
  baseViews: 75000
}, {
  name: 'Achievements',
  platform: 'Downtowns Guide',
  type: 'community',
  price: '$150/mo',
  baseViews: 55000
}, {
  name: 'Priority Listing',
  platform: 'Downtowns Guide',
  type: 'ads',
  price: '$249/mo',
  baseViews: 85000
}, {
  name: 'Ads',
  platform: 'Downtowns Guide',
  type: 'ads',
  price: '$175/mo',
  baseViews: 65000
}, {
  name: 'Email Ads',
  platform: 'Downtowns Guide',
  type: 'email',
  price: '$160/mo',
  baseViews: 58000
},
// Go Event City Services
{
  name: 'Event Priority Listing',
  platform: 'Go Event City',
  type: 'events',
  price: '$150/event',
  baseViews: 55000
}, {
  name: 'Performer Ad',
  platform: 'Go Event City',
  type: 'events',
  price: '$120/mo',
  baseViews: 42000
}, {
  name: 'Performer Booking System',
  platform: 'Go Event City',
  type: 'events',
  price: '$299/mo',
  baseViews: 35000
}, {
  name: 'Performer Premium Subscription',
  platform: 'Go Event City',
  type: 'events',
  price: '$199/mo',
  baseViews: 48000
}, {
  name: 'Performer Priority Listing',
  platform: 'Go Event City',
  type: 'events',
  price: '$175/mo',
  baseViews: 52000
}, {
  name: 'Performer Headliner',
  platform: 'Go Event City',
  type: 'events',
  price: '$350/mo',
  baseViews: 95000
}, {
  name: 'Premiere Venue',
  platform: 'Go Event City',
  type: 'events',
  price: '$450/mo',
  baseViews: 120000
}, {
  name: 'Premium Event Ad Package',
  platform: 'Go Event City',
  type: 'events',
  price: '$275/mo',
  baseViews: 88000
}, {
  name: 'Premium Event Headliner',
  platform: 'Go Event City',
  type: 'events',
  price: '$400/mo',
  baseViews: 110000
}, {
  name: 'Premium Events',
  platform: 'Go Event City',
  type: 'events',
  price: '$225/mo',
  baseViews: 72000
}, {
  name: 'Shop Market Place',
  platform: 'Go Event City',
  type: 'ads',
  price: '15% commission',
  baseViews: 65000
}, {
  name: 'Tickets',
  platform: 'Go Event City',
  type: 'events',
  price: '$2/ticket',
  baseViews: 85000
}, {
  name: 'Ticket Reminder',
  platform: 'Go Event City',
  type: 'email',
  price: '$0.50/reminder',
  baseViews: 50000
}, {
  name: 'Venue Priority Listing',
  platform: 'Go Event City',
  type: 'events',
  price: '$299/mo',
  baseViews: 78000
}, {
  name: 'Venue Ad',
  platform: 'Go Event City',
  type: 'ads',
  price: '$180/mo',
  baseViews: 62000
}, {
  name: 'Venue Booking System',
  platform: 'Go Event City',
  type: 'events',
  price: '$349/mo',
  baseViews: 55000
}, {
  name: 'Venue Headliner',
  platform: 'Go Event City',
  type: 'events',
  price: '$450/mo',
  baseViews: 105000
}, {
  name: 'Email Calendar Ads',
  platform: 'Go Event City',
  type: 'email',
  price: '$140/mo',
  baseViews: 58000
}, {
  name: 'Event Reminder Email',
  platform: 'Go Event City',
  type: 'email',
  price: '$0.25/email',
  baseViews: 45000
}, {
  name: 'Event Reminder Text',
  platform: 'Go Event City',
  type: 'email',
  price: '$0.15/text',
  baseViews: 38000
}, {
  name: 'Calendar/Follower Subscription',
  platform: 'Go Event City',
  type: 'community',
  price: '$99/mo',
  baseViews: 42000
}, {
  name: 'Community/Influencer Subscription',
  platform: 'Go Event City',
  type: 'community',
  price: '$149/mo',
  baseViews: 52000
}, {
  name: 'Friend/Follower Calendar Invite',
  platform: 'Go Event City',
  type: 'community',
  price: '$75/mo',
  baseViews: 35000
}, {
  name: "Since you're going... Recommendations",
  platform: 'Go Event City',
  type: 'ads',
  price: '$125/mo',
  baseViews: 48000
}, {
  name: 'Event with Dinner Reservations',
  platform: 'Go Event City',
  type: 'events',
  price: '$200/mo',
  baseViews: 62000
}, {
  name: 'Event in Day News - Headliner',
  platform: 'Go Event City',
  type: 'events',
  price: '$300/mo',
  baseViews: 92000
}, {
  name: 'Event in Day News - Priority',
  platform: 'Go Event City',
  type: 'events',
  price: '$225/mo',
  baseViews: 75000
},
// General Services
{
  name: 'Social Network Postings Syndication',
  platform: 'General',
  type: 'articles',
  price: '$120/mo',
  baseViews: 55000
},
// Alphasite Services
{
  name: 'Community Ad',
  platform: 'Alphasite',
  type: 'ads',
  price: '$100/mo',
  baseViews: 45000
}, {
  name: 'Premium Site',
  platform: 'Alphasite',
  type: 'ads',
  price: '$299/mo',
  baseViews: 35000
}, {
  name: 'Priority Listing',
  platform: 'Alphasite',
  type: 'ads',
  price: '$175/mo',
  baseViews: 52000
},
// Go Local Voices Services
{
  name: 'Creator Subscription',
  platform: 'Go Local Voices',
  type: 'articles',
  price: '$149/mo',
  baseViews: 58000
}, {
  name: 'Priority Listing',
  platform: 'Go Local Voices',
  type: 'articles',
  price: '$199/mo',
  baseViews: 65000
}, {
  name: 'Headline Spot',
  platform: 'Go Local Voices',
  type: 'articles',
  price: '$250/mo',
  baseViews: 85000
}, {
  name: 'Day News Headline',
  platform: 'Go Local Voices',
  type: 'articles',
  price: '$300/mo',
  baseViews: 95000
}, {
  name: 'Day News Priority',
  platform: 'Go Local Voices',
  type: 'articles',
  price: '$225/mo',
  baseViews: 78000
},
// AI Service
{
  name: 'Personal Assistant',
  platform: 'AI Service',
  type: 'ai',
  price: '$49/mo',
  baseViews: 20000
}, {
  name: '4 Calls',
  platform: 'AI Service',
  type: 'ai',
  price: '$99/mo',
  baseViews: 25000
}, {
  name: '4 Calls - Receptionist',
  platform: 'AI Service',
  type: 'ai',
  price: '$149/mo',
  baseViews: 32000
}, {
  name: '4 Calls - Hostess',
  platform: 'AI Service',
  type: 'ai',
  price: '$129/mo',
  baseViews: 28000
}, {
  name: '4 Calls - Appointments',
  platform: 'AI Service',
  type: 'ai',
  price: '$139/mo',
  baseViews: 30000
}, {
  name: '4 Calls - Reservation Confirmation',
  platform: 'AI Service',
  type: 'ai',
  price: '$119/mo',
  baseViews: 26000
}, {
  name: '4 Calls - Appointment Confirmation',
  platform: 'AI Service',
  type: 'ai',
  price: '$119/mo',
  baseViews: 27000
}, {
  name: '4 Calls - Collections',
  platform: 'AI Service',
  type: 'ai',
  price: '$199/mo',
  baseViews: 22000
}, {
  name: '4 Calls - Support',
  platform: 'AI Service',
  type: 'ai',
  price: '$159/mo',
  baseViews: 29000
}, {
  name: '4 Calls - Tips',
  platform: 'AI Service',
  type: 'ai',
  price: '$89/mo',
  baseViews: 24000
}, {
  name: '4 Calls - Product Introducer',
  platform: 'AI Service',
  type: 'ai',
  price: '$179/mo',
  baseViews: 31000
}, {
  name: '4 Calls - Inside Sales',
  platform: 'AI Service',
  type: 'ai',
  price: '$249/mo',
  baseViews: 35000
}, {
  name: '4 Calls - Survey Conductor',
  platform: 'AI Service',
  type: 'ai',
  price: '$139/mo',
  baseViews: 28000
}, {
  name: 'General Email Response',
  platform: 'AI Service',
  type: 'ai',
  price: '$79/mo',
  baseViews: 22000
}, {
  name: 'General Appointment Response',
  platform: 'AI Service',
  type: 'ai',
  price: '$99/mo',
  baseViews: 25000
}, {
  name: 'Alphasite Chatbot',
  platform: 'AI Service',
  type: 'ai',
  price: '$149/mo',
  baseViews: 32000
},
// Community Services
{
  name: 'Social Postings',
  platform: 'Community',
  type: 'community',
  price: '$75/mo',
  baseViews: 38000
}];
// Generate services with realistic metrics
const generateServices = () => {
  return ALL_SERVICE_DEFINITIONS.map((config, i) => {
    const isUsing = Math.random() > 0.3;
    const status = isUsing ? 'active' : 'paused';
    const views = isUsing ? config.baseViews + Math.floor(Math.random() * 20000) : 0;
    const clickRate = isUsing ? 0.05 + Math.random() * 0.1 : 0;
    const leadRate = 0.1 + Math.random() * 0.2;
    const salesRate = 0.05 + Math.random() * 0.15;
    const clicks = Math.floor(views * clickRate);
    const leads = Math.floor(clicks * leadRate);
    const sales = Math.floor(leads * salesRate);
    return {
      id: `srv-${i}`,
      name: config.name,
      platform: config.platform,
      type: config.type,
      status: status,
      price: config.price,
      metrics: {
        views,
        clicks,
        leads,
        sales,
        viewsTrend: isUsing ? Math.floor(Math.random() * 30) - 10 : 0,
        clicksTrend: isUsing ? Math.floor(Math.random() * 25) - 5 : 0,
        leadsTrend: isUsing ? Math.floor(Math.random() * 40) - 15 : 0,
        salesTrend: isUsing ? Math.floor(Math.random() * 35) - 10 : 0
      }
    };
  });
};
const ALL_SERVICES = generateServices();
export function MyServicesPage({
  onNavigate
}: {
  onNavigate?: (page: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Filter Logic
  const filteredServices = useMemo(() => {
    return ALL_SERVICES.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || service.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const platformId = service.platform.toLowerCase().replace(/\s+/g, '-');
      const matchesPlatform = selectedPlatform === 'all' || platformId === selectedPlatform;
      const matchesType = selectedType === 'all' || service.type === selectedType;
      const matchesStatus = selectedStatus === 'All' || selectedStatus === 'Active' && service.status === 'active' || selectedStatus === 'Not Active' && service.status === 'paused';
      return matchesSearch && matchesPlatform && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedPlatform, selectedType, selectedStatus]);
  const handleServiceClick = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };
  const handleViewContent = (service: any) => {
    console.log('View content for:', service.name);
    alert(`Opening content page for ${service.platform} - ${service.name}`);
  };
  const activeCount = ALL_SERVICES.filter(s => s.status === 'active').length;
  const pausedCount = ALL_SERVICES.filter(s => s.status === 'paused').length;
  const totalMetrics = ALL_SERVICES.reduce((acc, service) => ({
    views: acc.views + service.metrics.views,
    clicks: acc.clicks + service.metrics.clicks,
    leads: acc.leads + service.metrics.leads,
    sales: acc.sales + service.metrics.sales
  }), {
    views: 0,
    clicks: 0,
    leads: 0,
    sales: 0
  });
  return <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Service Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Track performance metrics across all your active services and
          campaigns.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <Eye className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Views
          </h3>
          <div className="text-2xl font-bold text-slate-900">
            {(totalMetrics.views / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <MousePointerClick className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Clicks
          </h3>
          <div className="text-2xl font-bold text-slate-900">
            {(totalMetrics.clicks / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Leads
          </h3>
          <div className="text-2xl font-bold text-slate-900">
            {(totalMetrics.leads / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Sales
          </h3>
          <div className="text-2xl font-bold text-slate-900">
            {totalMetrics.sales.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        {/* Search and View Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button onClick={() => setSelectedStatus('All')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                All
              </button>
              <button onClick={() => setSelectedStatus('Active')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'Active' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                Active ({activeCount})
              </button>
              <button onClick={() => setSelectedStatus('Not Active')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'Not Active' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
                Not Active ({pausedCount})
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Platform
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {PLATFORMS.map(platform => <motion.button key={platform.id} whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={() => setSelectedPlatform(platform.id)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedPlatform === platform.id ? `bg-${platform.color}-600 text-white shadow-sm` : `bg-white text-slate-700 hover:bg-slate-100 border border-slate-200`}`}>
                {platform.label}
                {selectedPlatform === platform.id && <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {filteredServices.length}
                  </span>}
              </motion.button>)}
          </div>
        </div>

        {/* Service Type Tabs */}
        <div className="px-4 py-3 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Service Type
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SERVICE_TYPES.map(type => {
            const Icon = type.icon;
            const count = ALL_SERVICES.filter(s => type.id === 'all' || s.type === type.id).length;
            return <motion.button key={type.id} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setSelectedType(type.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedType === type.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                  <Icon className="h-4 w-4" />
                  {type.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${selectedType === type.id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </motion.button>;
          })}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {filteredServices.length}
          </span>{' '}
          services
          {selectedStatus === 'Not Active' && <span className="ml-2 text-orange-600 font-medium">
              • Upsell opportunities
            </span>}
        </p>
        {(searchQuery || selectedPlatform !== 'all' || selectedType !== 'all' || selectedStatus !== 'All') && <button onClick={() => {
        setSearchQuery('');
        setSelectedPlatform('all');
        setSelectedType('all');
        setSelectedStatus('All');
      }} className="text-sm text-blue-600 font-medium hover:text-blue-700">
            Clear all filters
          </button>}
      </div>

      {/* Services Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className={`grid gap-6 pb-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredServices.map((service, index) => <motion.div key={service.id} layout initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.9
        }} transition={{
          duration: 0.2,
          delay: index * 0.02
        }}>
              <ServiceMetricsCard id={service.id} name={service.name} category={`${service.platform}`} type={service.type} status={service.status} price={service.price} metrics={service.metrics} onViewContent={() => handleViewContent(service)} onClick={() => handleServiceClick(service)} />
            </motion.div>)}
        </motion.div>
      </AnimatePresence>

      {filteredServices.length === 0 && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="text-center py-20">
          <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            No services found
          </h3>
          <p className="text-slate-500 mt-2">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
          <button onClick={() => {
        setSearchQuery('');
        setSelectedPlatform('all');
        setSelectedType('all');
        setSelectedStatus('All');
      }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Clear all filters
          </button>
        </motion.div>}

      {/* Detail Modal */}
      <EnhancedServiceDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} service={selectedService} />
    </>;
}