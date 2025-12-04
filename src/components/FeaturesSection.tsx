import React from 'react';
import { UserIcon, FileTextIcon, MessageCircleIcon, BarChart2Icon, FileCheckIcon, PresentationIcon, UsersIcon, BriefcaseIcon, TargetIcon, RefreshCwIcon, LayersIcon, ZapIcon } from 'lucide-react';
export const FeaturesSection = () => {
  const features = [{
    icon: <UserIcon size={24} className="text-indigo-600" />,
    title: 'AI Collaboration Assistant',
    description: 'Intelligent assistant that facilitates discussions, takes notes, analyzes data, and ensures productive outcomes across all team activities'
  }, {
    icon: <FileTextIcon size={24} className="text-indigo-600" />,
    title: 'Smart Documentation',
    description: 'Automated documentation with real-time transcription, action items extraction, and searchable knowledge base creation'
  }, {
    icon: <PresentationIcon size={24} className="text-indigo-600" />,
    title: 'Interactive Presentations',
    description: 'Dynamic sales and consulting presentations with real-time content adaptation based on audience engagement and feedback'
  }, {
    icon: <TargetIcon size={24} className="text-indigo-600" />,
    title: 'Needs Assessment Tools',
    description: 'AI-powered discovery frameworks for consultants to identify client requirements and generate tailored solutions'
  }, {
    icon: <BriefcaseIcon size={24} className="text-indigo-600" />,
    title: 'Proposal Generator',
    description: 'Create professional proposals, contracts, and implementation plans with AI that learns from successful past projects'
  }, {
    icon: <BarChart2Icon size={24} className="text-indigo-600" />,
    title: 'Insight Analytics',
    description: 'Comprehensive analytics across meetings, sales activities, project implementation, and team performance metrics'
  }, {
    icon: <LayersIcon size={24} className="text-indigo-600" />,
    title: 'Workflow Integration',
    description: 'Seamless connections with your existing tools and processes, from CRM to project management and documentation systems'
  }, {
    icon: <MessageCircleIcon size={24} className="text-indigo-600" />,
    title: 'Context-Aware Communication',
    description: 'AI-powered messaging that understands project history, provides relevant information, and facilitates clear team communication'
  }, {
    icon: <ZapIcon size={24} className="text-indigo-600" />,
    title: 'Idea Acceleration',
    description: 'Collaborative ideation tools with AI suggestions, visual mapping, and real-time co-creation capabilities'
  }];
  return <section id="features" className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            One Platform for{' '}
            <span className="text-indigo-600">
              All Your Collaborative Needs
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From team meetings to sales presentations, consulting sessions to
            implementation planning - IdeaCircuit brings AI-powered intelligence
            to every interaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <div key={index} className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};