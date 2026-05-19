import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

interface CheckoutSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
  onAction?: (action: string, payload: Record<string, unknown>) => void;
}

interface CheckoutLineItem {
  description: string;
  price: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/* ─── Inner form (must be child of <Elements>) ──────────────────────── */

interface CheckoutFormProps {
  paymentIntentId: string;
  total: number;
  items: CheckoutLineItem[];
  buttonText: string;
  theme: string;
  onPaymentComplete: (intentId: string) => void;
  onError: (msg: string) => void;
}

function CheckoutForm({
  paymentIntentId,
  total,
  items,
  buttonText,
  theme,
  onPaymentComplete,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const accentColors: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setIsProcessing(true);
      onError('');

      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message ?? 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      onPaymentComplete(paymentIntentId);
      setIsProcessing(false);
    },
    [stripe, elements, paymentIntentId, onPaymentComplete, onError]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h3>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm text-gray-700">
              <span>{item.description}</span>
              <span className="font-semibold">{formatCurrency(item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t mt-3 pt-3 text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
        </div>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className={`
          w-full py-4 rounded-lg text-white font-bold text-lg
          ${accentColors[theme]} hover:opacity-90 transition-opacity
          disabled:opacity-50 shadow-lg
          flex items-center justify-center gap-2
        `}
      >
        <ShieldCheck size={20} />
        {isProcessing ? 'Processing...' : buttonText}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock size={12} />
        <span>Secured by Stripe. Your payment info is never stored on our servers.</span>
      </div>
    </form>
  );
}

/* ─── Success State ──────────────────────────────────────────────────── */

function CheckoutSuccess({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500" />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

/* ─── Main Slide ─────────────────────────────────────────────────────── */

export const CheckoutSlide: React.FC<CheckoutSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
  onAction,
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    green: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-100',
    orange: 'bg-gradient-to-br from-orange-50 to-red-100',
  };

  const headline = (content.headline as string) ?? (content.title as string) ?? 'Complete Your Purchase';
  const subheadline = content.subheadline as string | undefined;
  const button_text = (content.button_text as string) ?? 'Pay Now';
  const success_message = (content.success_message as string) ?? 'Thank you! Your payment has been processed.';

  // Items for order summary
  const rawItems = (content.items ?? content.line_items ?? []) as Array<Record<string, unknown>>;
  const items: CheckoutLineItem[] = useMemo(
    () =>
      rawItems.map((r) => ({
        description: (r.description as string) ?? (r.name as string) ?? (r.product as string) ?? '',
        price: typeof r.price === 'number' ? r.price : (typeof r.total === 'number' ? r.total : 0),
      })),
    [rawItems]
  );
  const total = useMemo(
    () => (typeof content.total === 'number' ? content.total : items.reduce((s, i) => s + i.price, 0)),
    [content.total, items]
  );

  // Checkout intent API
  const session_id = content.session_id as string | undefined;
  const quote_id = content.quote_id as string | undefined;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isActive || clientSecret || success) return;
    if (!session_id && !quote_id) return;

    let cancelled = false;
    async function createIntent() {
      setLoading(true);
      setError('');
      try {
        const endpoint = session_id
          ? `/v1/pitch/sessions/${encodeURIComponent(session_id)}/checkout`
          : `/api/v1/quotes/${encodeURIComponent(quote_id!)}/checkout`;

        const res = await apiClient.post<{
          data: { client_secret: string; payment_intent_id: string };
        }>(endpoint, {
          total_amount: total,
          selected_products: items.map((i) => i.description),
          billing_cycle: (content.billing_cycle as string) ?? 'monthly',
        });

        if (!cancelled) {
          setClientSecret(res.data.data.client_secret);
          setPaymentIntentId(res.data.data.payment_intent_id);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Could not prepare checkout.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void createIntent();
    return () => {
      cancelled = true;
    };
  }, [isActive, session_id, quote_id, clientSecret, success, total, items, content.billing_cycle]);

  const handlePaymentComplete = useCallback(
    (intentId: string) => {
      setSuccess(true);
      onAction?.('payment_complete', {
        payment_intent_id: intentId,
        session_id,
        quote_id,
        total,
      });
    },
    [onAction, session_id, quote_id, total]
  );

  // If no session_id or quote_id, show static display with items only (no payment form)
  const isStaticMode = !session_id && !quote_id;

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-8 overflow-y-auto
        ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center animate-fade-in">
          {headline}
        </h2>
        {subheadline && (
          <p className="text-gray-600 text-center mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {subheadline}
          </p>
        )}

        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {success ? (
            <CheckoutSuccess message={success_message} />
          ) : isStaticMode ? (
            /* Static mode: show order summary without payment form */
            <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <li key={i} className="flex justify-between text-gray-700">
                    <span>{item.description}</span>
                    <span className="font-semibold">{formatCurrency(item.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t mt-4 pt-4 text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Payment processing will be available when connected to a session.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Preparing secure checkout...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200" role="alert">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          ) : clientSecret && paymentIntentId ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: theme === 'blue' ? '#2563eb' : theme === 'green' ? '#059669' : theme === 'purple' ? '#9333ea' : '#ea580c',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm
                paymentIntentId={paymentIntentId}
                total={total}
                items={items}
                buttonText={button_text}
                theme={theme}
                onPaymentComplete={handlePaymentComplete}
                onError={setError}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
};
