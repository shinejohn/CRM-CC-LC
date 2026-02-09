import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, CheckSquare, Calendar, Share2, Voicemail, Search, Plus, Users, BookOpen, Briefcase, FileText, UserCircle, CalendarDays, ChevronDown, Mic, Paperclip, Send, Bell, ChevronRight, Maximize2, MoreVertical, Clock, TrendingUp, Play, Eye, User, Settings, Wand2, LogOut, Building2, Clipboard, DollarSign, Receipt, Megaphone, ExternalLink, Sparkles, PenTool } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
export function UnifiedCommandCenter({
  onNavigate,
  onToggleAIMode
}: {
  onNavigate?: (page: string) => void;
  onToggleAIMode?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRightCards, setExpandedRightCards] = useState<Record<string, boolean>>({
    tasks: false,
    email: false,
    messages: false,
    calendar: false,
    social: false,
    voicemail: false,
    articles: false,
    content: false,
    events: false,
    advertisements: false
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const {
    getColorScheme,
    isDarkMode
  } = useTheme();
  const toggleRightCard = (cardId: string) => {
    setExpandedRightCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };
  const handleModeToggle = () => {
    // Call the parent's toggle function to switch to AI Mode
    onToggleAIMode?.();
  };
  // Helper to get card styles
  const getCardStyle = (id: string, defaultColor: string) => {
    const scheme = getColorScheme(id, defaultColor);
    return {
      className: `h-full bg-gradient-to-br ${scheme.gradient} border-2 ${scheme.border} overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer rounded-xl`,
      headerClass: `p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/30'} backdrop-blur-sm`,
      iconBg: scheme.iconBg,
      iconColor: scheme.iconColor,
      textClass: scheme.text,
      contentBg: isDarkMode ? 'bg-black/20' : 'bg-white/60',
      itemHover: isDarkMode ? 'hover:bg-black/30' : 'hover:bg-white/80'
    };
  };
  return <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <motion.div initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="bg-white dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg text-white flex-shrink-0 shadow-md">
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
            {/* AI Mode Toggle - CC/PA */}
            <button onClick={handleModeToggle} className="relative w-16 h-8 bg-gray-200 dark:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              <motion.div className="absolute top-1 left-1 w-14 h-6 rounded-full flex items-center justify-between px-1 bg-gradient-to-r from-blue-500 to-cyan-500" transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}>
                <span className="text-[10px] font-bold opacity-100 text-white">
                  CC
                </span>
                <span className="text-[10px] font-bold opacity-40 text-white">
                  PA
                </span>
              </motion.div>
              <motion.div className="absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center" transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}>
                <span className="text-[10px] font-bold text-gray-700">CC</span>
              </motion.div>
            </button>

            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
              <Bell className="w-5 h-5" />
            </Button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold text-white">
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
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
                            12
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Tasks
                          </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            48
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Emails
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                    // Navigate to profile
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
                    // Handle notifications
                  }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <Bell className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Notifications
                        </span>
                      </button>

                      <div className="my-2 h-px bg-gray-100 dark:bg-slate-700"></div>

                      <button onClick={() => {
                    setIsProfileMenuOpen(false);
                    // Handle sign out
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
        {/* MAIN AREA - Functional Cards with Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
          {/* Search Bar */}
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.1
        }} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Search activities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 h-12 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 shadow-sm rounded-xl focus:border-purple-400 focus:ring-purple-400 text-gray-900 dark:text-white" />
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
          delay: 0.15
        }} className="mb-6">
            <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700 rounded-xl h-12">
              <Plus className="w-4 h-4 mr-2" />
              Quick Action
              <ChevronDown className="w-4 h-4 ml-auto" />
            </Button>
          </motion.div>

          {/* Order Services CTA Button */}
          <motion.div initial={{
          y: 20,
          opacity: 0,
          scale: 0.95
        }} animate={{
          y: 0,
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.18
        }} className="mb-6">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={() => onNavigate?.('subscription-enrollment')} className="w-full p-6 bg-gradient-to-r from-[#1E3A5F] to-blue-700 hover:from-[#1E3A5F]/90 hover:to-blue-700/90 rounded-xl shadow-xl hover:shadow-2xl transition-all border-2 border-[#1E3A5F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Order Services
                    </h3>
                    <p className="text-sm text-blue-100">
                      Explore packages & add-ons
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          </motion.div>

          {/* Command Cards Grid - 3 columns, 2 rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* MY SERVICES Card - Mint Green */}
            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.2
          }}>
              {(() => {
              const style = getCardStyle('services', 'mint');
              return <Card className={style.className} onClick={() => onNavigate?.('services')}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Card Header */}
                      <div className={style.headerClass}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Briefcase className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <h3 className={`font-bold text-lg ${style.textClass}`}>
                            MY SERVICES
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorPicker cardId="services" currentColor="mint" />
                          <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-white/40 ${style.textClass}`} onClick={e => {
                        e.stopPropagation();
                        onNavigate?.('services');
                      }}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4 flex-1">
                        <div className={`flex items-center justify-between p-4 rounded-xl border border-white/20 shadow-sm ${style.contentBg} backdrop-blur-sm`}>
                          <div>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${style.textClass} opacity-80`}>
                              Active Services
                            </p>
                            <p className={`text-3xl font-bold mt-1 ${style.textClass}`}>
                              12
                            </p>
                          </div>
                          <div className={`p-3 rounded-full ${style.iconBg}`}>
                            <TrendingUp className={`w-6 h-6 ${style.iconColor}`} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors ${style.itemHover}`}>
                            <span className={`font-medium ${style.textClass}`}>
                              Web Design
                            </span>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                              Active
                            </Badge>
                          </div>
                          <div className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors ${style.itemHover}`}>
                            <span className={`font-medium ${style.textClass}`}>
                              SEO Services
                            </span>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                              Active
                            </Badge>
                          </div>
                          <div className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors ${style.itemHover}`}>
                            <span className={`font-medium ${style.textClass}`}>
                              Social Media
                            </span>
                            <Badge className="bg-amber-400 hover:bg-amber-500 text-white border-0">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
            })()}
            </motion.div>

            {/* CLIENTS Card - Sky Blue */}
            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.25
          }}>
              {(() => {
              const style = getCardStyle('clients', 'sky');
              return <Card className={style.className} onClick={() => onNavigate?.('customers')}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Card Header */}
                      <div className={style.headerClass}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Users className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <h3 className={`font-bold text-lg ${style.textClass}`}>
                            Clients
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorPicker cardId="clients" currentColor="sky" />
                          <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-white/40 ${style.textClass}`} onClick={e => {
                        e.stopPropagation();
                        onNavigate?.('customers');
                      }}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3 flex-1">
                        {[{
                      name: 'Acme Corp',
                      status: 'Active',
                      time: '2h ago',
                      initials: 'AC',
                      color: 'bg-blue-500'
                    }, {
                      name: 'TechStart Inc',
                      status: 'Meeting',
                      time: '5h ago',
                      initials: 'TS',
                      color: 'bg-indigo-500'
                    }, {
                      name: 'Design Co',
                      status: 'Active',
                      time: '1d ago',
                      initials: 'DC',
                      color: 'bg-cyan-500'
                    }].map((client, i) => <div key={i} className={`flex items-center justify-between p-3 rounded-xl border border-white/20 transition-colors cursor-pointer shadow-sm ${style.contentBg} backdrop-blur-sm ${style.itemHover}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${client.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                                {client.initials}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {client.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-300">
                                  {client.time}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-white/50 dark:bg-black/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                              {client.status}
                            </Badge>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>;
            })()}
            </motion.div>

            {/* JOBS, PROPOSALS & INVOICES Card - Lavender */}
            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.3
          }}>
              {(() => {
              const style = getCardStyle('jobs', 'lavender');
              return <Card className={style.className} onClick={() => onNavigate?.('jobs')}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Card Header */}
                      <div className={style.headerClass}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Clipboard className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <h3 className={`font-bold text-lg ${style.textClass}`}>
                            Jobs & Invoices
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorPicker cardId="jobs" currentColor="lavender" />
                          <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-white/40 ${style.textClass}`} onClick={e => {
                        e.stopPropagation();
                        onNavigate?.('jobs');
                      }}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3 flex-1">
                        {[{
                      type: 'Job',
                      title: 'Website Redesign',
                      status: 'In Progress',
                      amount: '$5,200',
                      icon: Briefcase,
                      color: 'text-purple-600 dark:text-purple-300',
                      bg: 'bg-purple-100 dark:bg-purple-900/50'
                    }, {
                      type: 'Proposal',
                      title: 'Marketing Campaign',
                      status: 'Pending',
                      amount: '$8,500',
                      icon: FileText,
                      color: 'text-pink-600 dark:text-pink-300',
                      bg: 'bg-pink-100 dark:bg-pink-900/50'
                    }, {
                      type: 'Invoice',
                      title: 'INV-2024-001',
                      status: 'Paid',
                      amount: '$3,200',
                      icon: Receipt,
                      color: 'text-indigo-600 dark:text-indigo-300',
                      bg: 'bg-indigo-100 dark:bg-indigo-900/50'
                    }].map((item, i) => <div key={i} className={`p-3 rounded-xl border border-white/20 transition-colors cursor-pointer shadow-sm ${style.contentBg} backdrop-blur-sm ${style.itemHover}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.bg}`}>
                                  <item.icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-slate-300">
                                    {item.type}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${style.textClass}`}>
                                  {item.amount}
                                </p>
                              </div>
                            </div>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>;
            })()}
            </motion.div>

            {/* LEARNING CENTER Card - Yellow/Orange */}
            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.35
          }}>
              {(() => {
              const style = getCardStyle('learning', 'sunshine');
              return <Card className={style.className} onClick={() => onNavigate?.('learning')}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Card Header */}
                      <div className={style.headerClass}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <BookOpen className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <h3 className={`font-bold text-lg ${style.textClass}`}>
                            Learning Center
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorPicker cardId="learning" currentColor="sunshine" />
                          <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-white/40 ${style.textClass}`} onClick={e => {
                        e.stopPropagation();
                        onNavigate?.('learning');
                      }}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3 flex-1">
                        {[{
                      title: 'Advanced Marketing',
                      progress: 75,
                      duration: '2h 30m'
                    }, {
                      title: 'Client Communication',
                      progress: 45,
                      duration: '1h 45m'
                    }, {
                      title: 'Business Growth',
                      progress: 20,
                      duration: '3h 15m'
                    }].map((course, i) => <div key={i} className={`p-3 rounded-xl border border-white/20 transition-colors cursor-pointer shadow-sm ${style.contentBg} backdrop-blur-sm ${style.itemHover}`}>
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center shrink-0">
                                <Play className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                  {course.title}
                                </h4>
                                <div className="h-1.5 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden mb-1">
                                  <div className="h-full bg-amber-500 rounded-full" style={{
                              width: `${course.progress}%`
                            }} />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-300">
                                  <span>{course.duration}</span>
                                  <span>{course.progress}%</span>
                                </div>
                              </div>
                            </div>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>;
            })()}
            </motion.div>

            {/* BUSINESS OPERATIONS Card - Cyan/Blue */}
            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.4
          }}>
              {(() => {
              const style = getCardStyle('business', 'ocean');
              return <Card className={style.className} onClick={() => onNavigate?.('business')}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Card Header */}
                      <div className={style.headerClass}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <Building2 className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <h3 className={`font-bold text-lg ${style.textClass}`}>
                            Operations
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorPicker cardId="business" currentColor="ocean" />
                          <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-white/40 ${style.textClass}`} onClick={e => {
                        e.stopPropagation();
                        onNavigate?.('business');
                      }}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3 flex-1">
                        {[{
                      action: 'Team meeting',
                      department: 'Ops',
                      time: '1h ago',
                      color: 'bg-cyan-500'
                    }, {
                      action: 'Process updated',
                      department: 'Workflow',
                      time: '3h ago',
                      color: 'bg-blue-500'
                    }, {
                      action: 'New automation',
                      department: 'Systems',
                      time: '5h ago',
                      color: 'bg-indigo-500'
                    }].map((activity, i) => <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-white/20 transition-colors shadow-sm ${style.contentBg} backdrop-blur-sm ${style.itemHover}`}>
                            <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {activity.action}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-300 mt-0.5">
                                <span>{activity.department}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.time}
                                </span>
                              </div>
                            </div>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>;
            })()}
            </motion.div>

            {/* SALES & BILLING Card - Peach/Orange */}
            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.45
          }}>
              {(() => {
              const style = getCardStyle('sales', 'peach');
              return <Card className={style.className} onClick={() => onNavigate?.('billing')}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Card Header */}
                      <div className={style.headerClass}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <DollarSign className={`w-5 h-5 ${style.iconColor}`} />
                          </div>
                          <h3 className={`font-bold text-lg ${style.textClass}`}>
                            Sales & Billing
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorPicker cardId="sales" currentColor="peach" />
                          <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-white/40 ${style.textClass}`} onClick={e => {
                        e.stopPropagation();
                        onNavigate?.('billing');
                      }}>
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3 flex-1">
                        {[{
                      title: 'Payment Received',
                      client: 'Acme Corp',
                      amount: '$3,200',
                      status: 'Completed',
                      color: 'text-emerald-600 dark:text-emerald-400'
                    }, {
                      title: 'Invoice Sent',
                      client: 'TechStart',
                      amount: '$5,800',
                      status: 'Pending',
                      color: 'text-amber-600 dark:text-amber-400'
                    }, {
                      title: 'Quote Approved',
                      client: 'Design Co',
                      amount: '$4,500',
                      status: 'Active',
                      color: 'text-blue-600 dark:text-blue-400'
                    }].map((item, i) => <div key={i} className={`p-3 rounded-xl border border-white/20 transition-colors cursor-pointer shadow-sm ${style.contentBg} backdrop-blur-sm ${style.itemHover}`}>
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-slate-300">
                                  {item.client}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${item.color}`}>
                                  {item.amount}
                                </p>
                              </div>
                            </div>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>;
            })()}
            </motion.div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Quick Access Buttons */}
        <motion.div initial={{
        x: 300,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        delay: 0.3
      }} className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 overflow-y-auto shadow-xl z-10">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Unified Command Center
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Your central hub
              </p>
            </div>

            {/* AI Assistant Section */}
            <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    AI Assistant
                  </span>
                </div>
              </div>

              {/* Voice Assistant */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                  <Mic className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Chat Input */}
              <div className="relative">
                <Input placeholder="Ask anything..." className="pr-10 text-sm bg-white dark:bg-slate-700 border-purple-200 dark:border-purple-700 focus:border-purple-400 focus:ring-purple-400 rounded-lg h-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400" />
                <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-transparent hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Access Cards (WCAG 2.0 Compliant) */}
            <div className="space-y-3">
              {[{
              id: 'tasks',
              title: 'Tasks',
              icon: CheckSquare,
              defaultScheme: 'lavender',
              content: [{
                task: 'Review marketing copy',
                status: 'In Progress'
              }, {
                task: 'Update quarterly goals',
                status: 'Pending'
              }]
            }, {
              id: 'email',
              title: 'Email',
              icon: Mail,
              defaultScheme: 'sky',
              content: [{
                from: 'Acme Corp',
                subject: 'New proposal'
              }, {
                from: 'Client Services',
                subject: 'Follow-up needed'
              }]
            }, {
              id: 'messages',
              title: 'Messages',
              icon: MessageSquare,
              defaultScheme: 'rose',
              content: [{
                from: 'Sarah',
                message: 'Can we reschedule?'
              }, {
                from: 'Alex',
                message: 'Client approved!'
              }]
            }, {
              id: 'calendar',
              title: 'Calendar',
              icon: Calendar,
              defaultScheme: 'mint',
              content: [{
                event: 'Team Meeting',
                time: '2:00 PM'
              }, {
                event: 'Client Call',
                time: 'Tomorrow'
              }]
            }, {
              id: 'files',
              title: 'Files',
              icon: FileText,
              defaultScheme: 'ocean',
              content: [{
                title: 'Project Specs.pdf',
                size: '2.4 MB'
              }, {
                title: 'Q4 Report.docx',
                size: '1.1 MB'
              }]
            }, {
              id: 'articles',
              title: 'Articles',
              icon: BookOpen,
              defaultScheme: 'peach',
              content: [{
                title: 'AI Trends 2024',
                views: '1.2k'
              }, {
                title: 'Marketing Tips',
                views: '856'
              }]
            }, {
              id: 'content',
              title: 'Content Creator',
              icon: PenTool,
              defaultScheme: 'violet',
              content: [{
                title: 'Blog: Q1 Recap',
                status: 'Scheduled',
                date: 'Tomorrow'
              }, {
                title: 'Social: Product Launch',
                status: 'Draft',
                date: 'Jan 15'
              }]
            }, {
              id: 'events',
              title: 'Events',
              icon: CalendarDays,
              defaultScheme: 'sunshine',
              content: [{
                title: 'Workshop',
                date: 'Friday'
              }, {
                title: 'Webinar',
                date: 'Next Week'
              }]
            }, {
              id: 'advertisements',
              title: 'Ads',
              icon: Megaphone,
              defaultScheme: 'coral',
              content: [{
                title: 'Summer Sale',
                impressions: '2.5k'
              }, {
                title: 'New Launch',
                impressions: '1.8k'
              }]
            }].map((card, index) => {
              const Icon = card.icon;
              const isExpanded = expandedRightCards[card.id];
              const scheme = getColorScheme(card.id, card.defaultScheme);
              return <motion.div key={card.id} initial={{
                x: 50,
                opacity: 0
              }} animate={{
                x: 0,
                opacity: 1
              }} transition={{
                delay: 0.4 + index * 0.05
              }}>
                    <div className={`bg-gradient-to-br ${scheme.gradient} rounded-xl overflow-hidden shadow-sm border-2 ${scheme.border} transition-all hover:shadow-md`}>
                      {/* Card Header */}
                      <div className="flex items-center justify-between pr-2">
                        <button onClick={() => {
                      toggleRightCard(card.id);
                    }} className="flex-1 p-4 flex items-center justify-between hover:bg-white/10 transition-colors focus:outline-none">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${scheme.iconColor}`} />
                            <span className={`font-bold text-base ${scheme.text}`}>
                              {card.title}
                            </span>
                          </div>
                          <ChevronDown className={`w-5 h-5 ${scheme.iconColor} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <ColorPicker cardId={card.id} currentColor={card.defaultScheme} />
                      </div>

                      {/* Expandable Content */}
                      <AnimatePresence>
                        {isExpanded && <motion.div initial={{
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
                            <div className={`p-3 pt-0 space-y-2`}>
                              {card.content.map((item: any, i: number) => <div key={i} className={`p-2 rounded-lg border border-white/20 shadow-sm ${isDarkMode ? 'bg-black/20' : 'bg-white/60'} backdrop-blur-sm`}>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {item.task || item.subject || item.message || item.event || item.title}
                                    </span>
                                  </div>
                                  {(item.status || item.from || item.time || item.size || item.views || item.date || item.impressions) && <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">
                                      {item.status || item.from || item.time || item.size || `${item.views} views` || item.date || `${item.impressions} imps`}
                                    </p>}
                                </div>)}
                            </div>
                          </motion.div>}
                      </AnimatePresence>
                    </div>
                  </motion.div>;
            })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
}