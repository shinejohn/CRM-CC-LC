import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Plus, Pencil, Trash2, AlertCircle, Search } from 'lucide-react';
import { PageHeader, DataCard, DataTable, StatusBadge, ConfirmDialog } from '@/components/shared';
import type { ColumnDef } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useEmailTemplates, useDeleteEmailTemplate } from '@/hooks/useEmailTemplates';
import type { EmailTemplate } from '@/services/crm/email-templates-api';

const formatDate = (value?: string): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '—';

export function EmailTemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<EmailTemplate | null>(null);

  const { data, isLoading, isError, refetch } = useEmailTemplates({
    search: search.trim() || undefined,
    per_page: 100,
  });
  const deleteTemplate = useDeleteEmailTemplate();

  const templates = useMemo(() => data?.data ?? [], [data]);

  const columns: ColumnDef<EmailTemplate>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-medium text-[var(--nexus-text-primary)]">{row.name}</span>
      ),
    },
    {
      header: 'Subject',
      cell: (row) => (
        <span className="text-[var(--nexus-text-secondary)] line-clamp-1">{row.subject}</span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
    },
    {
      header: 'Updated',
      cell: (row) => formatDate(row.updated_at),
    },
  ];

  const renderActions = (template: EmailTemplate) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Edit template"
        aria-label={`Edit template ${template.name}`}
        onClick={() => navigate(`/command-center/attract/templates/${template.id}`)}
      >
        <Pencil className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Delete template"
        aria-label={`Delete template ${template.name}`}
        onClick={() => setPendingDelete(template)}
      >
        <Trash2 className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
      </Button>
    </div>
  );

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTemplate.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // Error surfaces via the global api-error event; keep dialog open.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        subtitle="Build and manage reusable email templates"
        icon={Mail}
        actions={
          <Button
            type="button"
            onClick={() => navigate('/command-center/attract/templates/new')}
            className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nexus-text-tertiary)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or subject…"
          aria-label="Search email templates"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {isError ? (
          <DataCard>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
                Couldn’t load templates
              </h3>
              <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
                There was a problem fetching email templates. Check your connection and try again.
              </p>
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </DataCard>
        ) : (
          <DataCard noPadding>
            <DataTable<EmailTemplate>
              columns={columns}
              data={templates}
              isLoading={isLoading}
              emptyMessage="No email templates yet. Create your first one."
              actions={renderActions}
            />
          </DataCard>
        )}
      </motion.div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete template"
        description={
          pendingDelete
            ? `Permanently delete “${pendingDelete.name}”? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteTemplate.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
