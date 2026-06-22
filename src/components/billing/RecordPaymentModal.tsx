import { useState } from 'react';
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
import { useRecordPayment, type RecordPaymentInput } from '@/hooks/useInvoices';

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  /** Outstanding balance, pre-filled as the default payment amount. */
  balanceDue: number;
  /** Called after a payment is successfully recorded. */
  onRecorded?: () => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number.isFinite(value) ? value : 0,
  );

export function RecordPaymentModal({
  open,
  onOpenChange,
  invoiceId,
  balanceDue,
  onRecorded,
}: RecordPaymentModalProps) {
  const recordPayment = useRecordPayment(invoiceId);

  const [amount, setAmount] = useState<string>(balanceDue > 0 ? String(balanceDue) : '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAmount(balanceDue > 0 ? String(balanceDue) : '');
    setPaymentMethod('');
    setReference('');
    setNotes('');
    setError(null);
  };

  const close = () => {
    if (recordPayment.isPending) return;
    reset();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a payment amount greater than zero.');
      return;
    }

    const payload: RecordPaymentInput = { amount: parsedAmount };
    if (paymentMethod.trim()) payload.payment_method = paymentMethod.trim();
    if (reference.trim()) payload.reference = reference.trim();
    if (notes.trim()) payload.notes = notes.trim();

    try {
      await recordPayment.mutateAsync(payload);
      reset();
      onOpenChange(false);
      onRecorded?.();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to record payment. Please try again.';
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-[var(--nexus-bg-page)] border-[var(--nexus-card-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--nexus-text-primary)]">Record Payment</DialogTitle>
          <DialogDescription className="text-[var(--nexus-text-secondary)]">
            Log a payment against this invoice. Outstanding balance:{' '}
            {formatCurrency(balanceDue)}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label
              htmlFor="payment-amount"
              className="text-sm font-medium text-[var(--nexus-text-primary)]"
            >
              Amount
            </label>
            <Input
              id="payment-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="payment-method"
              className="text-sm font-medium text-[var(--nexus-text-primary)]"
            >
              Payment method
            </label>
            <Input
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g. Card, Bank transfer, Check"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="payment-reference"
              className="text-sm font-medium text-[var(--nexus-text-primary)]"
            >
              Reference
            </label>
            <Input
              id="payment-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction or check number"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="payment-notes"
              className="text-sm font-medium text-[var(--nexus-text-primary)]"
            >
              Notes
            </label>
            <textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes about this payment..."
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-transparent px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
          </div>

          {error && <p className="text-sm text-[var(--nexus-accent-danger)]">{error}</p>}
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={recordPayment.isPending}
            className="border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={recordPayment.isPending}
            className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
          >
            {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
