import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  createCheckoutIntent,
  confirmPayment as confirmPaymentApi,
  validateCoupon,
} from "@/pitch/api/pitchApi";
import type { AcceptedProduct, PitchStepBaseProps } from "../types";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "");

export interface CheckoutStepProps extends PitchStepBaseProps {
  onPaymentComplete: (updatedSession: import("../types").PitchSession) => void;
}

/* ─── Inner form (must be child of <Elements>) ─────────────────────────── */

interface CheckoutFormProps {
  paymentIntentId: string;
  sessionId: string;
  cartTotal: number;
  items: AcceptedProduct[];
  billingCycle: "monthly" | "annual";
  founderRate: boolean;
  onPaymentComplete: CheckoutStepProps["onPaymentComplete"];
  onLogEvent: CheckoutStepProps["onLogEvent"];
  onBack: () => void;
}

function CheckoutForm({
  paymentIntentId,
  sessionId,
  cartTotal,
  items,
  billingCycle,
  founderRate,
  onPaymentComplete,
  onLogEvent,
  onBack,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setIsProcessing(true);
      setPayError(null);

      onLogEvent("checkout_submit", {
        amount: cartTotal,
        billing_cycle: billingCycle,
      });

      const { error } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setPayError(error.message ?? "Payment failed. Please try again.");
        setIsProcessing(false);
        onLogEvent("checkout_error", {
          error_code: error.code,
          error_message: error.message,
        });
        return;
      }

      // Payment succeeded — confirm on backend
      try {
        const updated = await confirmPaymentApi(sessionId, paymentIntentId);
        onLogEvent("checkout_success", {
          payment_intent_id: paymentIntentId,
        });
        onPaymentComplete(updated);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Payment processed but confirmation failed. Contact support.";
        setPayError(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      stripe,
      elements,
      sessionId,
      paymentIntentId,
      cartTotal,
      billingCycle,
      onLogEvent,
      onPaymentComplete,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="pitch-checkout-form">
      {/* Order Summary */}
      <div
        className="space-y-3 rounded-[var(--p-radius-lg)] border p-5"
        style={{
          borderColor: "var(--p-border)",
          backgroundColor: "var(--p-card)",
        }}
      >
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--p-text)" }}
        >
          Order summary
        </h2>
        <ul className="space-y-2">
          {items.map((i) => (
            <li
              key={`${i.product}-${i.price}`}
              className="flex justify-between text-sm"
              style={{ color: "var(--p-text)" }}
            >
              <span>{i.product}</span>
              <span
                className="font-semibold"
                style={{ color: "var(--p-teal)" }}
              >
                ${i.price}/mo
              </span>
            </li>
          ))}
        </ul>
        <div
          className="flex justify-between border-t pt-3 text-base font-bold"
          style={{
            borderColor: "var(--p-border)",
            color: "var(--p-text)",
          }}
        >
          <span>Total</span>
          <span style={{ color: "var(--p-teal)" }}>
            ${cartTotal}/{billingCycle === "annual" ? "yr" : "mo"}
          </span>
        </div>
        {founderRate ? (
          <div
            className="rounded-[var(--p-radius-sm)] px-3 py-2 text-xs font-semibold"
            style={{
              backgroundColor: "var(--p-amber-soft)",
              color: "var(--p-amber)",
            }}
          >
            Founder rate applied — locked in for 3 years.
          </div>
        ) : null}
      </div>

      {/* Stripe Payment Element */}
      <div
        className="rounded-[var(--p-radius-lg)] border p-5"
        style={{
          borderColor: "var(--p-border)",
          backgroundColor: "var(--p-card)",
        }}
      >
        <h2
          className="mb-4 text-lg font-bold"
          style={{ color: "var(--p-text)" }}
        >
          Payment details
        </h2>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Error */}
      {payError ? (
        <div
          className="rounded-[var(--p-radius-lg)] border px-4 py-3 text-sm"
          style={{ borderColor: "var(--p-red)", color: "var(--p-red)" }}
          role="alert"
        >
          {payError}
        </div>
      ) : null}

      {/* Submit */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full rounded-[var(--p-radius-pill)] py-4 text-base font-bold transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] disabled:opacity-50"
        style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
      >
        {isProcessing ? "Processing payment…" : "Complete Enrollment"}
      </button>

      {/* Back */}
      <div
        className="flex flex-wrap gap-3 border-t pt-4"
        style={{ borderColor: "var(--p-border)" }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{
            borderColor: "var(--p-border-light)",
            color: "var(--p-text)",
          }}
        >
          Back
        </button>
      </div>
    </form>
  );
}

/* ─── Outer wrapper (loads intent, wraps in <Elements>) ────────────────── */

export function CheckoutStep({
  session,
  onNext,
  onBack,
  onLogEvent,
  onSarahMessage,
  onPaymentComplete,
}: CheckoutStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountCents, setDiscountCents] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const items: AcceptedProduct[] = session.productsAccepted ?? [];
  const cartTotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + (Number.isFinite(i.price) ? i.price : 0),
        0
      ),
    [items]
  );

  const founderRate = cartTotal <= 300 && items.length > 0;
  const billingCycle: "monthly" | "annual" = "monthly";

  useEffect(() => {
    onLogEvent("step_reached", { step: "checkout" });
    onSarahMessage?.(
      "You're in great shape — just one more step to lock everything in."
    );
  }, [onLogEvent, onSarahMessage]);

  const chargeAmount = useMemo(
    () => (founderRate && cartTotal > 300 ? 300 : Math.max(cartTotal, 1)),
    [founderRate, cartTotal]
  );

  // Create PaymentIntent on mount and whenever an applied coupon changes.
  useEffect(() => {
    let cancelled = false;
    async function createIntent() {
      try {
        setLoading(true);
        const selectedProducts = items.map((i) => i.product);
        const { client_secret, payment_intent_id } =
          await createCheckoutIntent(session.id, {
            selected_products:
              selectedProducts.length > 0
                ? selectedProducts
                : ["Community Influencer"],
            total_amount: chargeAmount,
            billing_cycle: billingCycle,
            ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
          });
        if (!cancelled) {
          setClientSecret(client_secret);
          setPaymentIntentId(payment_intent_id);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : "Could not prepare checkout. Please try again.";
          setIntentError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void createIntent();
    return () => {
      cancelled = true;
    };
  }, [session.id, chargeAmount, appliedCoupon]);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon({
        code,
        amount: Math.round(chargeAmount * 100),
      });
      if (result.valid) {
        setAppliedCoupon(code);
        setDiscountCents(result.discount_cents ?? 0);
      } else {
        setAppliedCoupon(null);
        setDiscountCents(0);
        setCouponError(result.message ?? "That coupon is not valid.");
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }, [couponInput, chargeAmount]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountCents(0);
    setCouponError(null);
    setCouponInput("");
  }, []);

  const netTotal = Math.max(0, chargeAmount - discountCents / 100);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm" style={{ color: "var(--p-muted)" }}>
          Preparing checkout…
        </p>
      </div>
    );
  }

  if (intentError || !clientSecret || !paymentIntentId) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div
          className="rounded-[var(--p-radius-lg)] border px-4 py-3 text-sm"
          style={{ borderColor: "var(--p-red)", color: "var(--p-red)" }}
          role="alert"
        >
          {intentError ?? "Unable to prepare checkout."}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{
            borderColor: "var(--p-border-light)",
            color: "var(--p-text)",
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: "var(--p-text)" }}
        >
          Complete your enrollment
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          Secure your spot with a simple payment.
        </p>
      </div>

      {/* Coupon code */}
      <div
        className="mb-6 rounded-[var(--p-radius-lg)] border p-5"
        style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
      >
        <label
          htmlFor="pitch-coupon-code"
          className="mb-2 block text-sm font-semibold"
          style={{ color: "var(--p-text)" }}
        >
          Have a coupon code?
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm" style={{ color: "var(--p-teal)" }}>
              {appliedCoupon} applied — ${(discountCents / 100).toFixed(2)} off
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="rounded-[var(--p-radius-pill)] border px-3 py-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="pitch-coupon-code"
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter code"
              className="flex-1 rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: "var(--p-border-light)",
                backgroundColor: "var(--p-bg)",
                color: "var(--p-text)",
              }}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] disabled:opacity-50"
              style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
            >
              {couponLoading ? "Checking…" : "Apply"}
            </button>
          </div>
        )}
        {couponError ? (
          <p className="mt-2 text-xs" style={{ color: "var(--p-red)" }} role="alert">
            {couponError}
          </p>
        ) : null}
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#00d4ff",
              colorBackground: "#1f2645",
              colorText: "#ffffff",
              colorDanger: "#ef4444",
              fontFamily: "system-ui, -apple-system, sans-serif",
              borderRadius: "8px",
            },
          },
        }}
      >
        <CheckoutForm
          paymentIntentId={paymentIntentId}
          sessionId={session.id}
          cartTotal={netTotal}
          items={items}
          billingCycle={billingCycle}
          founderRate={founderRate}
          onPaymentComplete={onPaymentComplete}
          onLogEvent={onLogEvent}
          onBack={onBack}
        />
      </Elements>
    </div>
  );
}
