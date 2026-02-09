import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Plus, ArrowRight } from 'lucide-react';
import { ServiceDetailModal } from './ServiceDetailModal';
const categories = ['All', 'AI Employees', 'Marketing', 'Sales', 'Operations', 'E-Commerce'];
const recommendedServices = [{
  id: 'rec1',
  name: 'Jennifer',
  role: 'Content Creator',
  price: 99,
  rating: 4.9,
  avatar: '👩',
  color: 'bg-purple-100 text-purple-600',
  features: ['Blog posts & articles', 'Newsletter content', 'Social media copy'],
  integrations: ['Sarah (Marketing)', 'Website']
}, {
  id: 'rec2',
  name: 'Ad Campaigns',
  role: 'Marketing',
  price: 200,
  rating: 4.8,
  avatar: '📊',
  color: 'bg-blue-100 text-blue-600',
  features: ['Campaign setup', 'Budget optimization', 'A/B testing'],
  integrations: ['Facebook Ads', 'Google Ads']
}, {
  id: 'rec3',
  name: 'Recurring Billing',
  role: 'Finance',
  price: 49,
  rating: 4.7,
  avatar: '🔄',
  color: 'bg-emerald-100 text-emerald-600',
  features: ['Auto-invoicing', 'Subscription management', 'Dunning emails'],
  integrations: ['Stripe', 'QuickBooks']
}];
const aiEmployees = [{
  id: 'ai1',
  name: 'Emma',
  role: 'Sales Assistant',
  price: 99,
  rating: 4.8,
  avatar: '👩',
  color: 'bg-pink-100 text-pink-600'
}, {
  id: 'ai2',
  name: 'Alex',
  role: 'Operations Manager',
  price: 99,
  rating: 4.9,
  avatar: '👨',
  color: 'bg-indigo-100 text-indigo-600'
}, {
  id: 'ai3',
  name: 'Lisa',
  role: 'Customer Support',
  price: 79,
  rating: 4.7,
  avatar: '👩',
  color: 'bg-orange-100 text-orange-600'
}, {
  id: 'ai4',
  name: 'Amy',
  role: 'Bookkeeper',
  price: 79,
  rating: 4.9,
  avatar: '👩',
  color: 'bg-teal-100 text-teal-600'
}, {
  id: 'ai5',
  name: 'Rachel',
  role: 'Social Media',
  price: 99,
  rating: 4.8,
  avatar: '👩',
  color: 'bg-rose-100 text-rose-600'
}, {
  id: 'ai6',
  name: 'David',
  role: 'Data Analyst',
  price: 79,
  rating: 4.6,
  avatar: '👨',
  color: 'bg-cyan-100 text-cyan-600'
}];
export function ServiceCatalog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleServiceClick = (service: any) => {
    setSelectedService({
      ...service,
      features: service.features || ['Standard feature 1', 'Standard feature 2', 'Standard feature 3'],
      integrations: service.integrations || ['Slack', 'Email', 'CRM']
    });
    setIsModalOpen(true);
  };
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="text-xl">🛍️</span> Service Catalog
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search services..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-64" />
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-slate-100 overflow-x-auto">
        <div className="flex px-6 py-2 gap-2 min-w-max">
          {categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}>
              {category}
            </button>)}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Recommended Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="text-lg">🔥</span> Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedServices.map(service => <motion.div key={service.id} whileHover={{
            y: -4,
            shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={() => handleServiceClick(service)} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer relative group overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-100 to-transparent px-3 py-1 rounded-bl-xl text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                  Recommended
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center text-2xl shadow-sm`}>
                    {service.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{service.name}</h4>
                    <p className="text-xs text-slate-500">{service.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium text-slate-700">
                        {service.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className="font-bold text-slate-900">
                    ${service.price}
                    <span className="text-xs font-normal text-slate-500">
                      /mo
                    </span>
                  </span>
                  <button className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    Add to Cart <Plus className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>)}
          </div>
        </div>

        {/* AI Employees Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <span className="text-lg">👥</span> AI Employees
            </h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {aiEmployees.map(employee => <motion.div key={employee.id} whileHover={{
            scale: 1.02
          }} onClick={() => handleServiceClick(employee)} className="min-w-[200px] bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-blue-300 transition-colors flex flex-col">
                <div className={`w-12 h-12 rounded-full ${employee.color} flex items-center justify-center text-2xl mb-3 mx-auto`}>
                  {employee.avatar}
                </div>
                <div className="text-center mb-3 flex-1">
                  <h4 className="font-bold text-slate-900">{employee.name}</h4>
                  <p className="text-xs text-slate-500 mb-1">{employee.role}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {employee.rating}
                    </span>
                  </div>
                </div>
                <div className="text-center mt-auto">
                  <p className="font-bold text-slate-900 mb-2">
                    ${employee.price}
                    <span className="text-xs font-normal text-slate-500">
                      /mo
                    </span>
                  </p>
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                    Add to Cart
                  </button>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>

      <ServiceDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} service={selectedService} />
    </div>;
}