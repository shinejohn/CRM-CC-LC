import React from 'react';
import { Quote } from 'lucide-react';
export const TestimonialsSection = () => {
  const testimonials = [{
    quote: 'IdeaCircuit has transformed how our sales team operates. The interactive presentations and AI-generated proposals have increased our close rate by 42% in just three months.',
    name: 'Sarah Chen',
    title: 'VP of Sales, TechStart',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    quote: "As consultants, we need to quickly understand client needs and develop tailored solutions. IdeaCircuit's AI-powered discovery tools have cut our assessment time in half while improving accuracy.",
    name: 'Marcus Rodriguez',
    title: 'Principal Consultant, GrowthCorp',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    quote: 'Our implementation team uses IdeaCircuit daily. The automated documentation and client communication tools ensure nothing falls through the cracks and clients stay informed throughout the process.',
    name: 'Emily Watson',
    title: 'Implementation Director, Strategic Partners',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    quote: "The collaborative ideation features have revolutionized how our product teams work. We've seen a 67% increase in viable concepts making it to development since adopting IdeaCircuit.",
    name: 'David Park',
    title: 'Head of Innovation, FutureLabs',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }];
  return <section id="testimonials" className="py-20 px-6 lg:px-12 bg-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by <span className="text-indigo-600">Industry Leaders</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how teams across different functions are transforming their work
            with IdeaCircuit
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => <div key={index} className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
              <Quote size={36} className="text-indigo-200 mb-4" />
              <p className="text-gray-700 mb-6 flex-grow">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center mt-auto">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};