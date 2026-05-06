import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { PITCH_PROGRESS_STEPS } from "./_constants";
import type { EntryMode, PitchSession, SarahMessage, SlotStatus } from "./types";
import { PitchShell } from "./shell/PitchShell";
import { SarahPanel } from "./shell/SarahPanel";
import { ResumePrompt } from "./components/ResumePrompt";
import { IdentifyStep } from "./steps/IdentifyStep";
import { ProfileTypeStep } from "./steps/ProfileTypeStep";
import { CommunityStep } from "./steps/CommunityStep";
import { GoalsStep } from "./steps/GoalsStep";
import { ProposalStep } from "./steps/ProposalStep";
import { AuthGateStep } from "./steps/AuthGateStep";
import { CheckoutStep } from "./steps/CheckoutStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { GateSequencer, businessProfileFromSession } from "./gates/GateSequencer";
import { usePitchSession } from "./hooks/usePitchSession";
import { useSlotInventory } from "./hooks/useSlotInventory";
import { useAuthStore } from "@/stores/authStore";
import {
  categorySlugForSlots,
  gateSlotRequestsForSession,
  normalizeFlowStep,
  progressForStep,
  slotDataForGates,
  stepOrderForMode,
} from "./pitchStepUtils";
import { mapGateQueryParam } from "./pitchUrlParams";
import { slotInventoryKey } from "@/pitch/api/pitchApi";
import type { DeferredGate, GateKey } from "./types";

export default function PitchRouter() {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gateParam = searchParams.get("gate");

  const {
    session,
    isLoading,
    error,
    currentStep,
    updateStep,
    logEvent,
    resumeSession,
    startFresh,
    showResumePrompt,
    refreshSession,
  } = usePitchSession(communitySlug);

  const { batchFetch, merged: slotMerged } = useSlotInventory();
  const { isAuthenticated } = useAuthStore();

  const [messages, setMessages] = useState<SarahMessage[]>([
    {
      id: "welcome",
      text: "Hi — I'm Sarah. Let's build a plan that fits your business.",
      timestamp: "Now",
    },
  ]);
  const [progressSubLabel, setProgressSubLabel] = useState<string | undefined>(undefined);

  const appendSarah = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  const flowStep = session ? normalizeFlowStep(currentStep) : "identify";
  const { current: progressCurrent, completed: progressCompleted } = progressForStep(flowStep);

  const profile = useMemo(() => (session ? businessProfileFromSession(session) : null), [session]);

  const entryMode: EntryMode = session?.flowMode === "upsell" ? "upsell" : "pitch";

  // Upsell mode: skip identify/profile_type/community — jump straight to goals
  useEffect(() => {
    if (session?.flowMode === "upsell" && flowStep === "identify") {
      void updateStep("goals", {});
    }
  }, [session?.flowMode, flowStep, updateStep]);

  // Upsell mode: append a welcome-back Sarah message once
  const upsellGreetedRef = useRef(false);
  useEffect(() => {
    if (session?.flowMode === "upsell" && !upsellGreetedRef.current) {
      upsellGreetedRef.current = true;
      appendSarah("Welcome back! Let's look at what could help your business grow even more.");
    }
  }, [session?.flowMode, appendSarah]);

  const influencerSlotFromInventory: SlotStatus | undefined = useMemo(() => {
    if (!session?.communityId) return undefined;
    const cat = categorySlugForSlots(session);
    const key = slotInventoryKey(session.communityId, "influencer", cat, "day_news");
    return slotMerged[key];
  }, [session, slotMerged]);

  const gateSlotMap = useMemo(
    () => (session ? slotDataForGates(slotMerged, session) : {}),
    [session, slotMerged]
  );

  useEffect(() => {
    if (!session?.communityId || flowStep !== "your_plan") return;
    const reqs = gateSlotRequestsForSession(session);
    void batchFetch(reqs);
  }, [session?.communityId, session?.businessCategory, flowStep, batchFetch, session]);

  const fastPathGateKey = mapGateQueryParam(gateParam);

  const resumeLabels = useMemo(() => {
    const next =
      flowStep === "identify"
        ? "Profile"
        : flowStep === "profile_type"
          ? "Community"
          : flowStep === "community"
            ? "Goals"
            : flowStep === "goals"
              ? "Your plan"
              : flowStep === "your_plan"
                ? "Proposal"
                : flowStep === "proposal"
                  ? "Enrollment"
                  : flowStep === "auth_gate"
                    ? "Checkout"
                    : flowStep === "checkout"
                      ? "Confirmation"
                      : "Next step";
    return { last: flowStep, next };
  }, [flowStep]);

  const handleBack = useCallback(async () => {
    const order = stepOrderForMode(entryMode);
    const idx = order.indexOf(flowStep);
    if (idx <= 0) return;
    const prev = order[idx - 1];
    await updateStep(prev, {});
  }, [flowStep, updateStep, entryMode]);

  if (!communitySlug) {
    return (
      <div className="pitch-root flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: "var(--p-bg)" }}>
        <p style={{ color: "var(--p-text)" }}>Missing community in URL.</p>
      </div>
    );
  }

  if (isLoading && !session) {
    return (
      <div className="pitch-root flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: "var(--p-bg)" }}>
        <p style={{ color: "var(--p-muted)" }}>Loading your session…</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="pitch-root flex min-h-screen flex-col items-center justify-center gap-4 p-8" style={{ backgroundColor: "var(--p-bg)" }}>
        <p style={{ color: "var(--p-red)" }}>{error}</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
        >
          Go home
        </button>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <PitchShell
      embed
      onClose={() => navigate(-1)}
      currentStep={Math.min(progressCurrent, PITCH_PROGRESS_STEPS.length)}
      steps={PITCH_PROGRESS_STEPS}
      completedSteps={progressCompleted}
      progressSubLabel={progressSubLabel}
      rightPanel={
        <SarahPanel
          messages={messages}
          onSend={(t) => {
            appendSarah(t);
            logEvent("sarah_panel_send", { text: t });
          }}
        />
      }
    >
      <div className="mx-auto max-w-3xl px-4 py-8">
        {showResumePrompt ? (
          <ResumePrompt
            variant={searchParams.get("resume") ? "email_link" : "same_browser"}
            businessName={session.businessName ?? "your business"}
            communityName={session.primaryCommunityName ?? communitySlug}
            lastStep={resumeLabels.last}
            nextStepLabel={resumeLabels.next}
            onResume={resumeSession}
            onStartFresh={() => {
              void startFresh();
            }}
            onDifferentBusiness={() => {
              void startFresh();
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "identify" ? (
          <IdentifyStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            onNext={async (data) => {
              await updateStep("profile_type", data ?? {});
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "profile_type" ? (
          <ProfileTypeStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            onNext={async (data) => {
              await updateStep("community", data ?? {});
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "community" ? (
          <CommunityStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            onNext={async (data) => {
              await updateStep("goals", data ?? {});
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "goals" ? (
          <GoalsStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            influencerSlotHint={influencerSlotFromInventory}
            onNext={async (data) => {
              await updateStep("your_plan", data ?? {});
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "your_plan" ? (
          <GateSequencer
            session={session}
            profile={profile}
            slotData={gateSlotMap}
            entryMode={entryMode}
            ownedProducts={session.existingProducts}
            recommendations={session.upsellRationale}
            profileComplete
            fastPathGateKey={fastPathGateKey}
            onProgressSubLabel={setProgressSubLabel}
            onGateComplete={async (gate, products) => {
              const prevAccepted = session.productsAccepted ?? [];
              const mergedProducts = [...prevAccepted, ...products];
              const done = [...(session.gatesCompleted ?? []), gate];
              await updateStep("your_plan", {
                productsAccepted: mergedProducts,
                gatesCompleted: done,
              });
            }}
            onGateDefer={async (gate: GateKey, reason) => {
              const next: DeferredGate = { gate, reason, retryAfter: "30 days" };
              const def = [...(session.gatesDeferred ?? []), next];
              await updateStep("your_plan", { gatesDeferred: def });
              logEvent("gate_deferred", { gate, reason });
            }}
            onAllGatesComplete={async () => {
              await updateStep("proposal", {});
            }}
            onLogEvent={logEvent}
          />
        ) : null}

        {!showResumePrompt && flowStep === "proposal" ? (
          <ProposalStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            founderDaysRemaining={14}
            influencerSlot={influencerSlotFromInventory}
            onProposalSynced={() => {
              void refreshSession();
            }}
            onNext={async () => {
              // Deferred auth: if already logged in, skip auth_gate
              if (isAuthenticated) {
                await updateStep("checkout", {});
              } else {
                await updateStep("auth_gate", {});
              }
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "auth_gate" ? (
          <AuthGateStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            onNext={async () => {
              await updateStep("checkout", {});
            }}
            onAuthenticated={async () => {
              await updateStep("checkout", {});
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "checkout" ? (
          <CheckoutStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onBack={handleBack}
            onNext={async () => {
              await updateStep("done", {});
            }}
            onPaymentComplete={async () => {
              await updateStep("done", { status: "converted" });
            }}
          />
        ) : null}

        {!showResumePrompt && flowStep === "done" ? (
          <ConfirmationStep
            session={session}
            onLogEvent={logEvent}
            onSarahMessage={appendSarah}
            onNext={async () => {
              navigate("/command-center");
            }}
          />
        ) : null}
      </div>
    </PitchShell>
  );
}
