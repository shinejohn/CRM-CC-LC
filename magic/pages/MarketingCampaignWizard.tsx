import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Lightbulb, AlertCircle, Sparkles, ChevronRight, Rocket } from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
async function createOutboundCampaign(payload: {
  name: string;
  type: 'email' | 'sms' | 'phone';
  message: string;
  subject?: string;
  recipient_segments?: Record<string, unknown>;
  scheduled_at?: string;
}) {
  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('tenant_id');
  const res = await fetch(`${API_BASE}/outbound/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(tenantId && { 'X-Tenant-ID': tenantId }),
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || res.statusText);
  }
  return res.json();
}
// TypeScript Interfaces
interface WizardState {
  currentStep: number;
  currentScreenIndex: number;
  // Discovery Data
  businessName: string;
  community: string;
  customerValueRanking: string[];
  businessCategory: 'service' | 'experience' | 'product' | '';
  // Service Business Fields
  serviceProblems?: string;
  howCustomersFind?: string[];
  whyChooseYou?: string[];
  urgencyType?: string;
  // What Works
  currentMarketing?: string[];
  biggestChallenge?: string;
  // Goals
  primaryGoal?: string;
  // Package
  recommendedPackage: 'influencer' | 'sponsor' | 'expert';
  selectedPackage: 'influencer' | 'sponsor' | 'expert' | '';
  // Campaign Plan
  campaignFocus?: string;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventType?: string[];
  eventDescription?: string;
  ticketed?: string;
  enhancements?: string[];
  // Billing
  billingPreference: 'monthly' | 'annual';
  monthlyTotal: number;
}
interface WizardScreen {
  step: number;
  stepName: string;
  title: string;
  subtitle?: string;
  content: ContentBlock[];
  navigation: {
    backEnabled: boolean;
    backLabel?: string;
    nextEnabled: boolean;
    nextLabel?: string;
    nextAction?: 'continue' | 'skip' | 'finish';
  };
}
type ContentBlock = QuestionBlock | RankingBlock | InfoBlock | SelectionGridBlock | PackageComparisonBlock | SummaryBlock | InputBlock | ChecklistBlock;
interface QuestionBlock {
  type: 'question';
  id: string;
  question: string;
  helpText?: string;
  inputType: 'single' | 'multiple' | 'text' | 'textarea';
  options?: Option[];
  placeholder?: string;
  required: boolean;
}
interface Option {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  example?: string;
}
interface RankingBlock {
  type: 'ranking';
  id: string;
  instruction: string;
  items: RankItem[];
  slots: number;
}
interface RankItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  example: string;
}
interface InfoBlock {
  type: 'info';
  variant: 'tip' | 'insight' | 'example' | 'warning';
  icon?: string;
  title: string;
  content: string;
}
interface SelectionGridBlock {
  type: 'selectionGrid';
  id: string;
  instruction?: string;
  selectionType: 'single' | 'multiple';
  columns: 2 | 3 | 4;
  items: GridItem[];
}
interface GridItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
  tag?: string;
}
interface PackageComparisonBlock {
  type: 'packageComparison';
  recommended: 'influencer' | 'sponsor' | 'expert';
  packages: PackageCard[];
}
interface PackageCard {
  id: 'influencer' | 'sponsor' | 'expert';
  name: string;
  tagline: string;
  price: string;
  priceNote?: string;
  highlights: string[];
  bestFor: string;
  isRecommended: boolean;
}
interface SummaryBlock {
  type: 'summary';
  title: string;
  sections: SummarySection[];
  total?: {
    label: string;
    value: string;
    note?: string;
  };
}
interface SummarySection {
  heading: string;
  items: SummaryItem[];
}
interface SummaryItem {
  label: string;
  value?: string;
  included?: boolean;
  note?: string;
}
interface InputBlock {
  type: 'input';
  id: string;
  label: string;
  inputType: 'text' | 'textarea' | 'number' | 'date' | 'time';
  placeholder?: string;
  helpText?: string;
  required: boolean;
}
interface ChecklistBlock {
  type: 'checklist';
  id: string;
  instruction: string;
  minRequired?: number;
  maxAllowed?: number;
  items: ChecklistItem[];
}
interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  price?: string;
}
// Wizard screens data
const getWizardScreens = (state: WizardState): WizardScreen[] => [
// Step 1.1: Business Basics
{
  step: 1,
  stepName: 'Your Customer',
  title: "Let's Start With Your Business",
  subtitle: 'We need to understand who your customers are and why they choose you.',
  content: [{
    type: 'input',
    id: 'businessName',
    label: 'What is the name of your business?',
    inputType: 'text',
    placeholder: "e.g., Murphy's Taproom",
    required: true
  }, {
    type: 'input',
    id: 'community',
    label: 'What community or city are you in?',
    inputType: 'text',
    placeholder: 'e.g., Springfield',
    required: true
  }],
  navigation: {
    backEnabled: false,
    nextEnabled: true,
    nextLabel: 'Continue'
  }
},
// Step 1.2: Customer Value Ranking
{
  step: 1,
  stepName: 'Your Customer',
  title: 'Why Do Customers Choose You?',
  subtitle: 'When someone picks your business over alternatives, what are they really looking for?',
  content: [{
    type: 'info',
    variant: 'tip',
    title: 'Think Like Your Customer',
    content: "Don't think about what YOU do. Think about what your CUSTOMER is trying to get when they choose you."
  }, {
    type: 'ranking',
    id: 'customerValueRanking',
    instruction: 'Rank these 1st, 2nd, and 3rd based on what matters MOST to your customers:',
    slots: 3,
    items: [{
      id: 'solveProblem',
      icon: '🔧',
      label: 'SOLVE MY PROBLEM',
      description: 'They have a problem or need. They want expertise, reliability, and honest pricing.',
      example: 'Plumber fixing a leak, Attorney handling a case, Doctor treating illness'
    }, {
      id: 'giveExperience',
      icon: '🎉',
      label: 'GIVE ME AN EXPERIENCE',
      description: 'They want to have a good time, feel something, or be somewhere enjoyable.',
      example: 'Restaurant date night, Bowling with friends, Concert at a venue'
    }, {
      id: 'sellProduct',
      icon: '🛒',
      label: 'SELL ME SOMETHING',
      description: 'They want a product or thing. Selection, quality, price matter.',
      example: 'Retail shop, Boutique, Bakery buying a cake'
    }]
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Continue'
  }
},
// Step 1.3: Service Business Deep Dive
{
  step: 1,
  stepName: 'Your Customer',
  title: 'Understanding Your Service Customers',
  subtitle: "Your customers come to you because they have a problem to solve. Let's dig deeper.",
  content: [{
    type: 'info',
    variant: 'insight',
    title: "You're a Service Business",
    content: 'Your customers primarily need your expertise. Trust, reliability, and results matter most.'
  }, {
    type: 'input',
    id: 'serviceProblems',
    label: 'What are the top problems that bring customers to you?',
    inputType: 'textarea',
    placeholder: 'List 2-3 main reasons people call you.',
    helpText: 'List 2-3 main reasons people call you.',
    required: true
  }, {
    type: 'ranking',
    id: 'howCustomersFind',
    instruction: 'How do customers find help when they have these problems?',
    slots: 3,
    items: [{
      id: 'searchOnline',
      icon: '🔍',
      label: 'Search online (Google)',
      description: '',
      example: ''
    }, {
      id: 'askFriends',
      icon: '👥',
      label: 'Ask friends/family',
      description: '',
      example: ''
    }, {
      id: 'checkReviews',
      icon: '⭐',
      label: 'Look at reviews',
      description: '',
      example: ''
    }, {
      id: 'callPrevious',
      icon: '📱',
      label: "Call someone they've used",
      description: '',
      example: ''
    }, {
      id: 'seeAd',
      icon: '🚚',
      label: 'See truck/sign/ad',
      description: '',
      example: ''
    }]
  }, {
    type: 'ranking',
    id: 'whyChooseYou',
    instruction: 'Why do they pick YOU over someone else?',
    slots: 3,
    items: [{
      id: 'price',
      icon: '💰',
      label: 'Price / estimate',
      description: '',
      example: ''
    }, {
      id: 'reviews',
      icon: '⭐',
      label: 'Reviews / reputation',
      description: '',
      example: ''
    }, {
      id: 'speed',
      icon: '⚡',
      label: 'Availability / speed',
      description: '',
      example: ''
    }, {
      id: 'credentials',
      icon: '📜',
      label: 'Credentials / certifications',
      description: '',
      example: ''
    }, {
      id: 'referral',
      icon: '🤝',
      label: 'Someone recommended me',
      description: '',
      example: ''
    }, {
      id: 'trust',
      icon: '💬',
      label: 'Trust from first conversation',
      description: '',
      example: ''
    }]
  }, {
    type: 'question',
    id: 'urgencyType',
    question: 'Is your work usually emergency/urgent or planned/scheduled?',
    inputType: 'single',
    options: [{
      id: 'emergency',
      label: 'Emergency',
      description: 'They need me NOW'
    }, {
      id: 'planned',
      label: 'Planned',
      description: 'They have time to shop around'
    }, {
      id: 'both',
      label: 'Both',
      description: 'Depends on the situation'
    }],
    required: true
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Continue'
  }
},
// Step 2: What Works
{
  step: 2,
  stepName: 'What Works',
  title: "What's working (or not) in your marketing?",
  subtitle: 'Help us understand your current situation',
  content: [{
    type: 'question',
    id: 'currentMarketing',
    question: 'What marketing are you doing now?',
    helpText: 'Select all that apply',
    inputType: 'multiple',
    required: true,
    options: [{
      id: 'social',
      label: 'Social Media',
      description: 'Facebook, Instagram, etc.',
      icon: '📱'
    }, {
      id: 'print',
      label: 'Print Advertising',
      description: 'Newspapers, magazines, flyers',
      icon: '📰'
    }, {
      id: 'word-of-mouth',
      label: 'Word of Mouth',
      description: 'Referrals and recommendations',
      icon: '💬'
    }, {
      id: 'events',
      label: 'Events & Sponsorships',
      description: 'Community events, sports teams',
      icon: '🎪'
    }, {
      id: 'none',
      label: 'Not much / Nothing',
      description: "We're just getting started",
      icon: '🌱'
    }]
  }, {
    type: 'question',
    id: 'biggestChallenge',
    question: "What's your biggest marketing challenge?",
    inputType: 'single',
    required: true,
    options: [{
      id: 'awareness',
      label: 'Not enough people know about us',
      icon: '👀'
    }, {
      id: 'trust',
      label: "People don't trust us yet",
      icon: '🤝'
    }, {
      id: 'differentiation',
      label: 'We blend in with competitors',
      icon: '🎯'
    }, {
      id: 'time',
      label: "Don't have time for marketing",
      icon: '⏰'
    }]
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Continue',
    nextAction: 'continue'
  }
},
// Step 3: Your Goal
{
  step: 3,
  stepName: 'Your Goal',
  title: 'What do you want to accomplish?',
  subtitle: 'Choose your primary marketing goal',
  content: [{
    type: 'selectionGrid',
    id: 'primaryGoal',
    instruction: 'Select your main goal for the next 90 days',
    selectionType: 'single',
    columns: 3,
    items: [{
      id: 'awareness',
      icon: '📢',
      label: 'Build Awareness',
      description: 'Get known in the community',
      tag: 'Most Common'
    }, {
      id: 'authority',
      icon: '👑',
      label: 'Establish Authority',
      description: 'Be seen as the expert'
    }, {
      id: 'traffic',
      icon: '🚶',
      label: 'Drive Traffic',
      description: 'Get more people through the door'
    }, {
      id: 'sales',
      icon: '💰',
      label: 'Increase Sales',
      description: 'Boost revenue directly'
    }, {
      id: 'loyalty',
      icon: '❤️',
      label: 'Build Loyalty',
      description: 'Keep customers coming back'
    }, {
      id: 'events',
      icon: '🎉',
      label: 'Promote Events',
      description: 'Fill seats and sell tickets'
    }]
  }, {
    type: 'info',
    variant: 'insight',
    title: 'Goal-Package Alignment',
    content: 'Awareness → Influencer | Authority → Expert | Traffic/Sales → Sponsor | Events → Influencer'
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'See Recommendations',
    nextAction: 'continue'
  }
},
// Step 4: Package Match
{
  step: 4,
  stepName: 'Package Match',
  title: 'Your Recommended Package',
  subtitle: "Based on what you've told us, here's what we recommend.",
  content: [{
    type: 'info',
    variant: 'insight',
    title: 'Why We Recommend Community Influencer',
    content: "You want to dominate your category and lock out competitors. You're an experience business that hosts events. The Influencer package gives you premium placement, event tools, and the scarcity advantage—only 37 spots in Springfield, and 12 are already taken."
  }, {
    type: 'packageComparison',
    recommended: state.recommendedPackage,
    packages: [{
      id: 'influencer',
      name: 'Community Influencer',
      tagline: 'Dominate Your Category',
      price: '$300/month',
      priceNote: 'Limited: Only 37 per community',
      highlights: ['Premium 4-site listing', 'Weekly newsletter feature', '1 article/month', '1 premium event/month', '25% off all advertising', '180-day AI trial'],
      bestFor: 'Businesses wanting market dominance and competitive lockout',
      isRecommended: state.recommendedPackage === 'influencer'
    }, {
      id: 'sponsor',
      name: 'Community Sponsor',
      tagline: 'Visibility & Association',
      price: '$299/month',
      priceNote: 'Unlimited availability',
      highlights: ['Premium ad placement', 'Event sponsorships', 'Community partnerships', 'Brand visibility'],
      bestFor: 'Brands wanting awareness without operational tools',
      isRecommended: state.recommendedPackage === 'sponsor'
    }, {
      id: 'expert',
      name: 'Community Expert',
      tagline: 'Build Your Authority',
      price: 'Custom',
      priceNote: 'Based on content volume',
      highlights: ['Regular articles', 'Expert profile', 'Thought leadership positioning', 'Author/creator status'],
      bestFor: 'Professionals building personal brand through expertise',
      isRecommended: state.recommendedPackage === 'expert'
    }]
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Select & Continue'
  }
},
// Step 5.1: Campaign Focus
{
  step: 5,
  stepName: 'Plan It',
  title: 'Build Your First Campaign',
  subtitle: "You have Community Influencer. Now let's plan how to use it.",
  content: [{
    type: 'info',
    variant: 'tip',
    title: "What's Included in Your Package",
    content: 'Your Community Influencer package includes: Premium 4-site profile, Weekly newsletter, 1 article/month, 1 premium event/month, 5 announcements, 5 classifieds, 25% ad discount, and 180-day AI trial.'
  }, {
    type: 'question',
    id: 'campaignFocus',
    question: 'What do you want to focus on FIRST?',
    helpText: "We'll help you build a specific campaign for this goal.",
    inputType: 'single',
    options: [{
      id: 'specificEvent',
      icon: '🎉',
      label: 'Promote a specific upcoming event',
      description: 'You have an event coming up and want to fill the room'
    }, {
      id: 'monthlyRhythm',
      icon: '📅',
      label: 'Create a monthly signature event',
      description: 'Build something recurring that people look forward to'
    }, {
      id: 'fillSlowTimes',
      icon: '📉',
      label: 'Fill slow days or times',
      description: 'Get more people in during your quiet periods'
    }, {
      id: 'tellStory',
      icon: '📰',
      label: 'Tell our story / build reputation',
      description: 'Get an article written about what makes you special'
    }, {
      id: 'moreCustomers',
      icon: '📈',
      label: 'Just get more customers in general',
      description: 'Maximize visibility and discoverability'
    }],
    required: true
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Continue'
  }
},
// Step 5.2: Event Details
{
  step: 5,
  stepName: 'Plan It',
  title: "Let's Build Your Event",
  subtitle: 'Use your included premium event for maximum impact.',
  content: [{
    type: 'input',
    id: 'eventName',
    label: 'What will you call this event?',
    inputType: 'text',
    placeholder: "e.g., First Friday at Murphy's, Grand Opening, Wine Tasting Night",
    required: true
  }, {
    type: 'input',
    id: 'eventDate',
    label: 'When is it?',
    inputType: 'date',
    required: true
  }, {
    type: 'input',
    id: 'eventTime',
    label: 'What time?',
    inputType: 'text',
    placeholder: 'e.g., 7:00 PM - 10:00 PM',
    required: true
  }, {
    type: 'selectionGrid',
    id: 'eventType',
    instruction: 'What type of event is this? (Select all that apply)',
    selectionType: 'multiple',
    columns: 3,
    items: [{
      id: 'liveMusic',
      icon: '🎵',
      label: 'Live Music'
    }, {
      id: 'dj',
      icon: '🎧',
      label: 'DJ'
    }, {
      id: 'tasting',
      icon: '🍷',
      label: 'Tasting'
    }, {
      id: 'trivia',
      icon: '🧠',
      label: 'Trivia'
    }, {
      id: 'class',
      icon: '📚',
      label: 'Class/Workshop'
    }, {
      id: 'party',
      icon: '🎉',
      label: 'Party/Celebration'
    }, {
      id: 'networking',
      icon: '🤝',
      label: 'Networking'
    }, {
      id: 'sale',
      icon: '🏷️',
      label: 'Sale/Promotion'
    }, {
      id: 'other',
      icon: '✨',
      label: 'Other'
    }]
  }, {
    type: 'input',
    id: 'eventDescription',
    label: 'Describe the event in 2-3 sentences',
    inputType: 'textarea',
    placeholder: 'What should people know? What makes it special?',
    required: true
  }, {
    type: 'question',
    id: 'ticketed',
    question: 'Will you sell tickets?',
    inputType: 'single',
    options: [{
      id: 'yes',
      label: 'Yes, paid tickets',
      description: "We'll set up ticketing (5.9% + $0.99/ticket with Influencer discount)"
    }, {
      id: 'free',
      label: 'Free event',
      description: 'No ticket required'
    }, {
      id: 'rsvp',
      label: 'Free but RSVP required',
      description: 'Track attendance without charging'
    }],
    required: true
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Continue'
  }
},
// Step 5.3: Enhance Campaign
{
  step: 5,
  stepName: 'Plan It',
  title: 'Enhance Your Campaign',
  subtitle: "These add-ons will amplify your event's reach.",
  content: [{
    type: 'info',
    variant: 'insight',
    title: 'Your Package Already Includes',
    content: '✓ Premium Event listing (featured placement)\n✓ Newsletter mention\n✓ 25% off any ads you add'
  }, {
    type: 'checklist',
    id: 'enhancements',
    instruction: 'Want to add any of these? (All optional)',
    items: [{
      id: 'headliner',
      label: 'Headliner Status',
      description: 'Top of ALL event searches, featured showcase',
      price: '+$75/month'
    }, {
      id: 'article',
      label: 'Pre-Event Article',
      description: 'Use your included article to build anticipation',
      price: 'Included ✓'
    }, {
      id: 'secondCommunity',
      label: '2nd Community Coverage',
      description: 'Reach people in a neighboring community',
      price: '+$50/month'
    }, {
      id: 'textAlerts',
      label: 'Text/SMS Alerts',
      description: 'Send reminder to subscribers',
      price: '$0.10/message'
    }, {
      id: 'calendarInvites',
      label: 'Calendar Invites',
      description: "Push to interested subscribers' calendars",
      price: '+$15/month'
    }]
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: 'Review Plan'
  }
},
// Step 6: Launch
{
  step: 6,
  stepName: 'Launch',
  title: 'Your Campaign is Ready',
  subtitle: 'Review everything and launch when ready.',
  content: [{
    type: 'summary',
    title: 'Campaign Summary',
    sections: [{
      heading: 'Package',
      items: [{
        label: 'Community Influencer',
        value: '$300/mo',
        included: true,
        note: `Slot #23 of 37 in ${state.community || 'Springfield'}`
      }]
    }, {
      heading: 'Included With Package',
      items: [{
        label: 'Premium 4-Site Profile',
        included: true
      }, {
        label: 'Weekly Newsletter Feature',
        included: true
      }, {
        label: '1 Article/Month',
        included: true
      }, {
        label: '1 Premium Event/Month',
        included: true
      }, {
        label: '25% Ad Discount',
        included: true
      }, {
        label: '180-Day AI Trial',
        included: true
      }]
    }, {
      heading: `Your First Campaign: ${state.eventName || "First Friday at Murphy's"}`,
      items: [{
        label: 'Event Date',
        value: state.eventDate || 'March 7, 2025'
      }, {
        label: 'Premium Event Listing',
        included: true,
        note: 'Included'
      }, ...(state.enhancements?.includes('headliner') ? [{
        label: 'Headliner Status',
        value: '+$75/mo'
      }] : []), ...(state.enhancements?.includes('article') ? [{
        label: 'Pre-Event Article',
        included: true,
        note: 'Using included article'
      }] : [])]
    }, ...(state.enhancements && state.enhancements.length > 0 ? [{
      heading: 'Add-Ons',
      items: state.enhancements.filter(e => e === 'headliner' || e === 'secondCommunity').map(e => ({
        label: e === 'headliner' ? 'Headliner Status' : '2nd Community Coverage',
        value: e === 'headliner' ? '+$75/mo' : '+$50/mo'
      }))
    }] : [])],
    total: {
      label: 'Monthly Total',
      value: `$${state.monthlyTotal}/month`,
      note: `Annual option: $${Math.round(state.monthlyTotal * 12 * 0.85)}/year (Save 15%)`
    }
  }, {
    type: 'question',
    id: 'billingPreference',
    question: 'How would you like to pay?',
    inputType: 'single',
    options: [{
      id: 'monthly',
      label: 'Monthly',
      description: `$${state.monthlyTotal}/month`
    }, {
      id: 'annual',
      label: 'Annual (Save 15%)',
      description: `$${Math.round(state.monthlyTotal * 12 * 0.85 / 12)}/month billed annually`
    }],
    required: true
  }],
  navigation: {
    backEnabled: true,
    nextEnabled: true,
    nextLabel: '🚀 Launch Campaign',
    nextAction: 'finish'
  }
}];
// Package recommendation logic
function recommendPackage(state: WizardState): 'influencer' | 'sponsor' | 'expert' {
  const {
    businessCategory,
    primaryGoal,
    biggestChallenge
  } = state;
  // Service business wanting credibility/expertise → Expert
  if (businessCategory === 'service' && (primaryGoal === 'authority' || biggestChallenge === 'trust')) {
    return 'expert';
  }
  // Any business wanting brand awareness without operations → Sponsor
  if (primaryGoal === 'awareness' && biggestChallenge !== 'time' && !['events', 'traffic'].includes(primaryGoal || '')) {
    return 'sponsor';
  }
  // Default: Influencer (dominance, events, full toolkit)
  return 'influencer';
}
// Calculate monthly total
function calculateMonthlyTotal(state: WizardState): number {
  let total = 300; // Base Influencer package
  if (state.enhancements?.includes('headliner')) total += 75;
  if (state.enhancements?.includes('secondCommunity')) total += 50;
  if (state.enhancements?.includes('calendarInvites')) total += 15;
  return total;
}
export function MarketingCampaignWizard() {
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    currentScreenIndex: 0,
    businessName: '',
    community: '',
    customerValueRanking: [],
    businessCategory: '',
    recommendedPackage: 'influencer',
    selectedPackage: '',
    billingPreference: 'monthly',
    monthlyTotal: 300
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rankedItems, setRankedItems] = useState<Record<string, string[]>>({});
  const wizardScreens = getWizardScreens(state);
  const currentScreen = wizardScreens[state.currentScreenIndex];
  const totalSteps = 6;
  useEffect(() => {
    // Update recommended package when relevant state changes
    const recommended = recommendPackage(state);
    if (recommended !== state.recommendedPackage) {
      setState(prev => ({
        ...prev,
        recommendedPackage: recommended
      }));
    }
  }, [state.businessCategory, state.primaryGoal, state.biggestChallenge]);
  useEffect(() => {
    // Update monthly total when enhancements change
    const total = calculateMonthlyTotal(state);
    if (total !== state.monthlyTotal) {
      setState(prev => ({
        ...prev,
        monthlyTotal: total
      }));
    }
  }, [state.enhancements]);
  const handleNext = async () => {
    if (currentScreen.navigation.nextAction === 'finish') {
      setLaunching(true);
      setLaunchError(null);
      try {
        const campaignName = state.eventName || state.campaignFocus || `Campaign for ${state.businessName}`;
        const message = [
          state.businessName && `Hello from ${state.businessName}!`,
          state.community && `We're based in ${state.community}.`,
          state.eventName && state.eventDate && `Join us for ${state.eventName} on ${state.eventDate}.`,
          state.eventDescription && state.eventDescription,
        ].filter(Boolean).join('\n\n') || `Welcome! We're excited to connect with you from ${state.businessName || 'our business'}.`;
        await createOutboundCampaign({
          name: campaignName,
          type: 'email',
          subject: state.eventName || `Update from ${state.businessName || 'Us'}`,
          message,
          recipient_segments: { has_email: true },
        });
        setLaunchSuccess(true);
      } catch (err) {
        setLaunchError(err instanceof Error ? err.message : 'Failed to launch campaign');
      } finally {
        setLaunching(false);
      }
      return;
    }
    // Routing logic based on customer value ranking
    if (state.currentScreenIndex === 1 && state.customerValueRanking.length === 3) {
      const topValue = state.customerValueRanking[0];
      let category: 'service' | 'experience' | 'product' = 'service';
      if (topValue === 'solveProblem') {
        category = 'service';
      } else if (topValue === 'giveExperience') {
        category = 'experience';
      } else if (topValue === 'sellProduct') {
        category = 'product';
      }
      setState(prev => ({
        ...prev,
        businessCategory: category
      }));
      // For now, service business goes to step 1.3, others skip to step 2
      if (category === 'service') {
        setState(prev => ({
          ...prev,
          currentScreenIndex: 2
        }));
        return;
      } else {
        // Skip to step 2
        setState(prev => ({
          ...prev,
          currentScreenIndex: 3,
          currentStep: 2
        }));
        return;
      }
    }
    // Normal progression
    if (state.currentScreenIndex < wizardScreens.length - 1) {
      const nextIndex = state.currentScreenIndex + 1;
      const nextScreen = wizardScreens[nextIndex];
      setState(prev => ({
        ...prev,
        currentScreenIndex: nextIndex,
        currentStep: nextScreen.step
      }));
    }
  };
  const handleBack = () => {
    if (state.currentScreenIndex > 0) {
      const prevIndex = state.currentScreenIndex - 1;
      const prevScreen = wizardScreens[prevIndex];
      setState(prev => ({
        ...prev,
        currentScreenIndex: prevIndex,
        currentStep: prevScreen.step
      }));
    }
  };
  const handleAnswer = (blockId: string, value: any) => {
    setState(prev => ({
      ...prev,
      [blockId]: value
    }));
  };
  const handleRanking = (blockId: string, items: string[]) => {
    setRankedItems(prev => ({
      ...prev,
      [blockId]: items
    }));
    setState(prev => ({
      ...prev,
      [blockId]: items
    }));
  };
  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'question':
        return <QuestionBlockComponent key={block.id} block={block} value={state[block.id as keyof WizardState]} onAnswer={handleAnswer} />;
      case 'ranking':
        return <RankingBlockComponent key={block.id} block={block} rankedItems={rankedItems[block.id] || []} setRankedItems={items => handleRanking(block.id, items)} />;
      case 'info':
        return <InfoBlockComponent key={`info-${block.title}`} block={block} />;
      case 'selectionGrid':
        return <SelectionGridBlockComponent key={block.id} block={block} value={state[block.id as keyof WizardState]} onAnswer={handleAnswer} />;
      case 'packageComparison':
        return <PackageComparisonBlockComponent key="package-comparison" block={block} onSelect={pkgId => setState(prev => ({
          ...prev,
          selectedPackage: pkgId
        }))} />;
      case 'summary':
        return <SummaryBlockComponent key="summary" block={block} />;
      case 'input':
        return <InputBlockComponent key={block.id} block={block} value={state[block.id as keyof WizardState]} onAnswer={handleAnswer} />;
      case 'checklist':
        return <ChecklistBlockComponent key={block.id} block={block} value={state[block.id as keyof WizardState]} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-[#666666] mb-2">
            <span>Learning Center</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1E3A5F] font-medium">
              Build Your Campaign
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            Marketing Campaign Builder
          </h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {['Your Customer', 'What Works', 'Your Goal', 'Package Match', 'Plan It', 'Launch'].map((stepName, index) => <div key={stepName} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${index + 1 < state.currentStep ? 'bg-[#1E3A5F] text-white' : index + 1 === state.currentStep ? 'bg-[#1E3A5F] text-white ring-4 ring-[#1E3A5F]/20' : 'bg-[#E5E5E5] text-[#666666]'}`}>
                    {index + 1 < state.currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${index + 1 === state.currentStep ? 'text-[#1E3A5F]' : 'text-[#666666]'}`}>
                    {stepName}
                  </span>
                </div>
                {index < 5 && <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${index + 1 < state.currentStep ? 'bg-[#1E3A5F]' : 'bg-[#E5E5E5]'}`} />}
              </div>)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={state.currentScreenIndex} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }}>
                {/* Title */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">
                    {currentScreen.title}
                  </h2>
                  {currentScreen.subtitle && <p className="text-lg text-[#666666]">
                      {currentScreen.subtitle}
                    </p>}
                </div>

                {/* Content Blocks */}
                <div className="space-y-6">
                  {currentScreen.content.map(block => renderContentBlock(block))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#E5E5E5]">
                  <button onClick={handleBack} disabled={!currentScreen.navigation.backEnabled} className="flex items-center gap-2 px-6 py-3 text-[#666666] hover:text-[#1a1a1a] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ArrowLeft className="w-5 h-5" />
                    {currentScreen.navigation.backLabel || 'Back'}
                  </button>

                  {launchSuccess ? (
                    <div className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-bold">
                      <Check className="w-5 h-5" /> Campaign Launched!
                    </div>
                  ) : (
                    <>
                      {launchError && (
                        <div className="absolute top-0 left-0 right-0 -translate-y-full mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                          {launchError}
                        </div>
                      )}
                      <button
                        onClick={() => handleNext()}
                        disabled={launching}
                        className="flex items-center gap-2 px-8 py-3 bg-[#1E3A5F] text-white rounded-lg font-bold hover:bg-[#2D5A8A] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {launching ? 'Launching...' : (currentScreen.navigation.nextLabel || 'Continue')}
                        {currentScreen.navigation.nextAction === 'finish' ? <Rocket className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          {sidebarOpen && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} className="w-80 bg-white rounded-xl border border-[#E5E5E5] p-6 h-fit sticky top-24">
              <h3 className="font-bold text-[#1a1a1a] mb-4">Your Progress</h3>
              <div className="space-y-4">
                {state.businessName && <div>
                    <div className="text-sm text-[#666666] mb-1">Business</div>
                    <div className="font-medium text-[#1a1a1a]">
                      {state.businessName}
                    </div>
                  </div>}
                {state.community && <div>
                    <div className="text-sm text-[#666666] mb-1">Community</div>
                    <div className="font-medium text-[#1a1a1a]">
                      {state.community}
                    </div>
                  </div>}
                {state.businessCategory && <div>
                    <div className="text-sm text-[#666666] mb-1">
                      Business Type
                    </div>
                    <div className="font-medium text-[#1a1a1a] capitalize">
                      {state.businessCategory}
                    </div>
                  </div>}
                <div>
                  <div className="text-sm text-[#666666] mb-1">
                    Recommended Package
                  </div>
                  <div className="font-medium text-[#8B5CF6] capitalize">
                    Community {state.recommendedPackage}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#666666] mb-1">
                    Est. Investment
                  </div>
                  <div className="font-bold text-xl text-[#1a1a1a]">
                    ${state.monthlyTotal}/month
                  </div>
                </div>
              </div>
            </motion.div>}
        </div>
      </div>
    </div>;
}
// Component implementations (keeping existing implementations)
function QuestionBlockComponent({
  block,
  value,
  onAnswer
}: {
  block: QuestionBlock;
  value: any;
  onAnswer: (id: string, value: any) => void;
}) {
  const [selected, setSelected] = useState<string | string[]>(value || (block.inputType === 'multiple' ? [] : ''));
  const handleSelect = (optionId: string) => {
    if (block.inputType === 'single') {
      setSelected(optionId);
      onAnswer(block.id, optionId);
    } else if (block.inputType === 'multiple') {
      const current = Array.isArray(selected) ? selected : [];
      const newSelected = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
      setSelected(newSelected);
      onAnswer(block.id, newSelected);
    }
  };
  const handleTextChange = (val: string) => {
    setSelected(val);
    onAnswer(block.id, val);
  };
  if (block.inputType === 'text' || block.inputType === 'textarea') {
    return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
          {block.question}
        </h3>
        {block.helpText && <p className="text-[#666666] mb-6">{block.helpText}</p>}
        {block.inputType === 'textarea' ? <textarea value={typeof selected === 'string' ? selected : ''} onChange={e => handleTextChange(e.target.value)} placeholder={block.placeholder} className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1E3A5F] transition-colors resize-none" rows={4} /> : <input type="text" value={typeof selected === 'string' ? selected : ''} onChange={e => handleTextChange(e.target.value)} placeholder={block.placeholder} className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1E3A5F] transition-colors" />}
      </div>;
  }
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
        {block.question}
      </h3>
      {block.helpText && <p className="text-[#666666] mb-6">{block.helpText}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {block.options?.map(option => {
        const isSelected = Array.isArray(selected) ? selected.includes(option.id) : selected === option.id;
        return <button key={option.id} onClick={() => handleSelect(option.id)} className={`p-6 rounded-lg border-2 transition-all text-left ${isSelected ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-[#E5E5E5] hover:border-[#1E3A5F]/30'}`}>
              <div className="flex items-start gap-4">
                {option.icon && <span className="text-3xl">{option.icon}</span>}
                <div className="flex-1">
                  <div className="font-bold text-[#1a1a1a] mb-1">
                    {option.label}
                  </div>
                  {option.description && <div className="text-sm text-[#666666] mb-2">
                      {option.description}
                    </div>}
                  {option.example && <div className="text-xs text-[#666666] italic">
                      Example: {option.example}
                    </div>}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#1E3A5F] border-[#1E3A5F]' : 'border-[#E5E5E5]'}`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>;
      })}
      </div>
    </div>;
}
function RankingBlockComponent({
  block,
  rankedItems,
  setRankedItems
}: {
  block: RankingBlock;
  rankedItems: string[];
  setRankedItems: (items: string[]) => void;
}) {
  const handleRank = (itemId: string) => {
    if (rankedItems.includes(itemId)) {
      setRankedItems(rankedItems.filter(id => id !== itemId));
    } else if (rankedItems.length < block.slots) {
      setRankedItems([...rankedItems, itemId]);
    }
  };
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">
        {block.instruction}
      </h3>
      <p className="text-[#666666] mb-6">Click to rank (1st, 2nd, 3rd)</p>

      <div className="space-y-4">
        {block.items.map(item => {
        const rank = rankedItems.indexOf(item.id) + 1;
        return <button key={item.id} onClick={() => handleRank(item.id)} className={`w-full p-6 rounded-lg border-2 transition-all text-left ${rank > 0 ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-[#E5E5E5] hover:border-[#1E3A5F]/30'}`}>
              <div className="flex items-start gap-4">
                {rank > 0 && <div className="w-10 h-10 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold flex-shrink-0">
                    {rank}
                  </div>}
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-[#1a1a1a] mb-1">
                    {item.label}
                  </div>
                  {item.description && <div className="text-sm text-[#666666] mb-2">
                      {item.description}
                    </div>}
                  {item.example && <div className="text-xs text-[#666666] italic">
                      Example: {item.example}
                    </div>}
                </div>
              </div>
            </button>;
      })}
      </div>
    </div>;
}
function InfoBlockComponent({
  block
}: {
  block: InfoBlock;
}) {
  const variantStyles = {
    tip: 'border-l-4 border-[#00CC6A] bg-[#E6FFF2]',
    insight: 'border-l-4 border-[#1E3A5F] bg-[#1E3A5F]/5',
    example: 'border-l-4 border-[#8B5CF6] bg-[#8B5CF6]/5',
    warning: 'border-l-4 border-[#FFB800] bg-[#FFF9E6]'
  };
  const icons = {
    tip: <Lightbulb className="w-5 h-5 text-[#00CC6A]" />,
    insight: <Sparkles className="w-5 h-5 text-[#1E3A5F]" />,
    example: <Sparkles className="w-5 h-5 text-[#8B5CF6]" />,
    warning: <AlertCircle className="w-5 h-5 text-[#FFB800]" />
  };
  return <div className={`p-6 rounded-lg ${variantStyles[block.variant]}`}>
      <div className="flex items-start gap-3">
        {icons[block.variant]}
        <div className="flex-1">
          <h4 className="font-bold text-[#1a1a1a] mb-2">{block.title}</h4>
          <p className="text-[#1a1a1a]/80 leading-relaxed whitespace-pre-line">
            {block.content}
          </p>
        </div>
      </div>
    </div>;
}
function SelectionGridBlockComponent({
  block,
  value,
  onAnswer
}: {
  block: SelectionGridBlock;
  value: any;
  onAnswer: (id: string, value: any) => void;
}) {
  const [selected, setSelected] = useState<string | string[]>(value || (block.selectionType === 'multiple' ? [] : ''));
  const handleSelect = (itemId: string) => {
    if (block.selectionType === 'single') {
      setSelected(itemId);
      onAnswer(block.id, itemId);
    } else {
      const current = Array.isArray(selected) ? selected : [];
      const newSelected = current.includes(itemId) ? current.filter(id => id !== itemId) : [...current, itemId];
      setSelected(newSelected);
      onAnswer(block.id, newSelected);
    }
  };
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };
  const isSelected = (itemId: string) => Array.isArray(selected) ? selected.includes(itemId) : selected === itemId;
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
      {block.instruction && <p className="text-[#666666] mb-6">{block.instruction}</p>}

      <div className={`grid ${gridCols[block.columns]} gap-4`}>
        {block.items.map(item => <button key={item.id} onClick={() => handleSelect(item.id)} className={`p-6 rounded-lg border-2 transition-all ${isSelected(item.id) ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-[#E5E5E5] hover:border-[#1E3A5F]/30'}`}>
            <div className="text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="font-bold text-[#1a1a1a] mb-1">{item.label}</div>
              {item.description && <div className="text-sm text-[#666666]">{item.description}</div>}
              {item.tag && <div className="mt-2 inline-block px-2 py-1 bg-[#FFB800]/20 text-[#FFB800] text-xs font-medium rounded">
                  {item.tag}
                </div>}
            </div>
          </button>)}
      </div>
    </div>;
}
function PackageComparisonBlockComponent({
  block,
  onSelect
}: {
  block: PackageComparisonBlock;
  onSelect: (pkgId: 'influencer' | 'sponsor' | 'expert') => void;
}) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {block.packages.map(pkg => <div key={pkg.id} className={`bg-white rounded-xl border-2 p-6 ${pkg.isRecommended ? 'border-[#1E3A5F] shadow-xl' : 'border-[#E5E5E5]'}`}>
          {pkg.isRecommended && <div className="mb-4 px-3 py-1 bg-[#1E3A5F] text-white text-sm font-bold rounded inline-block">
              ⭐ RECOMMENDED
            </div>}

          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{pkg.name}</h3>
          <p className="text-[#666666] mb-4">{pkg.tagline}</p>

          <div className="mb-6">
            <div className="text-3xl font-bold text-[#1a1a1a] mb-1">
              {pkg.price}
            </div>
            {pkg.priceNote && <div className="text-sm text-[#666666]">{pkg.priceNote}</div>}
          </div>

          <div className="space-y-3 mb-6">
            {pkg.highlights.map((highlight, idx) => <div key={idx} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#00CC6A] flex-shrink-0 mt-0.5" />
                <span className="text-[#1a1a1a]">{highlight}</span>
              </div>)}
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <div className="text-sm text-[#666666] mb-2">Best for:</div>
            <div className="text-[#1a1a1a] font-medium">{pkg.bestFor}</div>
          </div>

          <button onClick={() => onSelect(pkg.id)} className={`w-full mt-6 py-3 rounded-lg font-bold transition-all ${pkg.isRecommended ? 'bg-[#1E3A5F] text-white hover:bg-[#2D5A8A]' : 'bg-[#E5E5E5] text-[#1a1a1a] hover:bg-[#E5E5E5]/70'}`}>
            Select This
          </button>
        </div>)}
    </div>;
}
function SummaryBlockComponent({
  block
}: {
  block: SummaryBlock;
}) {
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
      <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6">{block.title}</h3>

      <div className="space-y-6">
        {block.sections.map((section, idx) => <div key={idx}>
            <h4 className="font-bold text-[#1a1a1a] mb-3">{section.heading}</h4>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => <div key={itemIdx} className="flex items-center justify-between p-3 bg-[#FAFAF8] rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.included && <Check className="w-5 h-5 text-[#00CC6A]" />}
                    <span className="text-[#1a1a1a]">{item.label}</span>
                    {item.note && <span className="text-xs text-[#666666]">
                        ({item.note})
                      </span>}
                  </div>
                  {item.value && <span className="font-medium text-[#1a1a1a]">
                      {item.value}
                    </span>}
                </div>)}
            </div>
          </div>)}
      </div>

      {block.total && <div className="mt-6 pt-6 border-t-2 border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-[#1a1a1a]">
              {block.total.label}
            </span>
            <span className="text-2xl font-bold text-[#1a1a1a]">
              {block.total.value}
            </span>
          </div>
          {block.total.note && <p className="text-sm text-[#666666]">{block.total.note}</p>}
        </div>}
    </div>;
}
function InputBlockComponent({
  block,
  value,
  onAnswer
}: {
  block: InputBlock;
  value: any;
  onAnswer: (id: string, value: any) => void;
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const handleChange = (val: string) => {
    setInputValue(val);
    onAnswer(block.id, val);
  };
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
      <label className="block mb-2 font-bold text-[#1a1a1a]">
        {block.label}
      </label>
      {block.helpText && <p className="text-sm text-[#666666] mb-4">{block.helpText}</p>}

      {block.inputType === 'textarea' ? <textarea value={inputValue} placeholder={block.placeholder} onChange={e => handleChange(e.target.value)} className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1E3A5F] transition-colors resize-none" rows={4} /> : <input type={block.inputType} value={inputValue} placeholder={block.placeholder} onChange={e => handleChange(e.target.value)} className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1E3A5F] transition-colors" />}
    </div>;
}
function ChecklistBlockComponent({
  block,
  value,
  onAnswer
}: {
  block: ChecklistBlock;
  value: any;
  onAnswer: (id: string, value: any) => void;
}) {
  const [selected, setSelected] = useState<string[]>(value || []);
  const handleToggle = (itemId: string) => {
    const newSelected = selected.includes(itemId) ? selected.filter(id => id !== itemId) : [...selected, itemId];
    setSelected(newSelected);
    onAnswer(block.id, newSelected);
  };
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
      <p className="text-[#666666] mb-6">{block.instruction}</p>

      <div className="space-y-4">
        {block.items.map(item => <label key={item.id} className="flex items-start gap-4 p-4 rounded-lg border-2 border-[#E5E5E5] hover:border-[#1E3A5F]/30 cursor-pointer transition-all">
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => handleToggle(item.id)} className="w-5 h-5 text-[#1E3A5F] border-[#E5E5E5] rounded focus:ring-2 focus:ring-[#1E3A5F]/20 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-[#1a1a1a] mb-1">{item.label}</div>
              {item.description && <div className="text-sm text-[#666666]">{item.description}</div>}
            </div>
            {item.price && <div className="font-bold text-[#1a1a1a]">{item.price}</div>}
          </label>)}
      </div>
    </div>;
}