import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { CalendarDays, Gift, Users, Footprints, ArrowRight } from 'lucide-react';
import { PageHeader, MetricCard, DataCard, StatusBadge } from '@/components/shared';
import { useBusinessMode } from '@/hooks/useBusinessMode';

// TODO: wire to API — replace with real retail data
const mockReservations = [
  { id: '1', guest: 'Alice Johnson', party: 4, time: '6:00 PM', status: 'confirmed' as const },
  { id: '2', guest: 'Bob Martinez', party: 2, time: '6:30 PM', status: 'pending' as const },
  { id: '3', guest: 'Chen Wei', party: 6, time: '7:00 PM', status: 'confirmed' as const },
  { id: '4', guest: 'Diana Okafor', party: 3, time: '7:30 PM', status: 'pending' as const },
];

const mockPromotions = [
  { id: '1', name: 'Happy Hour Special', status: 'active' as const, redemptions: 42 },
  { id: '2', name: 'Loyalty Double Points', status: 'active' as const, redemptions: 128 },
  { id: '3', name: 'New Customer 10% Off', status: 'pending' as const, redemptions: 0 },
];

const mockVisits = [
  { guest: 'Regular - James K.', time: '2 hours ago', spent: '$45' },
  { guest: 'New - Sarah L.', time: '3 hours ago', spent: '$28' },
  { guest: 'Regular - Mike T.', time: '5 hours ago', spent: '$62' },
  { guest: 'VIP - Lisa Chen', time: 'Yesterday', spent: '$120' },
];

export function RetailDashboard() {
  const navigate = useNavigate();
  const { t } = useBusinessMode();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pipeline')}
        subtitle={`Today's ${t('activities').toLowerCase()} and promotions`}
        actions={
          <button
            onClick={() => navigate('/command-center/sell/customers')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            View {t('customers')}
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={`Today's ${t('activities')}`} value={String(mockReservations.length)} icon={CalendarDays} color="blue" />
        <MetricCard label="Active Promotions" value={String(mockPromotions.filter((p) => p.status === 'active').length)} icon={Gift} color="green" />
        <MetricCard label="Loyalty Members" value="234" icon={Users} color="purple" />
        <MetricCard label="Recent Visits" value="18 today" icon={Footprints} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Reservations */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title={`Today's ${t('activities')}`} icon={CalendarDays}>
            <div className="space-y-3">
              {mockReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{r.guest}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">Party of {r.party} • {r.time}</p>
                  </div>
                  <StatusBadge status={r.status === 'confirmed' ? 'active' : 'pending'} size="sm" />
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Active Promotions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Active Promotions" icon={Gift}>
            <div className="space-y-3">
              {mockPromotions.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{p.name}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">{p.redemptions} redemptions</p>
                  </div>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Recent Visits */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <DataCard title={`Recent ${t('deals')}`} icon={Footprints}>
            <div className="space-y-3">
              {mockVisits.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{v.guest}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">{v.time}</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--nexus-accent-primary)]">{v.spent}</span>
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
