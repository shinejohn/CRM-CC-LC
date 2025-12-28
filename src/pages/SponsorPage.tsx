import React from 'react';
import { MainNavigationHeader } from '@/components/MainNavigationHeader';
import { Heart, Star, Award, Target } from 'lucide-react';

export const SponsorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigationHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a Sponsor</h1>
          <p className="text-xl text-gray-600">
            Support our platform and get premium visibility for your business. Sponsor us and reach thousands of community members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-pink-100 rounded-lg w-fit mb-4">
              <Heart size={24} className="text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Our Mission</h3>
            <p className="text-gray-600 text-sm">Help us build better tools for local businesses and communities.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 bg-amber-100 rounded-lg w-fit mb-4">
              <Star size={24} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Benefits</h3>
            <p className="text-gray-600 text-sm">Get exclusive sponsor benefits and recognition across the platform.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Sponsor?</h2>
          <p className="text-pink-100 mb-6">Contact us to learn more about sponsorship opportunities.</p>
          <button className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};






