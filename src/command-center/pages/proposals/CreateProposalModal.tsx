import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerApi, type Customer } from '@/services/crm/crm-api';
import { useCreateQuote, type CreateQuoteInput } from '@/hooks/useQuotes';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface CreateProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a quote is successfully created. */
  onCreated?: (quoteId: string) => void;
}

const emptyItem: LineItem = { description: '', quantity: 1, unit_price: 0 };

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number.isFinite(value) ? value : 0,
  );

export function CreateProposalModal({ open, onOpenChange, onCreated }: CreateProposalModalProps) {
  const createQuote = useCreateQuote();

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);
  const [validUntil, setValidUntil] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const searchEnabled = !selectedCustomer && customerSearch.trim().length >= 2;
  const { data: customerResults, isFetching: searchingCustomers } = useQuery({
    queryKey: ['customers', 'proposal-search', customerSearch.trim()],
    queryFn: () => customerApi.list({ search: customerSearch.trim() }, 1, 8),
    enabled: searchEnabled,
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [items],
  );
  const taxAmount = useMemo(() => {
    const rate = parseFloat(taxRate);
    return Number.isFinite(rate) ? subtotal * (rate / 100) : 0;
  }, [subtotal, taxRate]);
  const total = subtotal + taxAmount;

  const reset = () => {
    setCustomerSearch('');
    setSelectedCustomer(null);
    setItems([{ ...emptyItem }]);
    setValidUntil('');
    setTaxRate('');
    setNotes('');
    setError(null);
  };

  const close = () => {
    if (createQuote.isPending) return;
    reset();
    onOpenChange(false);
  };

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (index: number) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const handleSubmit = async () => {
    setError(null);

    if (!selectedCustomer) {
      setError('Select a customer for this proposal.');
      return;
    }
    const validItems = items.filter((item) => item.description.trim() !== '');
    if (validItems.length === 0) {
      setError('Add at least one line item with a description.');
      return;
    }

    const payload: CreateQuoteInput = {
      customer_id: selectedCustomer.id,
      items: validItems.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
      })),
    };
    const rate = parseFloat(taxRate);
    if (Number.isFinite(rate)) payload.tax_rate = rate;
    if (validUntil) payload.valid_until = validUntil;
    if (notes.trim()) payload.notes = notes.trim();

    try {
      const quote = await createQuote.mutateAsync(payload);
      reset();
      onOpenChange(false);
      onCreated?.(quote.id);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to create proposal. Please try again.';
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--nexus-bg-page)] border-[var(--nexus-card-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--nexus-text-primary)]">Create Proposal</DialogTitle>
          <DialogDescription className="text-[var(--nexus-text-secondary)]">
            Select a customer and add line items. The proposal is created as a draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Customer selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="proposal-customer"
              className="text-sm font-medium text-[var(--nexus-text-primary)]"
            >
              Customer
            </label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-lg border border-[var(--nexus-card-border)] px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-[var(--nexus-text-primary)]">
                    {selectedCustomer.business_name}
                  </p>
                  {selectedCustomer.email && (
                    <p className="text-xs text-[var(--nexus-text-tertiary)]">
                      {selectedCustomer.email}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                <Input
                  id="proposal-customer"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name..."
                  className="pl-9"
                  autoComplete="off"
                />
                {searchEnabled && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] shadow-lg max-h-56 overflow-y-auto">
                    {searchingCustomers && (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--nexus-text-tertiary)]">
                        <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                      </div>
                    )}
                    {!searchingCustomers &&
                      (customerResults?.data.length ?? 0) === 0 && (
                        <div className="px-3 py-2 text-sm text-[var(--nexus-text-tertiary)]">
                          No customers found.
                        </div>
                      )}
                    {customerResults?.data.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setError(null);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                      >
                        <span className="font-medium">{customer.business_name}</span>
                        {customer.email && (
                          <span className="block text-xs text-[var(--nexus-text-tertiary)]">
                            {customer.email}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--nexus-text-primary)]">
                Line items
              </span>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> Add item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="Description"
                    aria-label={`Line item ${index + 1} description`}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                    aria-label={`Line item ${index + 1} quantity`}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                    aria-label={`Line item ${index + 1} unit price`}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label={`Remove line item ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="proposal-valid-until"
                className="text-sm font-medium text-[var(--nexus-text-primary)]"
              >
                Valid until
              </label>
              <Input
                id="proposal-valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="proposal-tax-rate"
                className="text-sm font-medium text-[var(--nexus-text-primary)]"
              >
                Tax rate (%)
              </label>
              <Input
                id="proposal-tax-rate"
                type="number"
                min={0}
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="proposal-notes"
              className="text-sm font-medium text-[var(--nexus-text-primary)]"
            >
              Notes
            </label>
            <textarea
              id="proposal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes or terms..."
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-transparent px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-[var(--nexus-card-border)] px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm text-[var(--nexus-text-secondary)]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--nexus-text-secondary)]">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-[var(--nexus-text-primary)] pt-1.5 border-t border-[var(--nexus-card-border)]">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-[var(--nexus-accent-danger)]">{error}</p>}
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={createQuote.isPending}
            className="border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createQuote.isPending}
            className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
          >
            {createQuote.isPending ? 'Creating...' : 'Create Proposal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
