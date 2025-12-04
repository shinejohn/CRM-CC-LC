import React from 'react';
import { Zap, ArrowRight, MousePointer } from 'lucide-react';
export const ScreensShowcaseSection = () => {
  const screens = [{
    title: 'Marketing Strategy Development',
    description: 'AI-powered marketing plan generation that analyzes market data, identifies opportunities, and creates comprehensive strategies in real-time.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    features: ['Real-time competitive analysis with confidence scoring', 'Auto-generated marketing strategy recommendations', 'Interactive collaboration with AI suggestions'],
    highlight: 'Reduced strategy development time by 68%'
  }, {
    title: 'Sales Discovery & Proposal',
    description: 'Interactive presentations that adapt to client reactions while the AI assistant analyzes needs and generates tailored proposals on the fly.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    features: ['Dynamic presentation content based on client engagement', 'Real-time needs assessment and solution matching', 'Instant proposal generation with pricing optimization'],
    highlight: '35% higher close rates with AI-assisted presentations'
  }, {
    title: 'Project Implementation & Collaboration',
    description: 'Unified workspace where implementation teams collaborate, track milestones, and overcome challenges with AI-powered problem solving.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    features: ['Visual project planning with AI-suggested improvements', 'Automated documentation and knowledge capture', 'Predictive issue identification and resolution'],
    highlight: '42% reduction in implementation time'
  }];
  return <section className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            See <span className="text-indigo-600">IdeaCircuit</span> in Action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Experience how teams across your organization use our platform to
            transform their workflow and deliver exceptional results
          </p>
        </div>
        <div className="space-y-20">
          {screens.map((screen, index) => <div key={index} className="relative">
              {/* Screen showcase */}
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                <div className="relative">
                  {/* Browser-like header */}
                  <div className="bg-gray-800 p-3 flex items-center">
                    <div className="flex space-x-2 absolute left-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="w-full text-center text-gray-400 text-sm">
                      IdeaCircuit - {screen.title}
                    </div>
                  </div>
                  {/* Screenshot with overlay */}
                  <div className="relative">
                    <img src={screen.image} alt={screen.title} className="w-full h-auto object-cover opacity-40 max-h-[500px]" />
                    {/* AI Activity Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 backdrop-blur-sm p-6 rounded-lg max-w-lg border border-gray-700">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <p className="text-green-400 font-medium">
                            AI Assistant Active
                          </p>
                        </div>
                        <div className="space-y-3 text-gray-300">
                          <p className="flex items-start">
                            <Zap size={18} className="text-indigo-400 mr-2 mt-1 flex-shrink-0" />
                            <span>
                              Analyzing market data and identifying
                              opportunities in the healthcare sector...
                            </span>
                          </p>
                          <p className="flex items-start">
                            <MousePointer size={18} className="text-indigo-400 mr-2 mt-1 flex-shrink-0" />
                            <span>
                              Generating targeted messaging recommendations
                              based on competitor analysis...
                            </span>
                          </p>
                          <p className="flex items-start">
                            <Zap size={18} className="text-indigo-400 mr-2 mt-1 flex-shrink-0" />
                            <span>
                              Creating budget allocation suggestions optimized
                              for maximum ROI...
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="bg-white -mt-20 mx-4 md:mx-12 relative z-10 p-6 md:p-8 rounded-lg shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {screen.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{screen.description}</p>
                    <ul className="space-y-2">
                      {screen.features.map((feature, i) => <li key={i} className="flex items-start">
                          <ArrowRight size={16} className="text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>)}
                    </ul>
                  </div>
                  <div className="md:w-1/3 bg-indigo-50 p-4 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-indigo-600 font-bold text-xl mb-1">
                        {screen.highlight.split(' by ')[0]}
                      </div>
                      {screen.highlight.includes(' by ') && <div className="text-2xl font-extrabold text-indigo-700">
                          by {screen.highlight.split(' by ')[1]}
                        </div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};