import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail, CheckCircle2, AlertCircle, Settings, TestTube2,
  Plus, Shield,
} from 'lucide-react';
import { apiClient } from '@/services/api';

interface PoolStatus {
  configured: boolean;
  provider: string | null;
}

interface PlatformStatus {
  pools: Record<string, PoolStatus>;
  senders_count: number;
  verified_senders: number;
}

interface Pool {
  id: string;
  pool_type: string;
  provider: string | null;
  api_url: string | null;
  api_key: string | null;
  host: string | null;
  port: number | null;
  username: string | null;
  configured: boolean;
}

const POOL_LABELS: Record<string, { label: string; description: string }> = {
  transactional: { label: 'Transactional', description: 'Password resets, notifications, receipts' },
  broadcast:     { label: 'Broadcast',     description: 'Newsletter and community blasts' },
  smb_campaign:  { label: 'SMB Campaign',  description: '90-day outreach campaign emails' },
};

function PoolCard({ poolType, pool, onSaved }: {
  poolType: string;
  pool: Pool | undefined;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const meta = POOL_LABELS[poolType] ?? { label: poolType, description: '' };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    provider: pool?.provider ?? 'postal',
    api_url:  pool?.api_url ?? 'https://postal.fibonacco.com',
    api_key:  '',
    username: pool?.username ?? '',
    host:     pool?.host ?? 'postal.fibonacco.com',
    port:     pool?.port ?? 587,
  });
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const save = useMutation({
    mutationFn: () =>
      apiClient.put(`/v1/email-platform/pools/${poolType}`, form).then((r) => r.data),
    onSuccess: () => {
      setEditing(false);
      setForm((f) => ({ ...f, api_key: '' }));
      queryClient.invalidateQueries({ queryKey: ['email-platform'] });
      onSaved();
    },
  });

  const test = useMutation({
    mutationFn: () =>
      apiClient.post(`/v1/email-platform/pools/${poolType}/test`).then((r) => r.data),
    onSuccess: (data) =>
      setTestResult({ ok: true, message: `Connected: ${data.server}` }),
    onError: (err: unknown) =>
      setTestResult({
        ok: false,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Connection failed',
      }),
  });

  return (
    <div className="border border-[var(--nexus-divider)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--nexus-bg-secondary)]">
        <div className="flex items-center gap-2">
          {pool?.configured ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-400" />
          )}
          <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{meta.label}</span>
          <span className="text-xs text-[var(--nexus-text-tertiary)]">— {meta.description}</span>
        </div>
        <div className="flex items-center gap-2">
          {pool?.configured && !editing && (
            <button
              type="button"
              onClick={() => { test.mutate(); setTestResult(null); }}
              disabled={test.isPending}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[var(--nexus-divider)] rounded-lg text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-primary)] transition-colors"
            >
              <TestTube2 className="w-3.5 h-3.5" />
              {test.isPending ? 'Testing…' : 'Test'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[var(--nexus-divider)] rounded-lg text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-primary)] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            {editing ? 'Cancel' : pool?.configured ? 'Edit' : 'Configure'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`px-4 py-2 text-xs flex items-center gap-2 ${testResult.ok ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
          {testResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {testResult.message}
        </div>
      )}

      {editing && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor={`${poolType}-api-url`}>
                Postal API URL
              </label>
              <input
                id={`${poolType}-api-url`}
                type="url"
                value={form.api_url}
                onChange={(e) => setForm({ ...form, api_url: e.target.value })}
                className="w-full bg-[var(--nexus-bg-primary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:border-[var(--nexus-accent-primary)]"
                placeholder="https://postal.fibonacco.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor={`${poolType}-api-key`}>
                Server API Key {pool?.configured && <span className="text-[var(--nexus-text-tertiary)]">(leave blank to keep existing)</span>}
              </label>
              <input
                id={`${poolType}-api-key`}
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                className="w-full bg-[var(--nexus-bg-primary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:border-[var(--nexus-accent-primary)]"
                placeholder={pool?.api_key ?? 'Paste API key…'}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor={`${poolType}-username`}>
                SMTP Username / From Address
              </label>
              <input
                id={`${poolType}-username`}
                type="email"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-[var(--nexus-bg-primary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:border-[var(--nexus-accent-primary)]"
                placeholder="noreply@fibonacco.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor={`${poolType}-host`}>
                SMTP Host
              </label>
              <input
                id={`${poolType}-host`}
                type="text"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                className="w-full bg-[var(--nexus-bg-primary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:border-[var(--nexus-accent-primary)]"
                placeholder="postal.fibonacco.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-sm text-[var(--nexus-text-secondary)] hover:text-[var(--nexus-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending || !form.api_url || (!form.api_key && !pool?.configured)}
              className="px-4 py-1.5 text-sm bg-[var(--nexus-accent-primary)] text-white rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {save.isPending ? 'Saving…' : 'Save Pool'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EmailPlatformPage() {
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['email-platform', 'status'],
    queryFn: () => apiClient.get<{ data: PlatformStatus }>('/v1/email-platform/status').then((r) => r.data.data),
  });

  const { data: poolsData } = useQuery({
    queryKey: ['email-platform', 'pools'],
    queryFn: () => apiClient.get<{ data: Pool[] }>('/v1/email-platform/pools').then((r) => r.data.data),
  });

  const pools = (poolsData ?? []).reduce<Record<string, Pool>>((acc, p) => {
    acc[p.pool_type] = p;
    return acc;
  }, {});

  const allConfigured = status
    ? Object.values(status.pools).every((p) => p.configured)
    : false;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mail className="w-6 h-6 text-[var(--nexus-accent-primary)]" />
        <div>
          <h1 className="text-xl font-semibold text-[var(--nexus-text-primary)]">Email Platform</h1>
          <p className="text-sm text-[var(--nexus-text-tertiary)]">
            Configure Postal email pools for transactional, broadcast, and campaign sends
          </p>
        </div>
        <div className="ml-auto">
          {allConfigured ? (
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <CheckCircle2 className="w-4 h-4" /> All pools active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
              <AlertCircle className="w-4 h-4" /> Setup required
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      {status && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(status.pools).map(([type, poolStatus]) => (
            <div key={type} className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-3 text-center">
              <div className={`text-xs font-medium mb-1 ${poolStatus.configured ? 'text-green-500' : 'text-orange-400'}`}>
                {POOL_LABELS[type]?.label ?? type}
              </div>
              <div className="text-xs text-[var(--nexus-text-tertiary)]">
                {poolStatus.configured ? poolStatus.provider : 'Not configured'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pool configuration cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--nexus-text-secondary)] uppercase tracking-wide">
          IP Pools
        </h2>
        {Object.keys(POOL_LABELS).map((poolType) => (
          <PoolCard
            key={poolType}
            poolType={poolType}
            pool={pools[poolType]}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ['email-platform'] })}
          />
        ))}
      </div>

      {/* Senders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--nexus-text-secondary)] uppercase tracking-wide">
            Verified Senders
          </h2>
          <span className="text-xs text-[var(--nexus-text-tertiary)]">
            {status?.verified_senders ?? 0} of {status?.senders_count ?? 0} verified
          </span>
        </div>
        <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4 text-sm text-[var(--nexus-text-secondary)]">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-[var(--nexus-text-tertiary)] mt-0.5 shrink-0" />
            <p>
              Sender addresses must be verified in Postal before campaigns can send.
              Add sender addresses here and verify them in your Postal dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
