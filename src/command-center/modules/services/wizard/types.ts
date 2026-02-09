export interface ServicePurchaseWizardProps {
    smb: {
        id: string;
        name: string;
        businessType: string; // restaurant, retail, professional_services, venue, home_services
        profileCompletion: number;
        category: string; // For scarcity messaging
    };
    accountManager: {
        name: string;
        avatar: string;
        specialty: string;
    };
    onComplete: (order: Order) => void;
    onCancel: () => void;
    initialStep?: number;
    preSelectedService?: string;
}

export interface WizardState {
    currentStep: number; // 1-8
    selectedOutcome: string | null;
    selectedServices: CartItem[];
    selectedAddOns: CartItem[]; // Add-ons are also cart items
    complementaryServices: CartItem[]; // Suggestions that were accepted
    configuration: Record<string, ServiceConfig>;
    bundleRecommendation: BundleRecommendation | null;
    upgradeToBundle: boolean;
    promoCode: string | null;
    paymentMethod: PaymentMethod | null;
}

export interface Order {
    id?: string;
    items: CartItem[];
    total: number;
    customer: ServicePurchaseWizardProps['smb'];
    paymentMethod: PaymentMethod;
    date: string;
}

export interface CartItem {
    serviceId: string;
    serviceName: string;
    publication: 'DN' | 'DTG' | 'GEC' | 'Alphasite' | 'AI' | 'Community';
    price: number;
    billingFrequency: 'monthly' | 'quarterly' | 'annual' | 'one-time' | 'per-event';
    quantity: number;
    isAddOn: boolean;
    parentServiceId?: string; // If this is an add-on
    configuration?: ServiceConfig;
    description?: string;
}

export interface ServiceConfig {
    duration?: 'monthly' | 'quarterly' | 'annual';
    eventsPerMonth?: number | 'custom';
    startDate?: string;
    // Add other dynamic config fields as needed
    [key: string]: any;
}

export interface BundleRecommendation {
    id: string;
    name: string;
    price: number;
    value: number;
    items: string[]; // List of service names or descriptions included
    Savings: number;
}

export interface PaymentMethod {
    type: 'credit_card' | 'ach' | 'invoice';
    last4?: string;
    expiry?: string;
}

export interface Outcome {
    id: string;
    icon: string; // Lucide icon name
    title: string;
    description: string;
    serviceCount: number;
    badge: string | null;
}

export interface ServiceDefinition {
    id: string;
    name: string;
    description: string;
    publication: 'DN' | 'DTG' | 'GEC' | 'Alphasite' | 'AI' | 'Community';
    price: number;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time' | 'per-event';
    badges?: string[];
    outcomes: string[]; // Outcome IDs
    isAddOnFor?: string[]; // Service IDs this is an add-on for
    complementaryTo?: string[]; // Service IDs this pairs well with
}

export const OUTCOMES: Outcome[] = [
    {
        id: 'get_found',
        icon: 'Search',
        title: 'Get Found',
        description: 'Be discovered when people search',
        serviceCount: 7,
        badge: null
    },
    {
        id: 'attract',
        icon: 'Target',
        title: 'Attract Customers',
        description: 'Advertising & promotion',
        serviceCount: 8,
        badge: 'Most Popular'
    },
    {
        id: 'reputation',
        icon: 'Star',
        title: 'Build Reputation',
        description: 'Awards & recognition',
        serviceCount: 7,
        badge: null
    },
    {
        id: 'events',
        icon: 'Calendar',
        title: 'Promote Events & Offers',
        description: 'Events, coupons, announcements',
        serviceCount: 10,
        badge: null
    },
    {
        id: 'top_of_mind',
        icon: 'MessageCircle',
        title: 'Stay Top of Mind',
        description: 'Social & content',
        serviceCount: 7,
        badge: null
    },
    {
        id: 'automate',
        icon: 'Bot',
        title: 'Automate Marketing',
        description: 'AI & automation',
        serviceCount: 7,
        badge: null
    }
];

export const PUBLICATION_BADGES = {
    DN: { label: 'DN', color: '#3b82f6', fullName: 'Daily News' },
    DTG: { label: 'DTG', color: '#10b981', fullName: 'Directory To-Go' },
    GEC: { label: 'GEC', color: '#f59e0b', fullName: 'Events Calendar' },
    Alphasite: { label: 'AS', color: '#8b5cf6', fullName: 'Alphasite' },
    AI: { label: 'AI', color: '#ec4899', fullName: 'AI Services' },
    Community: { label: 'COM', color: '#6366f1', fullName: 'Community' }
};

// Mock Services Data based on the prompt
export const SERVICES: ServiceDefinition[] = [
    {
        id: 'gec_premium_event',
        name: 'GEC Premium Event',
        description: 'Get priority placement and premium features for your events.',
        publication: 'GEC',
        price: 99,
        frequency: 'monthly',
        badges: ['Popular'],
        outcomes: ['events', 'attract'],
    },
    {
        id: 'dn_announcements',
        name: 'DN Announcements',
        description: 'Share business news with the community.',
        publication: 'DN',
        price: 25,
        frequency: 'one-time', // based on $25/each
        outcomes: ['events', 'top_of_mind'],
    },
    {
        id: 'dn_coupons',
        name: 'DN Coupons',
        description: 'Digital coupon distribution to drive traffic.',
        publication: 'DN',
        price: 75,
        frequency: 'monthly',
        outcomes: ['events', 'attract'],
        complementaryTo: ['gec_premium_event']
    },
    {
        id: 'dtg_coupons',
        name: 'DTG Coupons',
        description: 'Directory coupon features.',
        publication: 'DTG',
        price: 50,
        frequency: 'monthly',
        outcomes: ['events', 'attract'],
    },
    {
        id: 'dtg_premium_listing',
        name: 'DTG Premium Listing',
        description: 'Premium placement in the local directory.',
        publication: 'DTG',
        price: 49,
        frequency: 'monthly',
        outcomes: ['get_found'],
        complementaryTo: ['gec_premium_event']
    },
    // Add-ons
    {
        id: 'sms_reminders',
        name: 'SMS Event Reminders',
        description: 'Send automated text reminders 24hr and 2hr before your event.',
        publication: 'GEC',
        price: 25,
        frequency: 'monthly',
        outcomes: [],
        isAddOnFor: ['gec_premium_event']
    },
    {
        id: 'email_reminders',
        name: 'Email Event Reminders',
        description: 'Automated email reminders to registered attendees.',
        publication: 'GEC',
        price: 25,
        frequency: 'monthly',
        outcomes: [],
        isAddOnFor: ['gec_premium_event']
    },
    {
        id: 'social_promotion',
        name: 'Social Promotion',
        description: 'Promote your event across all community social channels.',
        publication: 'Community',
        price: 35,
        frequency: 'monthly',
        outcomes: [],
        isAddOnFor: ['gec_premium_event']
    },
    {
        id: 'newsletter_feature',
        name: 'Newsletter Feature',
        description: 'Get featured in the weekly community newsletter.',
        publication: 'Community',
        price: 50,
        frequency: 'monthly',
        outcomes: [],
        isAddOnFor: ['gec_premium_event']
    }
];
