import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
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

function campaignToPresentation(campaign: Campaign, lp: LandingPageData): Presentation {
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

export default function RoomWithSarah({ campaign, onClose, onNavigateCampaign }: RoomWithSarahProps) {
  const lp = getLandingPage(campaign);
  const rawSlides = getSlides(campaign);
  const greetedRef = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const presentation = useMemo(
    () => campaignToPresentation(campaign, lp),
    [campaign, lp]
  );

  const {
    messages,
    isTyping,
    appendSarah,
    onSlideChange,
    greet,
    complete,
    handleUserMessage,
  } = useSarahNarration();

  // Greet on mount
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    greet(campaign);
  }, [campaign, greet]);

  const handleSlideChange = useCallback(
    (slideIndex: number) => {
      const slide = rawSlides[slideIndex];
      if (slide) {
        onSlideChange(slideIndex, slide);
      }
    },
    [rawSlides, onSlideChange]
  );

  const handleComplete = useCallback(() => {
    complete(campaign);

    const raw = campaign as Record<string, unknown>;
    const connections = (raw.connections ?? {}) as Record<string, unknown>;
    const leadsTo = connections.leads_to as string[] | undefined;
    const related = connections.related as string[] | undefined;
    const nextSlugs = leadsTo ?? related ?? [];

    if (nextSlugs.length > 0 && onNavigateCampaign) {
      setTimeout(() => {
        appendSarah(
          `If you'd like to explore further, I have ${nextSlugs.length === 1 ? "another topic" : "some related topics"} that might interest you.`,
          2000
        );
      }, 0);
    }
  }, [campaign, complete, appendSarah, onNavigateCampaign]);

  return (
    <div className="pitch-root flex flex-1 min-h-0">
      {/* Left: Slide player — fills available width */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
        <FibonaccoPlayer
          presentation={presentation}
          hideOverlayUI
          onSlideChange={handleSlideChange}
          onComplete={handleComplete}
        />
      </div>

      {/* Right: Sarah panel — desktop only */}
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
        />
      </aside>

      {/* Mobile: Sarah drawer toggle + drawer */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          className="fixed bottom-4 right-4 z-[60] rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          style={{ backgroundColor: "var(--p-amber)", color: "var(--p-bg)" }}
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
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
