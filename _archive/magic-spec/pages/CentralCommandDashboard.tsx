import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, CheckSquare, Calendar, Share2, Voicemail, Search, Plus, Maximize2, MoreVertical, Clock, Target, FileText, ChevronDown, ChevronUp, Mic, Send, Bell, Phone, Plane, User, Settings, LogOut, Building2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';
import { useBusinessMode } from '../contexts/BusinessModeContext';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function CentralCommandDashboard({
  onNavigate,
  onToggleAIMode
}: {
  onNavigate?: (page: string) => void;
  onToggleAIMode?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: analytics } = useDashboardAnalytics();
  const { terminology } = useBusinessMode();
  const orders = (analytics as { orders?: { total_revenue?: number; paid?: number } })?.orders;
  const customers = (analytics as { customers?: { total?: number } })?.customers;
  const totalRevenue = orders?.total_revenue ?? 0;
  const paidOrders = orders?.paid ?? 0;
  const customerCount = customers?.total ?? 0;
  const goals = [
    { id: '1', title: 'Revenue Target', progress: Math.min(100, Math.round((totalRevenue / 500000) * 100)), target: formatCurrency(totalRevenue), color: 'bg-emerald-500' },
    { id: '2', title: `${terminology.customers} Onboarding`, progress: Math.min(100, Math.round((customerCount / 20) * 100)), target: `${customerCount}/20 ${terminology.customers}`, color: 'bg-blue-500' },
    { id: '3', title: 'Orders Completed', progress: Math.min(100, paidOrders * 2), target: String(paidOrders), color: 'bg-purple-500' },
  ];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    services: false,
    clients: false,
    learning: false,
    tasks: false,
    files: false,
    goals: false,
    phone: false,
    travel: false,
    articles: false,
    events: false,
    advertisements: false
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const {
    getColorScheme,
    isDarkMode
  } = useTheme();
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  // Helper to get card styles
  const getCardStyle = (id: string, defaultColor: string) => {
    const scheme = getColorScheme(id, defaultColor);
    return {
      className: `bg-gradient-to-br ${scheme.gradient} border-2 ${scheme.border} overflow-hidden hover:shadow-lg transition-shadow backdrop-blur-sm rounded-xl relative group`,
      headerClass: `p-4 flex items-center justify-between border-b-2 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/30'}`,
      iconBg: scheme.iconBg,
      iconColor: scheme.iconColor,
      textClass: scheme.text,
      contentBg: isDarkMode ? 'bg-black/20' : 'bg-white/60',
      itemHover: isDarkMode ? 'hover:bg-black/30' : 'hover:bg-white/80'
    };
  };
  // Main dashboard cards data
  const dashboardCards = [{
    id: 'email',
    title: 'Email',
    icon: Mail,
    defaultColor: 'sky',
    activities: [{
      id: '1',
      title: 'New proposal from Acme Corp',
      description: 'Attached is the revised project timeline and budget for Q4.',
      time: '2m ago',
      icon: Mail
    }, {
      id: '2',
      title: 'Client Inquiry',
      description: 'Question about service pricing and packages.',
      time: '3h ago',
      icon: Mail
    }, {
      id: '3',
      title: 'Weekly Newsletter',
      description: 'Your top stories this week in business.',
      time: '8h ago',
      icon: Mail
    }]
  }, {
    id: 'messages',
    title: 'Messages',
    icon: MessageSquare,
    defaultColor: 'mint',
    activities: [{
      id: '1',
      title: 'Message from Sarah',
      description: 'Can we reschedule our 2pm call?',
      time: '1h ago',
      icon: MessageSquare
    }, {
      id: '2',
      title: 'Team update from Alex',
      description: 'The client approved the designs!',
      time: '6h ago',
      icon: MessageSquare
    }]
  }, {
    id: 'tasks',
    title: 'Tasks',
    icon: CheckSquare,
    defaultColor: 'sunshine',
    activities: [{
      id: '1',
      title: 'Review marketing copy',
      description: 'Final review needed for the upcoming product launch campaign.',
      time: '15m ago',
      icon: CheckSquare
    }, {
      id: '2',
      title: 'Update quarterly goals',
      description: 'Please update your OKRs before the end of the day.',
      time: '4h ago',
      icon: CheckSquare
    }]
  }, {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    defaultColor: 'lavender',
    activities: [{
      id: '1',
      title: 'Meeting with Design Team',
      description: 'Weekly sync to discuss latest updates.',
      time: '1h ago',
      icon: Calendar
    }, {
      id: '2',
      title: 'Lunch with Client',
      description: 'Reservation at The Ivy at 12:30pm.',
      time: '5h ago',
      icon: Calendar
    }]
  }, {
    id: 'social',
    title: 'Social',
    icon: Share2,
    defaultColor: 'rose',
    activities: [{
      id: '1',
      title: 'LinkedIn Post Scheduled',
      description: 'Your post about AI trends is scheduled for tomorrow at 9am.',
      time: '2h ago',
      icon: Share2
    }]
  }, {
    id: 'voicemail',
    title: 'Voicemail',
    icon: Voicemail,
    defaultColor: 'ocean',
    activities: [{
      id: '1',
      title: 'Voicemail from John Smith',
      description: 'Regarding the project proposal discussion. Duration: 2:34',
      time: '1h ago',
      icon: Voicemail
    }, {
      id: '2',
      title: 'Voicemail from Marketing Team',
      description: 'Quick update on campaign metrics. Duration: 1:15',
      time: '3h ago',
      icon: Voicemail
    }]
  }];
  return <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Secondary Header - Same as UnifiedCommandCenter */}
      <motion.div initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="bg-white dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white flex-shrink-0">
              C
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                John's Dashboard
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Welcome back!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />

            {/* CC/PA Toggle - NOW CLICKABLE to switch back to CC mode */}
            <button onClick={onToggleAIMode} className="relative w-16 h-8 bg-gray-200 dark:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              <motion.div className="absolute top-1 left-1 w-14 h-6 rounded-full flex items-center justify-between px-1 bg-gradient-to-r from-purple-500 to-pink-500" transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}>
                <span className="text-[10px] font-bold opacity-40 text-white">
                  CC
                </span>
                <span className="text-[10px] font-bold opacity-100 text-white">
                  PA
                </span>
              </motion.div>
              <motion.div className="absolute top-0.5 right-0.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center" transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}>
                <span className="text-[10px] font-bold text-gray-700">PA</span>
              </motion.div>
            </button>

            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
              <Bell className="w-5 h-5" />
            </Button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center text-sm font-bold">
                  JD
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  John Doe
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && <motion.div initial={{
                opacity: 0,
                y: -10,
                scale: 0.95
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                y: -10,
                scale: 0.95
              }} transition={{
                duration: 0.15
              }} className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            John Doe
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            john@example.com
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-around pt-3 border-t border-gray-200 dark:border-slate-700">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {paidOrders}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {terminology.deals}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {customerCount}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {terminology.customers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                  }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <User className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Profile
                        </span>
                      </button>

                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.('business');
                  }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <Building2 className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          My Business
                        </span>
                      </button>

                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigate?.('settings');
                  }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <Settings className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Settings
                        </span>
                      </button>

                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                  }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <Bell className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Notifications
                        </span>
                      </button>

                      <div className="my-2 h-px bg-gray-100 dark:bg-slate-700"></div>

                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                  }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Activity Feed */}
        <section className="flex-1 h-full overflow-hidden flex flex-col p-4">
          {/* Search Bar */}
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Search activities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 h-12 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 backdrop-blur-sm text-gray-900 dark:text-white" />
            </div>
          </motion.div>

          {/* Quick Action Button */}
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.05
        }} className="mb-4">
            <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Quick Action
              <ChevronDown className="w-4 h-4 ml-auto" />
            </Button>
          </motion.div>

          {/* Dashboard Cards Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {dashboardCards.map((card, index) => {
              const style = getCardStyle(card.id, card.defaultColor);
              const Icon = card.icon;
              return <motion.div key={card.id} initial={{
                y: 20,
                opacity: 0
              }} animate={{
                y: 0,
                opacity: 1
              }} transition={{
                delay: 0.1 + index * 0.05
              }}>
                    <Card className={style.className}>
                      <CardContent className="p-0">
                        {/* Card Header */}
                        <div className={style.headerClass}>
                          <div className="flex items-center gap-2">
                            <div className={style.iconColor}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className={`font-semibold ${style.textClass}`}>
                              {card.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <ColorPicker cardId={card.id} currentColor={card.defaultColor} />
                            <Button variant="ghost" size="icon" className={`h-7 w-7 ${style.textClass}`}>
                              <Maximize2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className={`h-7 w-7 ${style.textClass}`}>
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {card.activities.map(activity => <motion.div key={activity.id} whileHover={{
                        scale: 1.02
                      }} className={`rounded-lg p-3 border-2 cursor-pointer transition-shadow shadow-sm ${style.contentBg} border-white/20 ${style.itemHover}`}>
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 ${style.iconColor}`}>
                                  <activity.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className={`font-medium text-sm truncate ${style.textClass}`}>
                                      {activity.title}
                                    </h4>
                                    <span className={`text-xs whitespace-nowrap flex items-center gap-1 ${style.textClass} opacity-70`}>
                                      <Clock className="w-3 h-3" />
                                      {activity.time}
                                    </span>
                                  </div>
                                  <p className={`text-xs line-clamp-2 ${style.textClass} opacity-80`}>
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            </motion.div>)}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>;
            })}
            </div>
          </div>
        </section>

        {/* Right Sidebar - Expandable Widgets - Same width as UnifiedCommandCenter */}
        <aside className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 overflow-y-auto">
          <div className="p-6">
            {/* AI Control Card */}
            <motion.div initial={{
            x: 300,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    AI Assistant
                  </span>
                </div>
              </div>

              {/* Voice Assistant */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-600/50 dark:shadow-none">
                  <Mic className="w-7 h-7 text-white" />
                </motion.button>
                <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                  Professional Mode
                </Badge>
              </div>

              {/* Chat Input */}
              <div>
                <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">
                  How can I help you today?
                </p>
                <div className="relative">
                  <Input placeholder="Type a message..." className="pr-10 bg-gray-100 dark:bg-slate-700 border-2 border-purple-400 dark:border-purple-600 text-gray-900 dark:text-white" />
                  <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-purple-600 hover:bg-purple-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Phone Card */}
            {(() => {
            const style = getCardStyle('phone-widget', 'mint');
            return <motion.div initial={{
              x: 300,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              delay: 0.25
            }} className="mb-3">
                  <div className={`bg-gradient-to-br ${style.className.split(' ')[1]} ${style.className.split(' ')[2]} rounded-xl overflow-hidden shadow-sm border-2 ${style.className.split(' ')[5]}`}>
                    <div className="flex items-center justify-between pr-2 border-b border-white/20">
                      <div onClick={() => toggleSection('phone')} className="flex-1 flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Phone className={`h-5 w-5 ${style.iconColor}`} />
                          </div>
                          <div>
                            <h3 className={`text-base font-bold ${style.textClass}`}>
                              Phone Assistant
                            </h3>
                            {!expandedSections.phone && <p className={`text-xs font-semibold ${style.textClass} opacity-70`}>
                                4 recent calls
                              </p>}
                          </div>
                        </div>
                        {expandedSections.phone ? <ChevronUp className={`h-5 w-5 ${style.textClass}`} /> : <ChevronDown className={`h-5 w-5 ${style.textClass}`} />}
                      </div>
                      <ColorPicker cardId="phone-widget" currentColor="mint" />
                    </div>

                    <AnimatePresence>
                      {expandedSections.phone && <motion.div initial={{
                    height: 0,
                    opacity: 0
                  }} animate={{
                    height: 'auto',
                    opacity: 1
                  }} exit={{
                    height: 0,
                    opacity: 0
                  }} transition={{
                    duration: 0.2
                  }} className="overflow-hidden">
                          <div className="p-4 space-y-2">
                            <Button variant="ghost" size="sm" className={`w-full justify-start ${style.textClass} hover:bg-white/20`}>
                              View Call History
                            </Button>
                            <Button variant="ghost" size="sm" className={`w-full justify-start ${style.textClass} hover:bg-white/20`}>
                              Make a Call
                            </Button>
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </div>
                </motion.div>;
          })()}

            {/* Travel Card */}
            {(() => {
            const style = getCardStyle('travel-widget', 'sky');
            return <motion.div initial={{
              x: 300,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              delay: 0.3
            }} className="mb-3">
                  <div className={`bg-gradient-to-br ${style.className.split(' ')[1]} ${style.className.split(' ')[2]} rounded-xl overflow-hidden shadow-sm border-2 ${style.className.split(' ')[5]}`}>
                    <div className="flex items-center justify-between pr-2 border-b border-white/20">
                      <div onClick={() => toggleSection('travel')} className="flex-1 flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Plane className={`h-5 w-5 ${style.iconColor}`} />
                          </div>
                          <div>
                            <h3 className={`text-base font-bold ${style.textClass}`}>
                              Travel
                            </h3>
                            {!expandedSections.travel && <p className={`text-xs font-semibold ${style.textClass} opacity-70`}>
                                2 trips
                              </p>}
                          </div>
                        </div>
                        {expandedSections.travel ? <ChevronUp className={`h-5 w-5 ${style.textClass}`} /> : <ChevronDown className={`h-5 w-5 ${style.textClass}`} />}
                      </div>
                      <ColorPicker cardId="travel-widget" currentColor="sky" />
                    </div>

                    <AnimatePresence>
                      {expandedSections.travel && <motion.div initial={{
                    height: 0,
                    opacity: 0
                  }} animate={{
                    height: 'auto',
                    opacity: 1
                  }} exit={{
                    height: 0,
                    opacity: 0
                  }} transition={{
                    duration: 0.2
                  }} className="overflow-hidden">
                          <div className="p-4 space-y-2">
                            <Button variant="ghost" size="sm" className={`w-full justify-start ${style.textClass} hover:bg-white/20`}>
                              View Upcoming Trips
                            </Button>
                            <Button variant="ghost" size="sm" className={`w-full justify-start ${style.textClass} hover:bg-white/20`}>
                              Book New Trip
                            </Button>
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </div>
                </motion.div>;
          })()}

            {/* Goals Card */}
            {(() => {
            const style = getCardStyle('goals-widget', 'lavender');
            return <motion.div initial={{
              x: 300,
              opacity: 0
            }} animate={{
              x: 0,
              opacity: 1
            }} transition={{
              delay: 0.35
            }} className="mb-3">
                  <div className={`bg-gradient-to-br ${style.className.split(' ')[1]} ${style.className.split(' ')[2]} rounded-xl overflow-hidden shadow-sm border-2 ${style.className.split(' ')[5]}`}>
                    <div className="flex items-center justify-between pr-2 border-b border-white/20">
                      <div onClick={() => toggleSection('goals')} className="flex-1 flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Target className={`h-5 w-5 ${style.iconColor}`} />
                          </div>
                          <div>
                            <h3 className={`text-base font-bold ${style.textClass}`}>
                              Goals
                            </h3>
                            {!expandedSections.goals && <p className={`text-xs font-semibold ${style.textClass} opacity-70`}>
                                {goals.length} active goals
                              </p>}
                          </div>
                        </div>
                        {expandedSections.goals ? <ChevronUp className={`h-5 w-5 ${style.textClass}`} /> : <ChevronDown className={`h-5 w-5 ${style.textClass}`} />}
                      </div>
                      <ColorPicker cardId="goals-widget" currentColor="lavender" />
                    </div>

                    <AnimatePresence>
                      {expandedSections.goals && <motion.div initial={{
                    height: 0,
                    opacity: 0
                  }} animate={{
                    height: 'auto',
                    opacity: 1
                  }} exit={{
                    height: 0,
                    opacity: 0
                  }} transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }} className="overflow-hidden">
                          <div className="p-4 space-y-4">
                            {goals.map(goal => <div key={goal.id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-bold ${style.textClass}`}>
                                    {goal.title}
                                  </span>
                                  <span className={`text-sm font-bold ${style.textClass}`}>
                                    {goal.progress}%
                                  </span>
                                </div>
                                <div className="h-2.5 w-full rounded-full overflow-hidden bg-black/10">
                                  <motion.div initial={{
                            width: 0
                          }} animate={{
                            width: `${goal.progress}%`
                          }} transition={{
                            duration: 1,
                            ease: 'easeOut'
                          }} className={`h-full rounded-full ${goal.color}`} />
                                </div>
                                <div className="mt-1.5 flex justify-between items-center">
                                  <span className={`text-xs font-semibold ${style.textClass} opacity-70`}>
                                    Target: {goal.target}
                                  </span>
                                </div>
                              </div>)}
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </div>
                </motion.div>;
          })()}
          </div>
        </aside>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(156, 163, 175, 0.5)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(156, 163, 175, 0.7)'};
        }
      `}</style>
    </div>;
}