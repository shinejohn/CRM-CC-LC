import { useBusinessModeStore, type BusinessMode } from '@/stores/businessModeStore';

const terminology: Record<BusinessMode, Record<string, string>> = {
  'b2b-pipeline': {
    customers: 'Accounts',
    customer: 'Account',
    deals: 'Deals',
    deal: 'Deal',
    proposals: 'Proposals',
    proposal: 'Proposal',
    activities: 'Activities',
    pipeline: 'Deal Pipeline',
    quote: 'Proposal',
    quotes: 'Proposals',
  },
  'b2c-services': {
    customers: 'Clients',
    customer: 'Client',
    deals: 'Jobs',
    deal: 'Job',
    proposals: 'Quotes',
    proposal: 'Quote',
    activities: 'Schedule',
    pipeline: 'Job Board',
    quote: 'Quote',
    quotes: 'Quotes',
  },
  'b2c-retail': {
    customers: 'Guests',
    customer: 'Guest',
    deals: 'Visits',
    deal: 'Visit',
    proposals: 'Promotions',
    proposal: 'Promotion',
    activities: 'Reservations',
    pipeline: 'Activity',
    quote: 'Promotion',
    quotes: 'Promotions',
  },
};

interface BusinessModeReturn {
  mode: BusinessMode;
  setMode: (mode: BusinessMode) => void;
  t: (key: string) => string;
}

export function useBusinessMode(): BusinessModeReturn {
  const mode = useBusinessModeStore((s) => s.mode);
  const setMode = useBusinessModeStore((s) => s.setMode);

  const t = (key: string): string => {
    return terminology[mode][key] ?? key;
  };

  return { mode, setMode, t };
}
