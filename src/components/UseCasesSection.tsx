import React from 'react';
import { BriefcaseIcon, UserCheckIcon, LayersIcon, UsersIcon, ArrowRightIcon } from 'lucide-react';
export const UseCasesSection = () => {
  const useCases = [{
    icon: <BriefcaseIcon size={24} className="text-white" />,
    title: 'Sales Teams',
    description: 'Close more deals with interactive presentations, real-time proposal generation, and AI-driven insights into customer needs.',
    features: ['Dynamic pitch decks that adapt to client reactions', 'Instant competitive analysis and talking points', 'Auto-generated follow-ups and implementation plans', 'Deal analytics and improvement suggestions'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }, {
    icon: <UserCheckIcon size={24} className="text-white" />,
    title: 'Consultants',
    description: 'Deliver exceptional client experiences with powerful needs assessment tools and collaborative solution development.',
    features: ['AI-powered discovery frameworks and questionnaires', 'Visual solution mapping and scenario planning', 'Client-ready documentation and presentations', 'Knowledge base of past solutions and best practices'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }, {
    icon: <LayersIcon size={24} className="text-white" />,
    title: 'Implementation Teams',
    description: 'Streamline project delivery with collaborative workflows, documentation, and client communication tools.',
    features: ['Automated project setup and milestone tracking', 'Client training and onboarding materials', 'Technical documentation with AI assistance', 'Implementation analytics and success metrics'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }, {
    icon: <UsersIcon size={24} className="text-white" />,
    title: 'Collaborative Teams',
    description: 'Enhance creativity and productivity with powerful ideation tools, AI facilitation, and seamless knowledge sharing.',
    features: ['Interactive brainstorming and idea mapping', 'AI-suggested solutions and approaches', 'Real-time collaborative document editing', 'Automated action items and follow-up tracking'],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }];
  return <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Tailored for <span className="text-indigo-600">Every Role</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            IdeaCircuit adapts to how you work, with specialized tools for
            different team functions and goals.
          </p>
        </div>
        <div className="space-y-16">
          {useCases.map((useCase, index) => <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}>
              <div className="md:w-1/2">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mr-4">
                      {useCase.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {useCase.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-6">{useCase.description}</p>
                  <ul className="space-y-3">
                    {useCase.features.map((feature, i) => <li key={i} className="flex items-start">
                        <ArrowRightIcon size={16} className="text-indigo-600 mr-2 mt-1" />
                        <span className="text-gray-700">{feature}</span>
                      </li>)}
                  </ul>
                  <a href="#cta" className="mt-6 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800">
                    Learn more
                    <ArrowRightIcon size={16} className="ml-1" />
                  </a>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img src={useCase.image} alt={`${useCase.title} using IdeaCircuit`} className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};