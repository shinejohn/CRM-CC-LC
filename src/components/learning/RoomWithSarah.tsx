import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Share2, UserPlus, X } from "lucide-react";
import { SarahPanel } from "@/pitch/shell/SarahPanel";
import { FibonaccoPlayer } from "@/components/LearningCenter/Presentation/FibonaccoPlayer";
import { useSarahNarration } from "./useSarahNarration";
import type { Campaign } from "@/services/types/learning.types";
import type { Presentation, Slide } from "@/types/learning";
import "@/pitch/tokens.css";

interface LandingPageData {
  ai_persona?: string;
  ai_tone?: string;
  ai_goal?: string;
  duration_seconds?: number;
  audio_base_url?: string;
}

interface SlideData {
  slide_num: number;
  component: string;
  title?: string;
  content: Record<string, unknown>;
  narration?: string;
  duration_seconds?: number;
  audio_file?: string;
}

interface RoomWithSarahProps {
  campaign: Campaign;
  onClose: () => void;
  onNavigateCampaign?: (slug: string) => void;
}

function getLandingPage(campaign: Campaign): LandingPageData {
  const raw = campaign as Record<string, unknown>;
  return (raw.landing_page ?? {}) as LandingPageData;
}

function getSlides(campaign: Campaign): SlideData[] {
  const raw = campaign as Record<string, unknown>;
  return (raw.slides ?? []) as SlideData[];
}

function campaignToPresentation(
  campaign: Campaign,
  lp: LandingPageData
): Presentation {
  const rawSlides = getSlides(campaign);
  const audioBaseUrl = lp.audio_base_url ?? "";

  const slides: Slide[] = rawSlides.map((s, idx) => {
    const audioUrl =
      s.audio_file && audioBaseUrl
        ? `${audioBaseUrl.replace(/\/$/, "")}/${s.audio_file}`
        : undefined;
    return {
      id: s.slide_num ?? idx + 1,
      component: (s.component as Slide["component"]) ?? "HeroSlide",
      content: (s.content ?? {}) as Record<string, unknown>,
      narration: s.narration,
      audio_url: audioUrl,
      audio_duration: s.duration_seconds,
    };
  });

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    meta: {
      title: campaign.title,
      target_audience: campaign.target_audience ?? "",
      theme: "blue",
      version: "1.0",
    },
    presenter: {
      name: lp.ai_persona ?? "Sarah",
      role: "AI Business Advisor",
      avatar_style: "professional-female",
      voice_id: "sarah-default",
    },
    slides,
  };
}

/* ------------------------------------------------------------------ */
/*  Share overlay                                                      */
/* ------------------------------------------------------------------ */

function ShareOverlay({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareEmail() {
    const subject = encodeURIComponent(`Check out: ${title}`);
    const body = encodeURIComponent(
      `I thought you'd find this useful:\n\n${title}\n${url}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-md mx-4 rounded-xl bg-[#1a2040] border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white rounded-md"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          Share this presentation
        </h3>
        <p className="text-sm text-white/50 mb-5">{title}</p>

        <div className="flex items-center gap-2 mb-4">
          <input
            readOnly
            value={url}
            className="flex-1 min-w-0 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={shareEmail}
            className="flex-1 rounded-md border border-white/10 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
          >
            Share via Email
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-white/10 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
          >
            <UserPlus className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Invite Colleague
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function RoomWithSarah({
  campaign,
  onClose,
  onNavigateCampaign,
}: RoomWithSarahProps) {
  const lp = getLandingPage(campaign);
  const rawSlides = getSlides(campaign);
  const greetedRef = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const presentation = useMemo(
    () => campaignToPresentation(campaign, lp),
    [campaign, lp]
  );

  const {
    messages,
    isTyping,
    suggestedActions: apiSuggestedActions,
    appendSarah,
    onSlideChange,
    greet,
    complete,
    handleUserMessage,
  } = useSarahNarration({ campaignId: campaign.id, campaign });

  // Greet on mount
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    greet(campaign);
  }, [campaign, greet]);

  const handleSlideChange = useCallback(
    (slideIndex: number) => {
      setCurrentSlideIndex(slideIndex);
      const slide = rawSlides[slideIndex];
      if (slide) {
        onSlideChange(slideIndex, slide);
      }
    },
    [rawSlides, onSlideChange]
  );

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    complete(campaign);

    const raw = campaign as Record<string, unknown>;
    const connections = (raw.connections ?? {}) as Record<string, unknown>;
    const leadsTo = connections.leads_to as string[] | undefined;
    const related = connections.related as string[] | undefined;
    const nextSlugs = leadsTo ?? related ?? [];

    if (nextSlugs.length > 0 && onNavigateCampaign) {
      setTimeout(() => {
        appendSarah(
          `If you'd like to explore further, I have ${
            nextSlugs.length === 1
              ? "another topic"
              : "some related topics"
          } that might interest you.`,
          2000
        );
      }, 0);
    }
  }, [campaign, complete, appendSarah, onNavigateCampaign]);

  // Contextual suggested actions — use API-returned ones if available, else defaults
  type SuggestedAction = ComponentProps<typeof SarahPanel>["suggestedActions"];
  const suggestedActions = useMemo((): SuggestedAction => {
    // After user has chatted, use API-returned suggestions
    const userSent = messages.some((m) => m.type === "user");
    if (userSent && apiSuggestedActions.length > 0) {
      return apiSuggestedActions;
    }
    if (userSent) return [];

    if (isComplete) {
      return [
        { label: "Set this up for me", value: "I'd like you to set this up for my business." },
        { label: "What does it cost?", value: "How much does this cost?" },
        { label: "Show me something else", value: "Can you show me other services?" },
      ];
    }

    if (currentSlideIndex === 0) {
      return [
        { label: "Tell me more", value: "Tell me more about this." },
        { label: "How long is this?", value: "How long will this presentation take?" },
        { label: "Skip to pricing", value: "Can you skip to the pricing information?" },
      ];
    }

    // Mid-presentation — fewer, contextual
    return [
      { label: "Explain this slide", value: "Can you explain this slide in more detail?" },
      { label: "I have a question", value: "I have a question about this." },
    ];
  }, [currentSlideIndex, isComplete, messages, apiSuggestedActions]);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";

  return (
    <div className="pitch-root flex flex-1 min-h-0">
      {/* Left: Slide player */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
        {/* Slide toolbar — share + invite */}
        <div className="shrink-0 flex items-center justify-end gap-2 px-3 py-1.5 bg-gray-900/80 border-b border-white/5">
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            aria-label="Share this presentation"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            aria-label="Invite a colleague"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>

        {/* Player */}
        <FibonaccoPlayer
          presentation={presentation}
          hideOverlayUI
          onSlideChange={handleSlideChange}
          onComplete={handleComplete}
        />
      </div>

      {/* Right: Sarah panel — desktop */}
      <aside
        className="hidden md:flex md:w-[380px] md:flex-none md:flex-col min-h-0 border-l"
        style={{
          backgroundColor: "var(--p-panel)",
          borderColor: "var(--p-border)",
        }}
      >
        <SarahPanel
          messages={messages}
          isTyping={isTyping}
          onSend={handleUserMessage}
          onEndSession={onClose}
          suggestedActions={suggestedActions}
        />
      </aside>

      {/* Mobile: Sarah drawer */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          className="fixed bottom-4 right-4 z-[60] rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          style={{
            backgroundColor: "var(--p-amber)",
            color: "var(--p-bg)",
          }}
          aria-expanded={drawerOpen}
          aria-controls="sarah-mobile-drawer"
        >
          <MessageCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          {drawerOpen ? "Close" : "Ask Sarah"}
        </button>

        <AnimatePresence>
          {drawerOpen && (
            <motion.aside
              id="sarah-mobile-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[55] flex flex-col rounded-t-2xl border-t shadow-2xl overflow-hidden"
              style={{
                maxHeight: "min(70vh, 520px)",
                backgroundColor: "var(--p-panel)",
                borderColor: "var(--p-border)",
              }}
              aria-label="Sarah conversation"
            >
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <SarahPanel
                  messages={messages}
                  isTyping={isTyping}
                  onSend={handleUserMessage}
                  onEndSession={onClose}
                  suggestedActions={suggestedActions}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Share overlay */}
      <AnimatePresence>
        {showShare && (
          <ShareOverlay
            url={shareUrl}
            title={campaign.title}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
