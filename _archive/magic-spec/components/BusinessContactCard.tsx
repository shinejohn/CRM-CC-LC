import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Globe, Clock, Star, Award, Users, Calendar, ExternalLink } from 'lucide-react';
interface BusinessContact {
  id: string;
  businessName: string;
  tagline?: string;
  logo?: string;
  owner: {
    name: string;
    title: string;
    photo?: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: {
    weekday: string;
    weekend: string;
  };
  stats: {
    yearsInBusiness: number;
    teamSize: number;
    rating: number;
    reviewCount: number;
  };
  certifications?: string[];
  services?: string[];
}
interface BusinessContactCardProps {
  business: BusinessContact;
  variant?: 'default' | 'compact' | 'detailed';
  onEdit?: () => void;
}
export function BusinessContactCard({
  business,
  variant = 'default',
  onEdit
}: BusinessContactCardProps) {
  if (variant === 'compact') {
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {business.logo ? <img src={business.logo} alt={business.businessName} className="w-16 h-16 rounded-lg object-cover border-2 border-slate-100" /> : <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {business.businessName.charAt(0)}
            </div>}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-lg truncate">
              {business.businessName}
            </h3>
            {business.tagline && <p className="text-sm text-slate-600 mb-2">{business.tagline}</p>}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <a href={`tel:${business.contact.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
                {business.contact.phone}
              </a>
              <a href={`mailto:${business.contact.email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </motion.div>;
  }
  if (variant === 'detailed') {
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {business.logo ? <img src={business.logo} alt={business.businessName} className="w-20 h-20 rounded-xl object-cover border-4 border-white/20 shadow-lg" /> : <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-4 border-white/20">
                  {business.businessName.charAt(0)}
                </div>}
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {business.businessName}
                </h2>
                {business.tagline && <p className="text-blue-100 text-lg">{business.tagline}</p>}
              </div>
            </div>
            {onEdit && <button onClick={onEdit} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors">
                Edit
              </button>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm opacity-90">Established</span>
              </div>
              <div className="text-2xl font-bold">
                {new Date().getFullYear() - business.stats.yearsInBusiness}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm opacity-90">Team Size</span>
              </div>
              <div className="text-2xl font-bold">
                {business.stats.teamSize}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm opacity-90">Rating</span>
              </div>
              <div className="text-2xl font-bold">{business.stats.rating}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm opacity-90">Reviews</span>
              </div>
              <div className="text-2xl font-bold">
                {business.stats.reviewCount}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a href={`tel:${business.contact.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                <Phone className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Phone</div>
                  <div className="font-medium">{business.contact.phone}</div>
                </div>
              </a>
              <a href={`mailto:${business.contact.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                <Mail className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Email</div>
                  <div className="font-medium">{business.contact.email}</div>
                </div>
              </a>
              {business.contact.website && <a href={business.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group col-span-2">
                  <Globe className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-0.5">Website</div>
                    <div className="font-medium">
                      {business.contact.website}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-900 font-medium">
                {business.address.street}
              </p>
              <p className="text-slate-600">
                {business.address.city}, {business.address.state}{' '}
                {business.address.zip}
              </p>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Business Hours
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Weekdays</div>
                <div className="font-medium text-slate-900">
                  {business.hours.weekday}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Weekends</div>
                <div className="font-medium text-slate-900">
                  {business.hours.weekend}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          {business.certifications && business.certifications.length > 0 && <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Certifications & Licenses
              </h3>
              <div className="flex flex-wrap gap-2">
                {business.certifications.map((cert, index) => <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {cert}
                  </span>)}
              </div>
            </div>}

          {/* Services */}
          {business.services && business.services.length > 0 && <div>
              <h3 className="font-bold text-slate-900 mb-4">
                Services Offered
              </h3>
              <div className="flex flex-wrap gap-2">
                {business.services.map((service, index) => <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                    {service}
                  </span>)}
              </div>
            </div>}

          {/* Owner Info */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-4">
              {business.owner.photo ? <img src={business.owner.photo} alt={business.owner.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" /> : <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {business.owner.name.charAt(0)}
                </div>}
              <div>
                <div className="font-bold text-slate-900">
                  {business.owner.name}
                </div>
                <div className="text-sm text-slate-600">
                  {business.owner.title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>;
  }
  // Default variant
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          {business.logo ? <img src={business.logo} alt={business.businessName} className="w-20 h-20 rounded-xl object-cover border-2 border-slate-100" /> : <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
              {business.businessName.charAt(0)}
            </div>}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-xl mb-1">
              {business.businessName}
            </h3>
            {business.tagline && <p className="text-slate-600 mb-3">{business.tagline}</p>}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(business.stats.rating) ? 'fill-current' : ''}`} />)}
              </div>
              <span className="text-sm text-slate-600">
                {business.stats.rating} ({business.stats.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a href={`tel:${business.contact.phone}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
            <Phone className="w-5 h-5" />
            <span className="font-medium">{business.contact.phone}</span>
          </a>
          <a href={`mailto:${business.contact.email}`} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition-colors">
            <Mail className="w-5 h-5" />
            <span className="font-medium">{business.contact.email}</span>
          </a>
          <div className="flex items-start gap-3 text-slate-700">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">{business.address.street}</div>
              <div className="text-sm text-slate-600">
                {business.address.city}, {business.address.state}{' '}
                {business.address.zip}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock className="w-5 h-5" />
            <span className="text-sm">
              {business.hours.weekday} • {business.hours.weekend}
            </span>
          </div>
        </div>

        {onEdit && <button onClick={onEdit} className="w-full mt-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Edit Business Info
          </button>}
      </div>
    </motion.div>;
}