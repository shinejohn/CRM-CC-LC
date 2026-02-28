import React, { useState, Children, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, ShoppingBag, Briefcase, Wrench, Building, Music, PenTool, Grid, Check, ArrowRight, ArrowLeft, TrendingUp, Calendar, Globe, Target, ShoppingCart, Award, Newspaper, MapPin, Zap, AlertCircle, Edit2, Upload, Image as ImageIcon, CreditCard, Lock } from 'lucide-react';
interface SubscriptionEnrollmentWizardProps {
  onComplete?: (data: EnrollmentData) => void;
  onCancel?: () => void;
}
interface EnrollmentData {
  businessType: string;
  goals: string[];
  publications: string[];
  package: string;
  addOns: AddOn[];
  billingCycle: 'monthly' | 'annual';
  businessInfo: BusinessInfo;
}
interface AddOn {
  id: string;
  quantity?: number;
}
interface BusinessInfo {
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}
interface BusinessTypeOption {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
}
interface GoalOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}
const businessTypes: BusinessTypeOption[] = [{
  id: 'restaurant',
  label: 'Restaurant/Bar/Café',
  subtitle: 'Food & beverage establishments',
  icon: Utensils
}, {
  id: 'retail',
  label: 'Retail Shop',
  subtitle: 'Physical retail locations',
  icon: ShoppingBag
}, {
  id: 'professional',
  label: 'Professional Services',
  subtitle: 'Law, accounting, consulting, etc.',
  icon: Briefcase
}, {
  id: 'home-services',
  label: 'Home Services',
  subtitle: 'Plumbing, electrical, landscaping, etc.',
  icon: Wrench
}, {
  id: 'venue',
  label: 'Venue/Event Space',
  subtitle: 'Theaters, halls, event centers',
  icon: Building
}, {
  id: 'performer',
  label: 'Performer/Entertainer',
  subtitle: 'Bands, DJs, artists, speakers',
  icon: Music
}, {
  id: 'creator',
  label: 'Creator/Content',
  subtitle: 'Authors, producers, influencers',
  icon: PenTool
}, {
  id: 'other',
  label: 'Other Business',
  subtitle: 'Something else',
  icon: Grid
}];
const goals: GoalOption[] = [{
  id: 'get-customers',
  label: 'Get More Customers',
  description: 'Increase foot traffic and inquiries',
  icon: TrendingUp
}, {
  id: 'promote-events',
  label: 'Promote Events',
  description: 'Sell tickets and boost attendance',
  icon: Calendar
}, {
  id: 'online-presence',
  label: 'Build Online Presence',
  description: 'Be found in local searches',
  icon: Globe
}, {
  id: 'advertising',
  label: 'Run Advertising Campaigns',
  description: 'Targeted local advertising',
  icon: Target
}, {
  id: 'sell-online',
  label: 'Sell Products/Services Online',
  description: 'E-commerce and bookings',
  icon: ShoppingCart
}, {
  id: 'thought-leadership',
  label: 'Establish Thought Leadership',
  description: 'Articles and expertise features',
  icon: Award
}];
interface Publication {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: React.ElementType;
  description: string;
  bestFor: string;
}
interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
  spotsRemaining?: number;
  totalSpots?: number;
  soldOut?: boolean;
}
interface AddOnOption {
  id: string;
  name: string;
  price: number;
  priceUnit: string;
  description: string;
  category: string;
}
const publications: Publication[] = [{
  id: 'day-news',
  name: 'Day News',
  shortName: 'DN',
  color: 'var(--nexus-00d4ff)',
  icon: Newspaper,
  description: 'Local news & community stories',
  bestFor: 'Articles, announcements, newsletter features'
}, {
  id: 'go-event-city',
  name: 'Go Event City',
  shortName: 'GEC',
  color: 'var(--nexus-00cc6a)',
  icon: Calendar,
  description: 'Events, tickets & calendars',
  bestFor: 'Event promotion, ticketing, performances'
}, {
  id: 'downtown-guide',
  name: 'Downtown Guide',
  shortName: 'DTG',
  color: 'var(--nexus-8b5cf6)',
  icon: MapPin,
  description: 'Business directory & reviews',
  bestFor: 'Local search visibility, customer reviews'
}, {
  id: 'alphasite',
  name: 'Alphasite',
  shortName: 'AS',
  color: 'var(--nexus-ffb800)',
  icon: Zap,
  description: 'AI-powered business tools',
  bestFor: 'Website creation, AI automation'
}, {
  id: 'global-explorer',
  name: 'Global Explorer',
  shortName: 'GLV',
  color: 'var(--nexus-ff6b35)',
  icon: Globe,
  description: 'International discovery platform',
  bestFor: 'Global reach, international audiences'
}];
const totalSteps = 9;
const addOnOptions: AddOnOption[] = [{
  id: 'priority-list',
  name: 'Priority List',
  price: 25,
  priceUnit: '/mo',
  description: 'Appear first in category searches',
  category: 'visibility'
}, {
  id: 'headliner-status',
  name: 'Headliner Status',
  price: 75,
  priceUnit: '/mo',
  description: 'Featured showcase in all search results',
  category: 'visibility'
}, {
  id: 'additional-community',
  name: 'Additional Community',
  price: 50,
  priceUnit: '/mo',
  description: 'Expand to another community',
  category: 'geographic'
}, {
  id: 'county-wide',
  name: 'County-Wide',
  price: 150,
  priceUnit: '/mo',
  description: 'Coverage across entire county',
  category: 'geographic'
}, {
  id: 'state-wide',
  name: 'State-Wide',
  price: 400,
  priceUnit: '/mo',
  description: 'Statewide visibility',
  category: 'geographic'
}, {
  id: 'national',
  name: 'National',
  price: 800,
  priceUnit: '/mo',
  description: 'National coverage',
  category: 'geographic'
}, {
  id: 'email-newsletter',
  name: 'Email Newsletter Feature',
  price: 50,
  priceUnit: '/mo',
  description: 'Featured in email newsletters',
  category: 'distribution'
}, {
  id: 'sms-campaigns',
  name: 'Text/SMS Campaigns',
  price: 0.1,
  priceUnit: '/msg',
  description: 'Direct SMS marketing',
  category: 'distribution'
}, {
  id: 'social-boost',
  name: 'Social Media Boost',
  price: 25,
  priceUnit: '/mo',
  description: 'Amplified social media presence',
  category: 'distribution'
}, {
  id: 'syndication',
  name: 'Syndication Network',
  price: 75,
  priceUnit: '/mo',
  description: 'Content syndication across network',
  category: 'distribution'
}, {
  id: 'calendar-invites',
  name: 'Calendar Invites',
  price: 15,
  priceUnit: '/mo',
  description: 'Automated calendar invitations',
  category: 'distribution'
}];
export function SubscriptionEnrollmentWizard({
  onComplete,
  onCancel
}: SubscriptionEnrollmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPublications, setSelectedPublications] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    description: ''
  });
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [waitlistPackages, setWaitlistPackages] = useState<string[]>([]);
  // Get category-specific package availability
  const getCategoryPackages = (): Package[] => {
    const categoryAvailability: Record<string, {
      influencer: number;
      expertAvailable: boolean;
      sponsorAvailable: boolean;
    }> = {
      restaurant: {
        influencer: 5,
        expertAvailable: false,
        sponsorAvailable: true
      },
      retail: {
        influencer: 12,
        expertAvailable: true,
        sponsorAvailable: true
      },
      professional: {
        influencer: 8,
        expertAvailable: true,
        sponsorAvailable: false
      },
      'home-services': {
        influencer: 15,
        expertAvailable: true,
        sponsorAvailable: true
      },
      venue: {
        influencer: 3,
        expertAvailable: false,
        sponsorAvailable: false
      },
      performer: {
        influencer: 7,
        expertAvailable: true,
        sponsorAvailable: true
      },
      creator: {
        influencer: 10,
        expertAvailable: true,
        sponsorAvailable: true
      },
      other: {
        influencer: 12,
        expertAvailable: true,
        sponsorAvailable: true
      }
    };
    const availability = categoryAvailability[selectedBusinessType] || {
      influencer: 12,
      expertAvailable: true,
      sponsorAvailable: true
    };
    return [{
      id: 'community-influencer',
      name: 'Community Influencer',
      price: 300,
      spotsRemaining: availability.influencer,
      totalSpots: 37,
      soldOut: availability.influencer === 0,
      features: ['Premium listings on all 4 platforms', 'Priority listing status', '1 Headliner placement (business category)', '1 Headliner placement (events)', '2 Ads per month', '2 Classifieds per month', '2 Announcements per month', '2 Premium Events per month']
    }, {
      id: 'community-expert',
      name: 'Community Expert',
      price: 400,
      spotsRemaining: availability.expertAvailable ? 1 : 0,
      totalSpots: 1,
      soldOut: !availability.expertAvailable,
      features: ['Everything in Community Influencer', 'Monthly expertise article in Day News', 'Category exclusivity (only 1 per category)', 'Establish thought leadership', 'Position as THE authority in your field']
    }, {
      id: 'community-sponsor',
      name: 'Community Sponsor',
      price: 500,
      spotsRemaining: availability.sponsorAvailable ? 2 : 0,
      totalSpots: 1,
      soldOut: !availability.sponsorAvailable,
      features: ['Everything in Community Influencer', 'Section sponsorship in Day News or Go Event City', 'Logo and branding in sponsored section', '"Brought to you by" attribution', 'Priority ad placement in section']
    }];
  };
  const packages = getCategoryPackages();
  const handleWaitlistToggle = (packageId: string) => {
    setWaitlistPackages(prev => prev.includes(packageId) ? prev.filter(id => id !== packageId) : [...prev, packageId]);
  };
  const handleBusinessTypeSelect = (typeId: string) => {
    setSelectedBusinessType(typeId);
  };
  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]);
  };
  const handlePublicationToggle = (pubId: string) => {
    setSelectedPublications(prev => prev.includes(pubId) ? prev.filter(id => id !== pubId) : [...prev, pubId]);
  };
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };
  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => prev.includes(addOnId) ? prev.filter(id => id !== addOnId) : [...prev, addOnId]);
  };
  const getPreselectedPublications = (businessType: string): string[] => {
    const presets: Record<string, string[]> = {
      restaurant: ['day-news', 'downtown-guide', 'go-event-city'],
      venue: ['go-event-city', 'downtown-guide', 'day-news'],
      performer: ['go-event-city', 'day-news', 'global-explorer'],
      professional: ['day-news', 'downtown-guide'],
      retail: ['downtown-guide', 'day-news', 'alphasite'],
      'home-services': ['downtown-guide', 'day-news'],
      creator: ['day-news', 'alphasite', 'global-explorer'],
      other: ['day-news', 'downtown-guide']
    };
    return presets[businessType] || ['day-news', 'downtown-guide'];
  };
  const showGlobalExplorer = ['venue', 'performer', 'restaurant'].includes(selectedBusinessType);
  const calculateTotal = () => {
    const packagePrice = packages.find(p => p.id === selectedPackage)?.price || 0;
    const addOnsPrice = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    const monthlyTotal = packagePrice + addOnsPrice;
    if (billingCycle === 'annual') {
      return Math.round(monthlyTotal * 12 * 0.85);
    }
    return monthlyTotal;
  };
  const getMonthlyTotal = () => {
    const packagePrice = packages.find(p => p.id === selectedPackage)?.price || 0;
    const addOnsPrice = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    return packagePrice + addOnsPrice;
  };
  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const isBusinessInfoValid = () => {
    return businessInfo.name.trim() !== '' && businessInfo.category.trim() !== '' && businessInfo.address.trim() !== '' && businessInfo.city.trim() !== '' && businessInfo.state.trim() !== '' && businessInfo.zip.trim() !== '' && businessInfo.phone.trim() !== '' && businessInfo.email.trim() !== '';
  };
  const handleNext = () => {
    if (currentStep === 1 && selectedBusinessType) {
      setSelectedPublications(getPreselectedPublications(selectedBusinessType));
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.({
        businessType: selectedBusinessType,
        goals: selectedGoals,
        publications: selectedPublications,
        package: selectedPackage,
        addOns: selectedAddOns.map(id => ({
          id
        })),
        billingCycle: billingCycle,
        businessInfo: businessInfo
      });
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const canProceed = () => {
    if (currentStep === 1) return selectedBusinessType !== '';
    if (currentStep === 2) return selectedGoals.length > 0;
    if (currentStep === 3) return selectedPublications.length > 0;
    if (currentStep === 4) return selectedPackage !== '';
    if (currentStep === 5 || currentStep === 6 || currentStep === 7) return true;
    if (currentStep === 8) return true;
    if (currentStep === 9) return isBusinessInfoValid();
    return false;
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({
            length: totalSteps
          }).map((_, index) => <Fragment key={index}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${index + 1 < currentStep ? 'bg-[color:var(--nexus-1e3a5f)] text-white' : index + 1 === currentStep ? 'bg-[color:var(--nexus-1e3a5f)] text-white ring-4 ring-[color:var(--nexus-1e3a5f)]/20' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                    {index + 1 < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                </div>
                {index < totalSteps - 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${index + 1 < currentStep ? 'bg-[color:var(--nexus-1e3a5f)]' : 'bg-slate-200'}`} />}
              </Fragment>)}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Let's find the perfect services for your business
                </h1>
                <p className="text-lg text-slate-600">
                  Select the option that best describes your business
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {businessTypes.map(type => {
              const Icon = type.icon;
              const isSelected = selectedBusinessType === type.id;
              return <motion.button key={type.id} variants={itemVariants} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => handleBusinessTypeSelect(type.id)} className={`relative p-6 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]/5 shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      {isSelected && <motion.div initial={{
                  scale: 0
                }} animate={{
                  scale: 1
                }} className="absolute top-4 right-4 w-6 h-6 bg-[color:var(--nexus-1e3a5f)] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isSelected ? 'bg-[color:var(--nexus-1e3a5f)] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className={`font-bold mb-1 ${isSelected ? 'text-[color:var(--nexus-1e3a5f)]' : 'text-slate-900'}`}>
                        {type.label}
                      </h3>
                      <p className="text-sm text-slate-500">{type.subtitle}</p>
                    </motion.button>;
            })}
              </div>
            </motion.div>}

          {currentStep === 2 && <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  What are your main goals?
                </h1>
                <p className="text-lg text-slate-600">
                  Select all that apply to help us tailor your package
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {goals.map(goal => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);
              return <motion.button key={goal.id} variants={itemVariants} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => handleGoalToggle(goal.id)} className={`relative p-6 rounded-xl border-2 transition-all text-left h-full ${isSelected ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]/5 shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[color:var(--nexus-1e3a5f)] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <div className="w-6 h-6 bg-[color:var(--nexus-1e3a5f)] rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>}
                      </div>
                      <h3 className={`font-bold mb-2 ${isSelected ? 'text-[color:var(--nexus-1e3a5f)]' : 'text-slate-900'}`}>
                        {goal.label}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {goal.description}
                      </p>
                    </motion.button>;
            })}
              </div>
            </motion.div>}

          {currentStep === 3 && <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Choose your platforms
                </h1>
                <p className="text-lg text-slate-600">
                  We've pre-selected the best matches for your business type
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {publications.map(pub => {
              const Icon = pub.icon;
              const isSelected = selectedPublications.includes(pub.id);
              // Skip Global Explorer if not relevant for business type
              if (pub.id === 'global-explorer' && !showGlobalExplorer && !isSelected) {
                return null;
              }
              return <motion.button key={pub.id} variants={itemVariants} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }} onClick={() => handlePublicationToggle(pub.id)} className={`relative p-6 rounded-xl border-2 transition-all text-left h-full overflow-hidden ${isSelected ? 'border-transparent shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`} style={isSelected ? {
                borderColor: pub.color,
                backgroundColor: `${pub.color}10`
              } : {}}>
                      {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full" style={{
                  backgroundColor: pub.color
                }} />}

                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{
                    backgroundColor: isSelected ? pub.color : 'var(--nexus-f1f5f9)',
                    color: isSelected ? 'white' : 'var(--nexus-64748b)'
                  }}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {isSelected && <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
                    backgroundColor: pub.color
                  }}>
                            <Check className="w-4 h-4 text-white" />
                          </div>}
                      </div>

                      <h3 className="font-bold text-lg text-slate-900 mb-1">
                        {pub.name}
                      </h3>
                      <div className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-3" style={{
                  backgroundColor: `${pub.color}20`,
                  color: pub.color
                }}>
                        {pub.shortName}
                      </div>

                      <p className="text-sm font-medium text-slate-700 mb-2">
                        {pub.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        Best for: {pub.bestFor}
                      </p>
                    </motion.button>;
            })}
              </div>
            </motion.div>}

          {currentStep === 4 && <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Select your package
                </h1>
                <p className="text-lg text-slate-600">
                  Choose the level of visibility that's right for you
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
                {packages.map(pkg => {
              const isSelected = selectedPackage === pkg.id;
              const isSoldOut = pkg.soldOut;
              return <motion.div key={pkg.id} variants={itemVariants} className={`relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col h-full ${isSelected ? 'border-[color:var(--nexus-1e3a5f)] shadow-xl ring-4 ring-[color:var(--nexus-1e3a5f)]/10 scale-105 z-10' : isSoldOut ? 'border-slate-100 bg-slate-50 opacity-80' : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-lg'}`}>
                      {isSelected && <div className="bg-[color:var(--nexus-1e3a5f)] text-white text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                          Selected Package
                        </div>}

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-xl text-slate-900">
                            {pkg.name}
                          </h3>
                          {isSoldOut && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                              SOLD OUT
                            </span>}
                        </div>

                        <div className="mb-6">
                          <span className="text-4xl font-bold text-slate-900">
                            ${pkg.price}
                          </span>
                          <span className="text-slate-500">/mo</span>
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                          {pkg.features.map((feature, i) => <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </div>)}
                        </div>

                        <div className="mt-auto">
                          {!isSoldOut && pkg.spotsRemaining !== undefined && pkg.spotsRemaining < 5 && <div className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                Only {pkg.spotsRemaining} spots left!
                              </div>}

                          <button onClick={() => !isSoldOut && handlePackageSelect(pkg.id)} disabled={isSoldOut} className={`w-full py-3 rounded-xl font-bold transition-colors ${isSelected ? 'bg-[color:var(--nexus-1e3a5f)] text-white' : isSoldOut ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                            {isSelected ? 'Selected' : isSoldOut ? 'Join Waitlist' : 'Select Package'}
                          </button>

                          {isSoldOut && <button onClick={() => handleWaitlistToggle(pkg.id)} className="w-full mt-2 text-xs text-blue-600 font-medium hover:underline">
                              {waitlistPackages.includes(pkg.id) ? 'Added to waitlist ✓' : 'Notify me when available'}
                            </button>}
                        </div>
                      </div>
                    </motion.div>;
            })}
              </div>
            </motion.div>}

          {currentStep === 5 && <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Enhance your package
                </h1>
                <p className="text-lg text-slate-600">
                  Select optional add-ons to boost your reach
                </p>
              </motion.div>

              <div className="space-y-8">
                {['visibility', 'geographic', 'distribution'].map(category => {
              const categoryOptions = addOnOptions.filter(opt => opt.category === category);
              if (categoryOptions.length === 0) return null;
              return <motion.div key={category} variants={itemVariants}>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                          {category.charAt(0).toUpperCase() + category.slice(1)}{' '}
                          Add-ons
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryOptions.map(addon => {
                    const isSelected = selectedAddOns.includes(addon.id);
                    return <motion.button key={addon.id} whileHover={{
                      scale: 1.01
                    }} whileTap={{
                      scale: 0.99
                    }} onClick={() => handleAddOnToggle(addon.id)} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                <div className="flex items-center gap-4">
                                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                  <div>
                                    <h4 className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                      {addon.name}
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                      {addon.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                                    ${addon.price}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {addon.priceUnit}
                                  </span>
                                </div>
                              </motion.button>;
                  })}
                        </div>
                      </motion.div>;
            })}
              </div>
            </motion.div>}

          {currentStep === 6 && <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Choose your billing cycle
                </h1>
                <p className="text-lg text-slate-600">
                  Save 15% when you pay annually
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <motion.button variants={itemVariants} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setBillingCycle('monthly')} className={`p-8 rounded-2xl border-2 transition-all text-center ${billingCycle === 'monthly' ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]/5 shadow-lg relative overflow-hidden' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Monthly Billing
                  </h3>
                  <div className="text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-2">
                    ${getMonthlyTotal()}
                    <span className="text-lg font-normal text-slate-500">
                      /mo
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Pay as you go. Cancel anytime.
                  </p>

                  {billingCycle === 'monthly' && <div className="absolute top-4 right-4 w-6 h-6 bg-[color:var(--nexus-1e3a5f)] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>}
                </motion.button>

                <motion.button variants={itemVariants} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setBillingCycle('annual')} className={`p-8 rounded-2xl border-2 transition-all text-center relative overflow-hidden ${billingCycle === 'annual' ? 'border-[color:var(--nexus-1e3a5f)] bg-[color:var(--nexus-1e3a5f)]/5 shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    SAVE 15%
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Annual Billing
                  </h3>
                  <div className="text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-2">
                    ${Math.round(getMonthlyTotal() * 12 * 0.85)}
                    <span className="text-lg font-normal text-slate-500">
                      /yr
                    </span>
                  </div>
                  <p className="text-emerald-600 font-medium mb-1">
                    Save ${Math.round(getMonthlyTotal() * 12 * 0.15)} per year
                  </p>
                  <p className="text-xs text-slate-400">
                    Equivalent to ${Math.round(getMonthlyTotal() * 0.85)}/mo
                  </p>

                  {billingCycle === 'annual' && <div className="absolute top-4 left-4 w-6 h-6 bg-[color:var(--nexus-1e3a5f)] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>}
                </motion.button>
              </div>
            </motion.div>}

          {currentStep === 7 && <motion.div key="step7" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Review your order
                </h1>
                <p className="text-lg text-slate-600">
                  Please verify your selections before proceeding
                </p>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-8">
                {/* Business & Goals */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">
                      Business Profile
                    </h3>
                    <button onClick={() => setCurrentStep(1)} className="text-sm text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block">
                        Business Type
                      </span>
                      <span className="font-medium text-slate-900">
                        {businessTypes.find(t => t.id === selectedBusinessType)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        Selected Goals
                      </span>
                      <span className="font-medium text-slate-900">
                        {selectedGoals.length} goals selected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Package & Addons */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-slate-900">
                      Subscription Details
                    </h3>
                    <button onClick={() => setCurrentStep(4)} className="text-sm text-blue-600 hover:underline">
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {packages.find(p => p.id === selectedPackage)?.name}
                        </h4>
                        <p className="text-xs text-slate-500">Base Package</p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${packages.find(p => p.id === selectedPackage)?.price}
                        /mo
                      </span>
                    </div>

                    {selectedAddOns.map(addonId => {
                  const addon = addOnOptions.find(a => a.id === addonId);
                  if (!addon) return null;
                  return <div key={addonId} className="flex justify-between items-center">
                          <span className="text-slate-600">{addon.name}</span>
                          <span className="text-slate-900 font-medium">
                            +${addon.price}
                            {addon.priceUnit.replace('/mo', '')}
                          </span>
                        </div>;
                })}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[color:var(--nexus-1e3a5f)] rounded-xl p-6 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-80">Billing Cycle</span>
                    <span className="font-bold capitalize">{billingCycle}</span>
                  </div>
                  <div className="h-px bg-white/20 my-4" />
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-bold">Total Due Today</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold block">
                        ${calculateTotal()}
                      </span>
                      {billingCycle === 'annual' && <span className="text-sm opacity-80 text-emerald-300">
                          You saved ${Math.round(getMonthlyTotal() * 12 * 0.15)}
                          !
                        </span>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}

          {currentStep === 8 && <motion.div key="step8" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Payment Information
                </h1>
                <p className="text-lg text-slate-600">
                  Secure payment processing
                </p>
              </motion.div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-600">
                    Your payment information is encrypted and secure.
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Expiration
                      </label>
                      <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        CVC
                      </label>
                      <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Billing Zip Code
                    </label>
                    <input type="text" placeholder="12345" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                </div>
              </div>
            </motion.div>}

          {currentStep === 9 && <motion.div key="step9" variants={containerVariants} initial="hidden" animate="visible" exit={{
          opacity: 0,
          x: -20
        }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--nexus-1e3a5f)] mb-3">
                  Tell us about your business
                </h1>
                <p className="text-lg text-slate-600">
                  We'll use this to set up your profile and listings
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Business Name *
                    </label>
                    <input type="text" value={businessInfo.name} onChange={e => handleBusinessInfoChange('name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category *
                    </label>
                    <input type="text" value={businessInfo.category} onChange={e => handleBusinessInfoChange('category', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Website
                    </label>
                    <input type="text" value={businessInfo.website} onChange={e => handleBusinessInfoChange('website', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone *
                    </label>
                    <input type="text" value={businessInfo.phone} onChange={e => handleBusinessInfoChange('phone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input type="email" value={businessInfo.email} onChange={e => handleBusinessInfoChange('email', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address *
                    </label>
                    <input type="text" value={businessInfo.address} onChange={e => handleBusinessInfoChange('address', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        City *
                      </label>
                      <input type="text" value={businessInfo.city} onChange={e => handleBusinessInfoChange('city', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        State *
                      </label>
                      <input type="text" value={businessInfo.state} onChange={e => handleBusinessInfoChange('state', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Zip Code *
                    </label>
                    <input type="text" value={businessInfo.zip} onChange={e => handleBusinessInfoChange('zip', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea rows={4} value={businessInfo.description} onChange={e => handleBusinessInfoChange('description', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[color:var(--nexus-1e3a5f)] focus:border-transparent outline-none resize-none" placeholder="Briefly describe your business..." />
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={currentStep === 1 ? onCancel : handleBack} className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <motion.button whileHover={{
          scale: canProceed() ? 1.05 : 1
        }} whileTap={{
          scale: canProceed() ? 0.95 : 1
        }} onClick={handleNext} disabled={!canProceed()} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${canProceed() ? 'bg-[color:var(--nexus-1e3a5f)] text-white hover:bg-[color:var(--nexus-1e3a5f)]/90 shadow-lg shadow-[color:var(--nexus-1e3a5f)]/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            {currentStep === totalSteps ? 'Complete' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>;
}