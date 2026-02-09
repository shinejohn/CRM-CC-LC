import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Clock, Building2, Wrench, Users, MessageSquare, ChevronRight, Calendar } from 'lucide-react';
interface SurveyManagementPageProps {
  onBack: () => void;
}
interface Survey {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'industry' | 'services' | 'communication';
  status: 'completed' | 'in-progress' | 'not-started';
  completedDate?: string;
  estimatedTime: string;
  questions: number;
  completionPercentage: number;
}
export function SurveyManagementPage({
  onBack
}: SurveyManagementPageProps) {
  const [activeTab, setActiveTab] = useState<Survey['category']>('business');
  const surveys: Survey[] = [
  // Business Surveys
  {
    id: '1',
    name: 'Business Overview',
    description: 'Core business information, goals, and target market',
    category: 'business',
    status: 'completed',
    completedDate: 'Dec 15, 2024',
    estimatedTime: '8 minutes',
    questions: 12,
    completionPercentage: 100
  }, {
    id: '2',
    name: 'Team Structure',
    description: 'Your team size, roles, and organizational structure',
    category: 'business',
    status: 'completed',
    completedDate: 'Dec 16, 2024',
    estimatedTime: '5 minutes',
    questions: 8,
    completionPercentage: 100
  }, {
    id: '3',
    name: 'Business Hours & Availability',
    description: 'Operating hours, holidays, and emergency availability',
    category: 'business',
    status: 'in-progress',
    estimatedTime: '4 minutes',
    questions: 6,
    completionPercentage: 50
  },
  // Industry Surveys
  {
    id: '4',
    name: 'Plumbing Services Specialization',
    description: 'Types of plumbing work, certifications, and expertise areas',
    category: 'industry',
    status: 'completed',
    completedDate: 'Dec 17, 2024',
    estimatedTime: '10 minutes',
    questions: 15,
    completionPercentage: 100
  }, {
    id: '5',
    name: 'Equipment & Tools',
    description: 'Tools, equipment, and technology you use',
    category: 'industry',
    status: 'not-started',
    estimatedTime: '6 minutes',
    questions: 10,
    completionPercentage: 0
  }, {
    id: '6',
    name: 'Compliance & Licensing',
    description: 'Licenses, insurance, and regulatory compliance',
    category: 'industry',
    status: 'completed',
    completedDate: 'Dec 18, 2024',
    estimatedTime: '7 minutes',
    questions: 9,
    completionPercentage: 100
  },
  // Service Delivery Surveys
  {
    id: '7',
    name: 'Service Process & Workflow',
    description: 'How you deliver services from booking to completion',
    category: 'services',
    status: 'in-progress',
    estimatedTime: '12 minutes',
    questions: 18,
    completionPercentage: 67
  }, {
    id: '8',
    name: 'Pricing & Payment',
    description: 'Pricing structure, payment methods, and billing practices',
    category: 'services',
    status: 'completed',
    completedDate: 'Dec 19, 2024',
    estimatedTime: '8 minutes',
    questions: 11,
    completionPercentage: 100
  }, {
    id: '9',
    name: 'Service Area & Coverage',
    description: 'Geographic coverage, travel fees, and service zones',
    category: 'services',
    status: 'not-started',
    estimatedTime: '5 minutes',
    questions: 7,
    completionPercentage: 0
  }, {
    id: '10',
    name: 'Warranties & Guarantees',
    description: 'Service warranties, guarantees, and follow-up policies',
    category: 'services',
    status: 'not-started',
    estimatedTime: '6 minutes',
    questions: 8,
    completionPercentage: 0
  },
  // Communication Surveys
  {
    id: '11',
    name: 'Customer Communication Preferences',
    description: 'How you communicate with customers throughout service',
    category: 'communication',
    status: 'completed',
    completedDate: 'Dec 20, 2024',
    estimatedTime: '5 minutes',
    questions: 8,
    completionPercentage: 100
  }, {
    id: '12',
    name: 'Appointment & Scheduling',
    description: 'Booking process, confirmations, and reminders',
    category: 'communication',
    status: 'in-progress',
    estimatedTime: '7 minutes',
    questions: 10,
    completionPercentage: 40
  }, {
    id: '13',
    name: 'Customer Service Standards',
    description: 'Service standards, response times, and quality expectations',
    category: 'communication',
    status: 'not-started',
    estimatedTime: '6 minutes',
    questions: 9,
    completionPercentage: 0
  }];
  const tabs = [{
    id: 'business' as const,
    label: 'Business Info',
    icon: Building2,
    description: 'Core business details'
  }, {
    id: 'industry' as const,
    label: 'Industry Specific',
    icon: Wrench,
    description: 'Trade & expertise'
  }, {
    id: 'services' as const,
    label: 'Service Delivery',
    icon: Users,
    description: 'How you serve customers'
  }, {
    id: 'communication' as const,
    label: 'Communication',
    icon: MessageSquare,
    description: 'Customer interaction'
  }];
  const filteredSurveys = surveys.filter(s => s.category === activeTab);
  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'not-started':
        return 'text-slate-500 bg-slate-100';
    }
  };
  const getStatusIcon = (status: Survey['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'in-progress':
        return <Clock className="w-5 h-5" />;
      case 'not-started':
        return <Circle className="w-5 h-5" />;
    }
  };
  const getStatusText = (status: Survey['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
    }
  };
  const categoryStats = tabs.map(tab => {
    const categorySurveys = surveys.filter(s => s.category === tab.id);
    const completed = categorySurveys.filter(s => s.status === 'completed').length;
    const total = categorySurveys.length;
    return {
      category: tab.id,
      completed,
      total,
      percentage: Math.round(completed / total * 100)
    };
  });
  const overallStats = {
    total: surveys.length,
    completed: surveys.filter(s => s.status === 'completed').length,
    inProgress: surveys.filter(s => s.status === 'in-progress').length,
    notStarted: surveys.filter(s => s.status === 'not-started').length
  };
  return <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Profile</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Business Surveys
            </h1>
            <p className="text-slate-600 mt-1">
              Help your AI employees understand your business better by
              completing these surveys
            </p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">
                {overallStats.total}
              </div>
              <div className="text-sm text-slate-600">Total Surveys</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">
                {overallStats.completed}
              </div>
              <div className="text-sm text-emerald-700">Completed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {overallStats.inProgress}
              </div>
              <div className="text-sm text-blue-700">In Progress</div>
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-600">
                {overallStats.notStarted}
              </div>
              <div className="text-sm text-slate-600">Not Started</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
            const Icon = tab.icon;
            const stats = categoryStats.find(s => s.category === tab.id);
            const isActive = activeTab === tab.id;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${isActive ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-xs opacity-75">
                        {stats?.completed}/{stats?.total} completed
                      </div>
                    </div>
                  </div>
                </button>;
          })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.2
        }}>
            {/* Category Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {tabs.find(t => t.id === activeTab)?.label} Surveys
                  </h3>
                  <p className="text-sm text-blue-800">
                    {activeTab === 'business' && 'These surveys help AI employees understand your business fundamentals, goals, and operational structure.'}
                    {activeTab === 'industry' && 'Industry-specific surveys help AI employees understand your trade expertise, certifications, and specialized knowledge.'}
                    {activeTab === 'services' && 'Service delivery surveys help AI employees explain your processes, pricing, and service standards to customers.'}
                    {activeTab === 'communication' && 'Communication surveys help AI employees interact with customers in a way that matches your business style and standards.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Survey Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSurveys.map((survey, index) => <motion.div key={survey.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.05
            }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        {survey.name}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {survey.description}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(survey.status)}`}>
                      {getStatusIcon(survey.status)}
                      {getStatusText(survey.status)}
                    </div>
                  </div>

                  {/* Progress Bar (for in-progress surveys) */}
                  {survey.status === 'in-progress' && <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-blue-600">
                          {survey.completionPercentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: `${survey.completionPercentage}%`
                  }} transition={{
                    duration: 0.5,
                    delay: index * 0.1
                  }} className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                      </div>
                    </div>}

                  {/* Survey Meta */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {survey.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      {survey.questions} questions
                    </div>
                    {survey.completedDate && <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {survey.completedDate}
                      </div>}
                  </div>

                  {/* Action Button */}
                  <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${survey.status === 'completed' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : survey.status === 'in-progress' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                    {survey.status === 'completed' && 'Review Responses'}
                    {survey.status === 'in-progress' && 'Continue Survey'}
                    {survey.status === 'not-started' && 'Start Survey'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>;
}