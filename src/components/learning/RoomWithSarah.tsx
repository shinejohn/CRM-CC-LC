import { useCallback, useEffect, useMemo, useRef } from "react";
import { PitchShell } from "@/pitch/shell/PitchShell";
import { SarahPanel } from "@/pitch/shell/SarahPanel";
import { FibonaccoPlayer } from "@/components/LearningCenter/Presentation/FibonaccoPlayer";
import { useSarahNarration } from "./useSarahNarration";
import type { Campaign } from "@/services/types/learning.types";
import type { Presentation, Slide } from "@/types/learning";

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

    // Surface related campaigns if available
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

  // Build slide-based progress steps
  const progressSteps = useMemo(
    () =>
      rawSlides.map((s, i) => ({
        key: `slide-${i}`,
        label: s.title ?? `Slide ${i + 1}`,
      })),
    [rawSlides]
  );

  return (
    <PitchShell
      variant="learn"
      embed
      onClose={onClose}
      showProgress={progressSteps.length > 1}
      currentStep={1}
      steps={progressSteps}
      completedSteps={[]}
      rightPanel={
        <SarahPanel
          messages={messages}
          isTyping={isTyping}
          onSend={handleUserMessage}
        />
      }
    >
      <FibonaccoPlayer
        presentation={presentation}
        hideOverlayUI
        onSlideChange={handleSlideChange}
        onComplete={handleComplete}
      />
    </PitchShell>
  );
}
