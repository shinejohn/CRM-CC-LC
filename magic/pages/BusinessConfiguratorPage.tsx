import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Utensils, Wrench, Briefcase, Scissors, Stethoscope, Car, Home, HardHat, BookOpen, Building, Factory, Truck, Heart, Landmark, Sparkles, Info, Check, ChevronDown, ChevronUp, Calendar, DollarSign, Users, Clipboard, Package, Megaphone, Save, ArrowRight, ArrowLeft, User, Phone, Laptop, Smartphone, FileText, Repeat, Ticket, MapPin, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
// --- Types & Interfaces ---
interface BusinessProfile {
  businessTypes: string[];
  customerEngagement: string[];
  operations: {
    scheduling: string[];
    fieldDelivery: string[];
    sales: string[];
    customerManagement: string[];
    workManagement: string[];
    inventory: string[];
    communication: string[];
    foodHospitality: string[];
    healthcareWellness: string[];
    professionalServices: string[];
  };
  otherBusinessType?: string;
}
interface BusinessTypeOption {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}
interface EngagementOption {
  id: string;
  label: string;
  icon: React.ElementType;
}
interface OperationItem {
  id: string;
  label: string;
  helper: string;
}
interface OperationCategory {
  id: keyof BusinessProfile['operations'];
  title: string;
  icon: React.ElementType;
  items: OperationItem[];
  conditional?: (types: string[]) => boolean;
}
interface BusinessConfiguratorPageProps {
  onBack?: () => void;
}
// --- Data Constants ---
const BUSINESS_TYPES: BusinessTypeOption[] = [{
  id: 'retail',
  icon: Store,
  title: 'Retail / Store',
  description: 'Sell products to customers'
}, {
  id: 'restaurant',
  icon: Utensils,
  title: 'Restaurant / Food Service',
  description: 'Dine-in, takeout, or food prep'
}, {
  id: 'home_services',
  icon: Wrench,
  title: 'Home Services',
  description: 'Plumbing, HVAC, electrical, cleaning'
}, {
  id: 'professional',
  icon: Briefcase,
  title: 'Professional Services',
  description: 'Legal, accounting, consulting, agency'
}, {
  id: 'beauty',
  icon: Scissors,
  title: 'Beauty & Wellness',
  description: 'Salon, spa, barbershop, fitness'
}, {
  id: 'healthcare',
  icon: Stethoscope,
  title: 'Healthcare / Medical',
  description: 'Clinic, dental, therapy, veterinary'
}, {
  id: 'automotive',
  icon: Car,
  title: 'Automotive',
  description: 'Repair shop, detailing, dealership'
}, {
  id: 'real_estate',
  icon: Home,
  title: 'Real Estate',
  description: 'Brokerage, property management'
}, {
  id: 'construction',
  icon: HardHat,
  title: 'Construction / Trades',
  description: 'Contractors, builders, specialists'
}, {
  id: 'education',
  icon: BookOpen,
  title: 'Education / Training',
  description: 'Tutoring, classes, workshops'
}, {
  id: 'hospitality',
  icon: Building,
  title: 'Hospitality / Venues',
  description: 'Hotel, event space, entertainment'
}, {
  id: 'manufacturing',
  icon: Factory,
  title: 'Manufacturing',
  description: 'Production, fabrication'
}, {
  id: 'wholesale',
  icon: Truck,
  title: 'Wholesale / Distribution',
  description: 'B2B sales, suppliers'
}, {
  id: 'non_profit',
  icon: Heart,
  title: 'Non-Profit / Community',
  description: 'Charity, association, community org'
}, {
  id: 'government',
  icon: Landmark,
  title: 'Government / Municipal',
  description: 'City services, public sector'
}, {
  id: 'other',
  icon: Sparkles,
  title: 'Other / Hybrid',
  description: 'Something unique'
}];
const ENGAGEMENT_OPTIONS: EngagementOption[] = [{
  id: 'walk_ins',
  label: 'Walk-ins Welcome',
  icon: User
}, {
  id: 'appointment',
  label: 'By Appointment',
  icon: Calendar
}, {
  id: 'phone',
  label: 'Phone Orders',
  icon: Phone
}, {
  id: 'online',
  label: 'Online Orders / E-commerce',
  icon: Laptop
}, {
  id: 'mobile_app',
  label: 'Mobile App',
  icon: Smartphone
}, {
  id: 'drive_through',
  label: 'Drive-Through',
  icon: Car
}, {
  id: 'field',
  label: 'We Come to Them (Mobile/Field)',
  icon: Truck
}, {
  id: 'consultation',
  label: 'Consultations First',
  icon: MessageSquare
}, {
  id: 'quote',
  label: 'Quote/Estimate Required',
  icon: FileText
}, {
  id: 'contracts',
  label: 'Contracts / Agreements',
  icon: FileText
}, {
  id: 'subscription',
  label: 'Subscription / Membership',
  icon: Repeat
}, {
  id: 'reservations',
  label: 'Reservations / Bookings',
  icon: Ticket
}];
const OPERATION_CATEGORIES: OperationCategory[] = [{
  id: 'scheduling',
  title: 'Scheduling & Bookings',
  icon: Calendar,
  items: [{
    id: 'appointments',
    label: 'Appointments',
    helper: 'One-on-one scheduled services'
  }, {
    id: 'reservations',
    label: 'Reservations',
    helper: 'Tables, rooms, equipment booking'
  }, {
    id: 'job_scheduling',
    label: 'Job Scheduling',
    helper: 'Assign work to specific dates/times'
  }, {
    id: 'class_registration',
    label: 'Class/Event Registration',
    helper: 'Sign-ups for classes, workshops, events'
  }, {
    id: 'waitlist',
    label: 'Waitlist Management',
    helper: 'Handle walk-ins and overflow'
  }, {
    id: 'recurring',
    label: 'Recurring Appointments',
    helper: 'Regular scheduled visits'
  }, {
    id: 'online_booking',
    label: 'Online Booking',
    helper: 'Let customers self-schedule'
  }]
}, {
  id: 'fieldDelivery',
  title: 'Field & Delivery Operations',
  icon: Truck,
  items: [{
    id: 'dispatch',
    label: 'Dispatch',
    helper: 'Send technicians/drivers to locations'
  }, {
    id: 'route_optimization',
    label: 'Route Optimization',
    helper: 'Plan efficient multi-stop routes'
  }, {
    id: 'delivery',
    label: 'Delivery',
    helper: 'Bring products to customers'
  }, {
    id: 'pickup',
    label: 'Pickup / Curbside',
    helper: 'Customers collect orders'
  }, {
    id: 'field_service',
    label: 'Field Service',
    helper: 'On-site work at customer locations'
  }, {
    id: 'installation',
    label: 'Installation',
    helper: 'Set up products/equipment on-site'
  }, {
    id: 'mobile_workforce',
    label: 'Mobile Workforce',
    helper: 'Team works from vehicles/on the go'
  }, {
    id: 'gps',
    label: 'GPS / Location Tracking',
    helper: 'Track team or delivery locations'
  }]
}, {
  id: 'sales',
  title: 'Sales & Transactions',
  icon: DollarSign,
  items: [{
    id: 'pos',
    label: 'Point of Sale (POS)',
    helper: 'In-person transactions'
  }, {
    id: 'invoicing',
    label: 'Invoicing',
    helper: 'Bill customers after service'
  }, {
    id: 'quotes',
    label: 'Quotes / Estimates',
    helper: 'Provide pricing before work'
  }, {
    id: 'proposals',
    label: 'Proposals',
    helper: 'Detailed project/service proposals'
  }, {
    id: 'contracts',
    label: 'Contracts',
    helper: 'Formal agreements with customers'
  }, {
    id: 'deposits',
    label: 'Deposits / Prepayment',
    helper: 'Collect payment upfront'
  }, {
    id: 'subscriptions',
    label: 'Subscriptions / Recurring Billing',
    helper: 'Ongoing automatic charges'
  }, {
    id: 'payment_plans',
    label: 'Payment Plans',
    helper: 'Split payments over time'
  }, {
    id: 'tips',
    label: 'Tips / Gratuity',
    helper: 'Accept tips from customers'
  }]
}, {
  id: 'customerManagement',
  title: 'Customer & Client Management',
  icon: Users,
  items: [{
    id: 'crm',
    label: 'Customer Database',
    helper: 'Track customer info and history'
  }, {
    id: 'client_accounts',
    label: 'Client Accounts',
    helper: 'Ongoing business relationships'
  }, {
    id: 'loyalty',
    label: 'Loyalty / Rewards Program',
    helper: 'Points, stamps, VIP perks'
  }, {
    id: 'membership',
    label: 'Membership Management',
    helper: 'Member tiers, benefits, access'
  }, {
    id: 'leads',
    label: 'Lead Tracking',
    helper: 'Follow potential customers'
  }, {
    id: 'referrals',
    label: 'Referral Tracking',
    helper: 'Track who referred whom'
  }, {
    id: 'portal',
    label: 'Customer Portal',
    helper: 'Self-service for customers'
  }, {
    id: 'reviews',
    label: 'Reviews / Feedback Collection',
    helper: 'Gather customer reviews'
  }]
}, {
  id: 'workManagement',
  title: 'Work & Project Management',
  icon: Clipboard,
  items: [{
    id: 'work_orders',
    label: 'Work Orders',
    helper: 'Formal job documentation'
  }, {
    id: 'job_costing',
    label: 'Job Costing',
    helper: 'Track costs per job'
  }, {
    id: 'project_mgmt',
    label: 'Project Management',
    helper: 'Multi-phase, long-term work'
  }, {
    id: 'task_assignment',
    label: 'Task Assignment',
    helper: 'Delegate work to team members'
  }, {
    id: 'checklists',
    label: 'Checklists / Inspections',
    helper: 'Standardized task lists'
  }, {
    id: 'time_tracking',
    label: 'Time Tracking',
    helper: 'Log hours worked'
  }, {
    id: 'photos',
    label: 'Before/After Photos',
    helper: 'Document work visually'
  }, {
    id: 'service_history',
    label: 'Service History',
    helper: 'Track past work per customer'
  }]
}, {
  id: 'inventory',
  title: 'Inventory & Products',
  icon: Package,
  items: [{
    id: 'inventory_mgmt',
    label: 'Inventory Management',
    helper: 'Track stock levels'
  }, {
    id: 'catalog',
    label: 'Product Catalog',
    helper: 'List of items for sale'
  }, {
    id: 'scanning',
    label: 'Barcode / SKU Scanning',
    helper: 'Scan items for tracking'
  }, {
    id: 'purchase_orders',
    label: 'Purchase Orders',
    helper: 'Order from suppliers'
  }, {
    id: 'low_stock',
    label: 'Low Stock Alerts',
    helper: 'Notifications when running low'
  }, {
    id: 'asset_tracking',
    label: 'Equipment/Asset Tracking',
    helper: 'Track owned equipment'
  }, {
    id: 'rentals',
    label: 'Rentals',
    helper: 'Rent out equipment, vehicles, space'
  }, {
    id: 'materials',
    label: 'Parts & Materials',
    helper: 'Track job-specific materials'
  }]
}, {
  id: 'communication',
  title: 'Communication & Marketing',
  icon: Megaphone,
  items: [{
    id: 'reminders',
    label: 'Appointment Reminders',
    helper: 'Automated reminder messages'
  }, {
    id: 'sms',
    label: 'SMS / Text Messaging',
    helper: 'Text communication with customers'
  }, {
    id: 'email_marketing',
    label: 'Email Campaigns',
    helper: 'Marketing and promotional emails'
  }, {
    id: 'review_requests',
    label: 'Review Requests',
    helper: 'Ask customers for reviews'
  }, {
    id: 'support',
    label: 'Customer Support / Help Desk',
    helper: 'Handle inquiries and issues'
  }, {
    id: 'live_chat',
    label: 'Live Chat',
    helper: 'Real-time website chat'
  }, {
    id: 'call_tracking',
    label: 'Call Tracking',
    helper: 'Track and record calls'
  }, {
    id: 'social',
    label: 'Social Media Management',
    helper: 'Manage social presence'
  }]
}, {
  id: 'foodHospitality',
  title: 'Food & Hospitality Specific',
  icon: Utensils,
  conditional: types => types.includes('restaurant') || types.includes('hospitality'),
  items: [{
    id: 'table_mgmt',
    label: 'Table Management',
    helper: 'Seating and table assignments'
  }, {
    id: 'menu_mgmt',
    label: 'Menu Management',
    helper: 'Digital menus, pricing, specials'
  }, {
    id: 'kds',
    label: 'Kitchen Display (KDS)',
    helper: 'Orders to kitchen screens'
  }, {
    id: 'catering',
    label: 'Catering',
    helper: 'Large orders for events'
  }, {
    id: 'room_rental',
    label: 'Room/Space Rental',
    helper: 'Rent private rooms or spaces'
  }, {
    id: 'event_planning',
    label: 'Event Planning',
    helper: 'Coordinate events and parties'
  }, {
    id: 'tabs',
    label: 'Tab Management',
    helper: 'Open tabs for customers'
  }, {
    id: 'dietary',
    label: 'Dietary/Allergy Tracking',
    helper: 'Track customer preferences'
  }]
}, {
  id: 'healthcareWellness',
  title: 'Healthcare & Wellness Specific',
  icon: Heart,
  conditional: types => types.includes('healthcare') || types.includes('beauty'),
  items: [{
    id: 'intake',
    label: 'Patient/Client Intake',
    helper: 'Forms and onboarding'
  }, {
    id: 'treatment_plans',
    label: 'Treatment Plans',
    helper: 'Ongoing care documentation'
  }, {
    id: 'hipaa',
    label: 'HIPAA Compliance',
    helper: 'Secure health information'
  }, {
    id: 'insurance',
    label: 'Insurance Billing',
    helper: 'Process insurance claims'
  }, {
    id: 'consent',
    label: 'Consent Forms',
    helper: 'Digital consent collection'
  }, {
    id: 'notes',
    label: 'Progress Notes',
    helper: 'Document session notes'
  }, {
    id: 'telehealth',
    label: 'Telehealth / Virtual Visits',
    helper: 'Remote consultations'
  }]
}, {
  id: 'professionalServices',
  title: 'Professional Services Specific',
  icon: Briefcase,
  conditional: types => types.includes('professional'),
  items: [{
    id: 'case_mgmt',
    label: 'Case Management',
    helper: 'Track client cases/matters'
  }, {
    id: 'doc_mgmt',
    label: 'Document Management',
    helper: 'Store and organize documents'
  }, {
    id: 'retainers',
    label: 'Retainers',
    helper: 'Ongoing service agreements'
  }, {
    id: 'billable_hours',
    label: 'Billable Hours',
    helper: 'Track time for billing'
  }, {
    id: 'reporting',
    label: 'Client Reporting',
    helper: 'Regular status reports'
  }, {
    id: 'pipeline',
    label: 'Deal Pipeline',
    helper: 'Track deals through stages'
  }, {
    id: 'esignature',
    label: 'eSignature',
    helper: 'Digital document signing'
  }]
}];
export function BusinessConfiguratorPage({
  onBack
}: BusinessConfiguratorPageProps) {
  const {
    isDarkMode
  } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(OPERATION_CATEGORIES.map(c => c.id));
  const [profile, setProfile] = useState<BusinessProfile>({
    businessTypes: [],
    customerEngagement: [],
    operations: {
      scheduling: [],
      fieldDelivery: [],
      sales: [],
      customerManagement: [],
      workManagement: [],
      inventory: [],
      communication: [],
      foodHospitality: [],
      healthcareWellness: [],
      professionalServices: []
    },
    otherBusinessType: ''
  });
  // Auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaved(true);
      console.log('Profile saved:', profile);
      setTimeout(() => setIsSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [profile]);
  const toggleBusinessType = (id: string) => {
    setProfile(prev => {
      const exists = prev.businessTypes.includes(id);
      return {
        ...prev,
        businessTypes: exists ? prev.businessTypes.filter(t => t !== id) : [...prev.businessTypes, id]
      };
    });
  };
  const toggleEngagement = (id: string) => {
    setProfile(prev => {
      const exists = prev.customerEngagement.includes(id);
      return {
        ...prev,
        customerEngagement: exists ? prev.customerEngagement.filter(t => t !== id) : [...prev.customerEngagement, id]
      };
    });
  };
  const toggleOperation = (category: keyof BusinessProfile['operations'], id: string) => {
    setProfile(prev => {
      const currentList = prev.operations[category];
      const exists = currentList.includes(id);
      return {
        ...prev,
        operations: {
          ...prev.operations,
          [category]: exists ? currentList.filter(t => t !== id) : [...currentList, id]
        }
      };
    });
  };
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };
  const getTotalOperationsCount = () => {
    return Object.values(profile.operations).reduce((acc, list) => acc + list.length, 0);
  };
  return <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b pt-8 pb-6 px-4 md:px-8`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-500 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs">
              2
            </span>
            <span>Business Setup</span>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Tell Us About Your Business
          </h1>
          <p className={`text-lg max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Help us customize your experience by selecting how your business
            operates. Don't worry—you can change this anytime.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* Info Banner */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} className={`p-4 rounded-xl flex gap-4 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-100'}`}>
          <div className={`p-2 rounded-lg h-fit ${isDarkMode ? 'bg-blue-800/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
              Why does this matter?
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              Your selections customize your dashboard, terminology, AI
              recommendations, and available features. Select everything that
              applies—most businesses do more than one thing!
            </p>
          </div>
        </motion.div>

        {/* Section 1: Business Types */}
        <section>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              What type of business are you?
            </h2>
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Select all that apply. Many businesses fit multiple categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUSINESS_TYPES.map(type => {
            const isSelected = profile.businessTypes.includes(type.id);
            const Icon = type.icon;
            return <motion.div key={type.id} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => toggleBusinessType(type.id)} className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50' : isDarkMode ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  {isSelected && <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isSelected ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {type.title}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {type.description}
                  </p>
                </motion.div>;
          })}
          </div>

          <AnimatePresence>
            {profile.businessTypes.includes('other') && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="mt-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Describe your business type
                </label>
                <input type="text" value={profile.otherBusinessType} onChange={e => setProfile({
              ...profile,
              otherBusinessType: e.target.value
            })} placeholder="e.g., Mobile Pet Grooming & Supply" className={`w-full max-w-md px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`} />
              </motion.div>}
          </AnimatePresence>
        </section>

        {/* Section 2: Customer Engagement */}
        <section>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              How do customers engage with you?
            </h2>
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Select all the ways customers interact with your business.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {ENGAGEMENT_OPTIONS.map(option => {
            const isSelected = profile.customerEngagement.includes(option.id);
            const Icon = option.icon;
            return <motion.button key={option.id} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => toggleEngagement(option.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                </motion.button>;
          })}
          </div>
        </section>

        {/* Section 3: Operations */}
        <section>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              What operations power your business?
            </h2>
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Select the processes and services you need. This helps us show you
              the right tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPERATION_CATEGORIES.map(category => {
            if (category.conditional && !category.conditional(profile.businessTypes)) {
              return null;
            }
            const isExpanded = expandedCategories.includes(category.id);
            const selectedCount = profile.operations[category.id].length;
            const Icon = category.icon;
            return <motion.div key={category.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div onClick={() => toggleCategory(category.id)} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-50 transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedCount > 0 ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {category.title}
                        </h3>
                        {selectedCount > 0 && <p className="text-xs text-blue-500 font-medium">
                            {selectedCount} selected
                          </p>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} /> : <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />}
                  </div>

                  <AnimatePresence>
                    {isExpanded && <motion.div initial={{
                  height: 0
                }} animate={{
                  height: 'auto'
                }} exit={{
                  height: 0
                }} className="overflow-hidden">
                        <div className={`p-4 pt-0 space-y-1 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          {category.items.map(item => {
                      const isChecked = profile.operations[category.id].includes(item.id);
                      return <div key={item.id} onClick={() => toggleOperation(category.id, item.id)} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isChecked ? isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50' : isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                                    {item.label}
                                  </p>
                                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {item.helper}
                                  </p>
                                </div>
                              </div>;
                    })}
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </motion.div>;
          })}
          </div>
        </section>

        {/* Section 4: Summary Preview */}
        <section>
          <div className={`rounded-xl border-2 p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Your Business Profile
              </h2>
              {isSaved && <motion.div initial={{
              opacity: 0,
              x: 10
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0
            }} className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <Save className="w-4 h-4" />
                  Saved
                </motion.div>}
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Business Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.businessTypes.length > 0 ? profile.businessTypes.map(id => {
                  const type = BUSINESS_TYPES.find(t => t.id === id);
                  return <span key={id} className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                          {type?.title}
                        </span>;
                }) : <span className={`text-sm italic ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      None selected
                    </span>}
                </div>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Engagement
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.customerEngagement.length > 0 ? profile.customerEngagement.map(id => {
                  const opt = ENGAGEMENT_OPTIONS.find(o => o.id === id);
                  return <span key={id} className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          {opt?.label}
                        </span>;
                }) : <span className={`text-sm italic ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      None selected
                    </span>}
                </div>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Operations
                </p>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {getTotalOperationsCount()}
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    processes selected
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg text-sm ${isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
              Based on your selections, we'll customize your dashboard with
              relevant widgets, use terminology that fits your industry, and
              recommend AI automations that make sense for your workflow.
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Not sure? You can always change this in Settings
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={onBack} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
              Skip for Now
            </button>
            <button onClick={onBack} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105">
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>;
}