import React from 'react';
import { PlayCircleIcon } from 'lucide-react';
export const HeroSection = () => {
  return <section className="bg-gradient-to-b from-indigo-50 to-white py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              <span className="text-indigo-600">Collaborative</span>
              <br />
              Intelligence Platform
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-xl">
              Transform how teams collaborate, sales teams present, consultants
              analyze, and implementation teams deliver. A unified platform
              powered by AI for meaningful communication and results.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#cta" className="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors text-center">
                Start Free Trial
              </a>
              <a href="#" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                <PlayCircleIcon size={20} className="mr-2" />
                Watch Demo
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              <div className="bg-indigo-600 rounded-xl shadow-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Collaborative Intelligence Platform" className="w-full h-auto mix-blend-overlay opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <p className="font-medium text-gray-800">
                        AI Collaboration Suite Active
                      </p>
                    </div>
                    <div className="mt-3 h-24 overflow-y-auto bg-gray-50 p-2 rounded text-sm text-gray-700">
                      <p className="mb-1">
                        <span className="font-semibold">AI:</span> I've analyzed
                        the sales data and created a proposal draft.
                      </p>
                      <p className="mb-1">
                        <span className="font-semibold">AI:</span> Team feedback
                        has been incorporated into the implementation plan.
                      </p>
                      <p>
                        <span className="font-semibold">AI:</span> The customer
                        needs assessment is ready for your review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600">10,000+</div>
            <div className="text-gray-600 mt-1">Teams Collaborating</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600">50M+</div>
            <div className="text-gray-600 mt-1">
              Hours of Productivity Gained
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600">35%</div>
            <div className="text-gray-600 mt-1">Increase in Deal Closures</div>
          </div>
        </div>
      </div>
    </section>;
};