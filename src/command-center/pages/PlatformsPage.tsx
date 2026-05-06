import { motion } from 'framer-motion';
import { Globe, Link, ExternalLink } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

interface Platform {
  name: string;
  description: string;
  status: 'not_connected';
  color: string;
}

const platforms: Platform[] = [
  {
    name: 'WordPress',
    description: 'Publish articles and pages directly to your WordPress site',
    status: 'not_connected',
    color: '#21759B',
  },
  {
    name: 'Substack',
    description: 'Syndicate newsletters and long-form content to Substack',
    status: 'not_connected',
    color: '#FF6719',
  },
  {
    name: 'Medium',
    description: 'Cross-post stories and articles to your Medium publication',
    status: 'not_connected',
    color: '#000000',
  },
  {
    name: 'Ghost',
    description: 'Push content to your Ghost-powered publication',
    status: 'not_connected',
    color: '#15171A',
  },
];

export function PlatformsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Publishing Platforms"
        subtitle="Connect your content distribution channels to publish and syndicate automatically"
        icon={Globe}
      />

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map((platform, idx) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + idx * 0.05 }}
          >
            <DataCard>
              <div className="flex items-start gap-4">
                {/* Platform icon placeholder */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${platform.color}15`, border: `1px solid ${platform.color}30` }}
                >
                  <Globe className="w-6 h-6" style={{ color: platform.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                      {platform.name}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--nexus-text-tertiary)]" />
                  </div>
                  <p className="text-xs text-[var(--nexus-text-secondary)] mb-3">
                    {platform.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--nexus-text-tertiary)]">
                      <span className="w-2 h-2 rounded-full bg-[var(--nexus-text-tertiary)]" />
                      Not Connected
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                    >
                      <Link className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
