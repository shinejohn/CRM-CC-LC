import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, MapPin, Clock, Globe, Mail, Phone, CheckCircle2 } from 'lucide-react';
export function BusinessInfoEditPage({
  onBack
}: {
  onBack: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Business Profile
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        📍 Edit Business Information
      </h1>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Name *
            </label>
            <input type="text" defaultValue="ABC Home Services" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Category *
            </label>
            <div className="flex gap-2">
              <select className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Home Services</option>
                <option>Professional Services</option>
                <option>Retail</option>
              </select>
              <select className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Plumbing</option>
                <option>HVAC</option>
                <option>Electrical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Year Established
              </label>
              <input type="text" defaultValue="2015" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employees
              </label>
              <input type="number" defaultValue={5} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Primary Phone *
            </label>
            <div className="relative">
              <input type="tel" defaultValue="(555) 123-4567" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 pl-10" />
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <span className="absolute right-3 top-2.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Secondary Phone
            </label>
            <div className="relative">
              <input type="tel" defaultValue="(555) 123-9999" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 pl-10" />
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input type="email" defaultValue="info@abchomeservices.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 pl-10" />
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <div className="relative">
              <input type="url" defaultValue="https://www.abchomeservices.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 pl-10" />
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Address
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Street Address *
              </label>
              <div className="relative">
                <input type="text" defaultValue="123 Main Street" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 pl-10" />
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Suite/Unit
              </label>
              <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                City *
              </label>
              <input type="text" defaultValue="Anytown" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State *
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>FL</option>
                <option>CA</option>
                <option>NY</option>
                <option>TX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ZIP Code *
              </label>
              <input type="text" defaultValue="33444" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <span className="text-sm text-slate-700">
              Hide address from public listings (service area business)
            </span>
          </label>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Business Hours
        </h3>
        <div className="space-y-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => <div key={day} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-slate-700">
                  {day}
                </span>
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <option>8:00 AM</option>
                  <option>9:00 AM</option>
                </select>
                <span className="text-slate-400">to</span>
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <option>6:00 PM</option>
                  <option>5:00 PM</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer ml-auto">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm text-slate-600">Open</span>
                </label>
              </div>)}
          <div className="flex items-center gap-4">
            <span className="w-24 text-sm font-medium text-slate-700">
              Saturday
            </span>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option>9:00 AM</option>
            </select>
            <span className="text-slate-400">to</span>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option>2:00 PM</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-600">Open</span>
            </label>
          </div>
          <div className="flex items-center gap-4 opacity-50">
            <span className="w-24 text-sm font-medium text-slate-700">
              Sunday
            </span>
            <select disabled className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option>Closed</option>
            </select>
            <span className="text-slate-400">to</span>
            <select disabled className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option>Closed</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-600">Open</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700 font-medium">
                Offer 24/7 emergency services
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Service Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Service Area
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Service Radius
            </label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>15 miles from business address</option>
              <option>25 miles from business address</option>
              <option>50 miles from business address</option>
            </select>
          </div>

          <div className="h-48 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-80.1918,25.7617,11,0/600x300?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsN3F4c2gwMG1kMnBwZ2V4b202b3E0In0.1')] bg-cover bg-center opacity-50" />
            <div className="relative z-10 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
              Interactive Map Preview
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Or specify ZIP codes
            </label>
            <input type="text" defaultValue="33444, 33445, 33446" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Enter ZIP codes separated by commas" />
          </div>
        </div>
      </div>

      {/* Business Description */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">
          Business Description
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Short Description *
              </label>
              <span className="text-xs text-slate-500">128/160</span>
            </div>
            <textarea rows={2} defaultValue="ABC Home Services is your trusted local plumber serving Anytown and surrounding areas since 2015." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Description
            </label>
            <textarea rows={6} defaultValue="ABC Home Services provides comprehensive plumbing solutions for residential and commercial customers. Our experienced team handles everything from routine maintenance to emergency repairs, water heater installation, and more. We pride ourselves on honest pricing, quality workmanship, and outstanding customer service." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          Save Changes
        </button>
      </div>
    </motion.div>;
}