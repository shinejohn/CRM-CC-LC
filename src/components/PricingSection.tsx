import React from 'react';
import { CheckIcon } from 'lucide-react';
export const PricingSection = () => {
  const pricingTiers = [{
    name: 'Team',
    price: '$49',
    period: '/month per user',
    description: 'Perfect for small teams getting started with collaboration',
    features: ['Up to 30 participants per session', 'Basic AI collaboration tools', 'Interactive presentations', 'Meeting transcripts and summaries', '10GB storage per user', 'Email support'],
    cta: 'Get Started',
    popular: false
  }, {
    name: 'Business',
    price: '$99',
    period: '/month per user',
    description: 'Advanced features for sales, consulting, and implementation teams',
    features: ['Up to 100 participants per session', 'Advanced AI collaboration suite', 'Sales and consulting toolkits', 'Proposal and document generation', 'Implementation tracking dashboards', 'Analytics and reporting', '100GB storage per user', 'Priority support', 'Custom branding'],
    cta: 'Get Started',
    popular: true
  }, {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for large organizations with complex needs',
    features: ['Unlimited participants', 'Full AI collaboration platform', 'Custom workflows and integrations', 'Advanced security and compliance', 'Dedicated customer success manager', 'Unlimited storage', 'SLA guarantee', 'On-premise deployment options', 'Enterprise API access'],
    cta: 'Contact Sales',
    popular: false
  }];
  return <section id="pricing" className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Pricing for Every Team Size
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your collaborative needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => <div key={index} className={`bg-white rounded-lg ${tier.popular ? 'ring-2 ring-indigo-600 shadow-lg' : 'border border-gray-200'} p-8 flex flex-col`}>
              {tier.popular && <div className="text-center mb-4">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>}
              <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">
                  {tier.price}
                </span>
                <span className="text-gray-600 ml-1">{tier.period}</span>
              </div>
              <p className="mt-2 text-gray-600">{tier.description}</p>
              <ul className="mt-6 space-y-4 flex-1">
                {tier.features.map((feature, i) => <li key={i} className="flex items-start">
                    <CheckIcon size={20} className="text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>)}
              </ul>
              <a href="#cta" className={`mt-8 block text-center px-6 py-3 rounded-md font-medium ${tier.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} transition-colors`}>
                {tier.cta}
              </a>
            </div>)}
        </div>
      </div>
    </section>;
};