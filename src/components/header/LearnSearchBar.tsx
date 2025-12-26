import React, { useState } from 'react';
import { Link } from 'react-router';
import { SearchIcon, BookOpenIcon, ChevronDownIcon, GraduationCapIcon, FileTextIcon, VideoIcon, HeadphonesIcon, UsersIcon, AwardIcon, TrendingUpIcon, LightbulbIcon } from 'lucide-react';
export const LearnSearchBar = () => {
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const utilityLinks = [{
    label: 'Business Profile',
    path: '/business-profile'
  }, {
    label: 'FAQs',
    path: '/learning/faqs'
  }, {
    label: 'Survey',
    path: '/survey'
  }, {
    label: 'Subscriptions',
    path: '/subscriptions'
  }];
  const learningCategories = [{
    title: 'Getting Started',
    icon: GraduationCapIcon,
    color: 'text-blue-600',
    links: [{
      label: 'Platform Overview',
      path: '/learn/overview'
    }, {
      label: 'Quick Start Guide',
      path: '/learn/quickstart'
    }, {
      label: 'First Steps Tutorial',
      path: '/learn/first-steps'
    }, {
      label: 'Account Setup',
      path: '/learn/account-setup'
    }]
  }, {
    title: 'Video Tutorials',
    icon: VideoIcon,
    color: 'text-red-600',
    links: [{
      label: 'Video Call Basics',
      path: '/learn/video-basics'
    }, {
      label: 'Presentation Tips',
      path: '/learn/presentation-tips'
    }, {
      label: 'AI Features Overview',
      path: '/learn/ai-features'
    }, {
      label: 'Advanced Workflows',
      path: '/learn/workflows'
    }]
  }, {
    title: 'Documentation',
    icon: FileTextIcon,
    color: 'text-green-600',
    links: [{
      label: 'User Manual',
      path: '/learn/manual'
    }, {
      label: 'API Documentation',
      path: '/learn/api'
    }, {
      label: 'Best Practices',
      path: '/learn/best-practices'
    }, {
      label: 'Troubleshooting',
      path: '/learn/troubleshooting'
    }]
  }, {
    title: 'Webinars & Events',
    icon: HeadphonesIcon,
    color: 'text-purple-600',
    links: [{
      label: 'Upcoming Webinars',
      path: '/learn/webinars'
    }, {
      label: 'Past Recordings',
      path: '/learn/recordings'
    }, {
      label: 'Live Training Sessions',
      path: '/learn/training'
    }, {
      label: 'Community Events',
      path: '/learn/events'
    }]
  }, {
    title: 'Community',
    icon: UsersIcon,
    color: 'text-orange-600',
    links: [{
      label: 'Discussion Forums',
      path: '/learn/forums'
    }, {
      label: 'User Stories',
      path: '/learn/stories'
    }, {
      label: 'Expert Network',
      path: '/learn/experts'
    }, {
      label: 'Community Guidelines',
      path: '/learn/guidelines'
    }]
  }, {
    title: 'Certifications',
    icon: AwardIcon,
    color: 'text-amber-600',
    links: [{
      label: 'Certification Programs',
      path: '/learn/certifications'
    }, {
      label: 'Skill Assessments',
      path: '/learn/assessments'
    }, {
      label: 'Learning Paths',
      path: '/learn/paths'
    }, {
      label: 'Achievement Badges',
      path: '/learn/badges'
    }]
  }, {
    title: 'Advanced Topics',
    icon: TrendingUpIcon,
    color: 'text-indigo-600',
    links: [{
      label: 'AI Integration',
      path: '/learn/ai-integration'
    }, {
      label: 'Data Analytics',
      path: '/learn/analytics'
    }, {
      label: 'Custom Workflows',
      path: '/learn/custom-workflows'
    }, {
      label: 'Enterprise Features',
      path: '/learn/enterprise'
    }]
  }, {
    title: 'Resources',
    icon: LightbulbIcon,
    color: 'text-cyan-600',
    links: [{
      label: 'Templates Library',
      path: '/learn/templates'
    }, {
      label: 'Case Studies',
      path: '/learn/case-studies'
    }, {
      label: 'Industry Reports',
      path: '/learn/reports'
    }, {
      label: 'Blog & Articles',
      path: '/learn/blog'
    }]
  }];
  return <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl border-t-4 border-amber-400">
      <div className="flex items-center justify-between py-4 px-6">
        <div className="flex items-center space-x-4">
          {/* Learn Dropdown Button */}
          <div className="relative" onMouseEnter={() => setIsLearnOpen(true)} onMouseLeave={() => setIsLearnOpen(false)}>
            <button className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-5 py-2.5 rounded-lg font-black uppercase tracking-wider shadow-lg transition-all duration-200 group">
              <BookOpenIcon size={18} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm">LEARN</span>
              <ChevronDownIcon size={16} className={`transition-transform duration-200 ${isLearnOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Dropdown */}
            {isLearnOpen && <div className="absolute top-full left-0 mt-2 w-[1000px] bg-white rounded-xl shadow-2xl border-2 border-amber-400 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="mb-4 pb-4 border-b-2 border-amber-200">
                  <h3 className="text-xl font-black text-slate-800">
                    Learning Center
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Explore resources, tutorials, and community content
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {learningCategories.map(category => {
                const Icon = category.icon;
                return <div key={category.title} className="space-y-3">
                        <div className="flex items-center space-x-2 mb-3">
                          <Icon size={18} className={category.color} />
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                            {category.title}
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {category.links.map(link => <Link key={link.path} to={link.path} className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-amber-50 rounded-md transition-all duration-150 font-medium">
                              {link.label}
                            </Link>)}
                        </div>
                      </div>;
              })}
                </div>

                {/* Featured Section at Bottom */}
                <div className="mt-6 space-y-3">
                  <div className="pt-6 border-t-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          🎓 New to Fibonacco?
                        </h4>
                        <p className="text-xs text-slate-600">
                          Start with our comprehensive onboarding course
                        </p>
                      </div>
                      <Link to="/learn/onboarding" className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-bold text-sm transition-colors duration-200 shadow-md">
                        Start Learning →
                      </Link>
                    </div>
                  </div>
                  <div className="pt-4 border-t-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          📧 Email Campaigns
                        </h4>
                        <p className="text-xs text-slate-600">
                          View all 60 landing pages for your email campaigns
                        </p>
                      </div>
                      <Link to="/learning/campaigns" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors duration-200 shadow-md">
                        View Campaigns →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>}
          </div>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search resources, articles, guides..." className="pl-12 pr-6 py-3 w-96 text-sm text-slate-800 bg-white rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-400 shadow-lg font-medium" />
          </div>
        </div>

        {/* Utility Links */}
        <div className="flex items-center space-x-6">
          {utilityLinks.map(link => <Link key={link.path} to={link.path} className="text-sm font-bold hover:text-amber-300 transition-colors duration-150 px-3 py-2 rounded-lg hover:bg-white/10">
              {link.label}
            </Link>)}
        </div>
      </div>
    </div>;
};