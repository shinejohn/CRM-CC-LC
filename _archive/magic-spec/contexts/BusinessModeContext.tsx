import React, { useState, createContext, useContext } from 'react';
export type BusinessMode = 'b2b-pipeline' | 'b2c-services' | 'b2c-retail';
interface BusinessModeContextType {
  mode: BusinessMode;
  setMode: (mode: BusinessMode) => void;
  terminology: {
    customer: string;
    customers: string;
    deal: string;
    deals: string;
    quote: string;
    quotes: string;
    activity: string;
    activities: string;
    dashboard: string;
  };
}
const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined);
const terminologyMap = {
  'b2b-pipeline': {
    customer: 'Account',
    customers: 'Accounts',
    deal: 'Deal',
    deals: 'Pipeline',
    quote: 'Proposal',
    quotes: 'Proposals',
    activity: 'Activity',
    activities: 'Activities',
    dashboard: 'Sales Dashboard'
  },
  'b2c-services': {
    customer: 'Client',
    customers: 'Clients',
    deal: 'Job',
    deals: 'Jobs',
    quote: 'Quote',
    quotes: 'Quotes',
    activity: 'Appointment',
    activities: 'Schedule',
    dashboard: 'Client Dashboard'
  },
  'b2c-retail': {
    customer: 'Guest',
    customers: 'Guests',
    deal: 'Visit',
    deals: 'Visits',
    quote: 'Order',
    quotes: 'Orders',
    activity: 'Reservation',
    activities: 'Reservations',
    dashboard: 'Guest Relations'
  }
};
export function BusinessModeProvider({
  children
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<BusinessMode>('b2c-services');
  const terminology = terminologyMap[mode];
  return <BusinessModeContext.Provider value={{
    mode,
    setMode,
    terminology
  }}>
      {children}
    </BusinessModeContext.Provider>;
}
export function useBusinessMode() {
  const context = useContext(BusinessModeContext);
  if (!context) {
    throw new Error('useBusinessMode must be used within BusinessModeProvider');
  }
  return context;
}