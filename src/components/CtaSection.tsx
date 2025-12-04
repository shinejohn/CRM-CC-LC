import React from 'react';
export const CtaSection = () => {
  return <section id="cta" className="py-20 px-6 lg:px-12 bg-indigo-600">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to Transform How Your Team Works?
        </h2>
        <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
          Join thousands of teams already using IdeaCircuit to collaborate,
          sell, implement, and innovate with AI-powered intelligence.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <a href="#" className="bg-white text-indigo-600 px-8 py-3 rounded-md font-medium hover:bg-indigo-50 transition-colors">
            Start Free Trial
          </a>
          <a href="#" className="border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors">
            Schedule Demo
          </a>
        </div>
      </div>
    </section>;
};