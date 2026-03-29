import { useCallback, useEffect, useState } from "react";
import { pitchLogin, pitchRegister, updateSession } from "@/pitch/api/pitchApi";
import { useAuthStore } from "@/stores/authStore";
import type { PitchStepBaseProps } from "../types";

export interface AuthGateStepProps extends PitchStepBaseProps {
  onAuthenticated: (userId: string) => void;
}

type AuthMode = "signup" | "login";

export function AuthGateStep({
  session,
  onNext,
  onBack,
  onLogEvent,
  onSarahMessage,
  onAuthenticated,
}: AuthGateStepProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /* ─── signup fields ─── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { setAuth } = useAuthStore();

  useEffect(() => {
    onLogEvent("step_reached", { step: "auth_gate" });
    onSarahMessage?.(
      "Almost there — just need to save your plan to an account so nothing gets lost."
    );
  }, [onLogEvent, onSarahMessage]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "signup") {
      if (!name.trim()) errs.name = "Name is required.";
      if (!email.trim()) errs.email = "Email is required.";
      if (!password) errs.password = "Password is required.";
      else if (password.length < 8) errs.password = "Must be at least 8 characters.";
      if (password !== passwordConfirm) errs.passwordConfirm = "Passwords don't match.";
    } else {
      if (!email.trim()) errs.email = "Email is required.";
      if (!password) errs.password = "Password is required.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [mode, name, email, password, passwordConfirm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      setError(null);

      try {
        let userId: string;
        if (mode === "signup") {
          const { user, token } = await pitchRegister({
            name: name.trim(),
            email: email.trim(),
            password,
            password_confirmation: passwordConfirm,
          });
          userId = String(user.id);
          setAuth(
            {
              id: String(user.id),
              name: String(user.name ?? name),
              email: String(user.email ?? email),
            },
            token
          );
        } else {
          const { user, token } = await pitchLogin({
            email: email.trim(),
            password,
          });
          userId = String(user.id);
          setAuth(
            {
              id: String(user.id),
              name: String(user.name ?? ""),
              email: String(user.email ?? email),
            },
            token
          );
        }

        // PATCH pitch session with user_id / customer_id
        await updateSession(session.id, {
          customerId: userId,
        });

        onLogEvent("auth_completed", { mode, userId });
        onAuthenticated(userId);
      } catch (err: unknown) {
        const msg = err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? "Something went wrong. Please try again.";
        setError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      mode, name, email, password, passwordConfirm,
      session.id, validate, onLogEvent, onAuthenticated, setAuth, onNext,
    ]
  );

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "signup" ? "login" : "signup"));
    setError(null);
    setFieldErrors({});
  }, []);

  const inputBase =
    "w-full rounded-[var(--p-radius-sm)] border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--p-teal)]";

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: "var(--p-text)" }}
        >
          Let&apos;s save your plan.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          Create an account to lock in your selections and complete enrollment.
        </p>
      </div>

      {/* Error banner */}
      {error ? (
        <div
          className="rounded-[var(--p-radius-lg)] border px-4 py-3 text-sm"
          style={{ borderColor: "var(--p-red)", color: "var(--p-red)" }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" id="pitch-auth-form">
        {mode === "signup" ? (
          <div className="space-y-1">
            <label
              htmlFor="auth-name"
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--p-muted)" }}
            >
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className={inputBase}
              style={{
                backgroundColor: "var(--p-card)",
                borderColor: fieldErrors.name ? "var(--p-red)" : "var(--p-border)",
                color: "var(--p-text)",
              }}
              placeholder="Jane Smith"
              autoComplete="name"
            />
            {fieldErrors.name ? (
              <p className="text-xs" style={{ color: "var(--p-red)" }}>{fieldErrors.name}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1">
          <label
            htmlFor="auth-email"
            className="block text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--p-muted)" }}
          >
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className={inputBase}
            style={{
              backgroundColor: "var(--p-card)",
              borderColor: fieldErrors.email ? "var(--p-red)" : "var(--p-border)",
              color: "var(--p-text)",
            }}
            placeholder="you@business.com"
            autoComplete="email"
          />
          {fieldErrors.email ? (
            <p className="text-xs" style={{ color: "var(--p-red)" }}>{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="auth-password"
            className="block text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--p-muted)" }}
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className={inputBase}
            style={{
              backgroundColor: "var(--p-card)",
              borderColor: fieldErrors.password ? "var(--p-red)" : "var(--p-border)",
              color: "var(--p-text)",
            }}
            placeholder="At least 8 characters"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
          {fieldErrors.password ? (
            <p className="text-xs" style={{ color: "var(--p-red)" }}>{fieldErrors.password}</p>
          ) : null}
        </div>

        {mode === "signup" ? (
          <div className="space-y-1">
            <label
              htmlFor="auth-password-confirm"
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--p-muted)" }}
            >
              Confirm password
            </label>
            <input
              id="auth-password-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isSubmitting}
              className={inputBase}
              style={{
                backgroundColor: "var(--p-card)",
                borderColor: fieldErrors.passwordConfirm ? "var(--p-red)" : "var(--p-border)",
                color: "var(--p-text)",
              }}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
            {fieldErrors.passwordConfirm ? (
              <p className="text-xs" style={{ color: "var(--p-red)" }}>{fieldErrors.passwordConfirm}</p>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[var(--p-radius-pill)] py-4 text-base font-bold transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] disabled:opacity-50"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
        >
          {isSubmitting
            ? "Saving your plan…"
            : mode === "signup"
              ? "Create account & continue"
              : "Sign in & continue"}
        </button>
      </form>

      {/* Mode toggle */}
      <p className="text-center text-sm" style={{ color: "var(--p-muted)" }}>
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold underline focus:outline-none"
              style={{ color: "var(--p-teal)" }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold underline focus:outline-none"
              style={{ color: "var(--p-teal)" }}
            >
              Create one
            </button>
          </>
        )}
      </p>

      {/* Back button */}
      <div className="flex flex-wrap gap-3 border-t pt-6" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
