import React, { useState } from 'react';
import { MenuIcon, XIcon } from 'lucide-react';
export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="bg-white py-4 px-6 lg:px-12 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold text-indigo-600">
              IdeaCircuit
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium">
              Reviews
            </a>
            <a href="#cta" className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
              Get Started
            </a>
          </div>
          <div className="md:hidden">
            <button type="button" className="text-gray-600 hover:text-gray-900 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && <div className="md:hidden mt-4 bg-white border-t pt-4">
            <div className="flex flex-col space-y-4 pb-4">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Reviews
              </a>
              <a href="#cta" className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>
                Get Started
              </a>
            </div>
          </div>}
      </div>
    </nav>;
};