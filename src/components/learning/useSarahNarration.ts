import { useCallback, useEffect, useRef, useState } from "react";
import type { SarahMessage } from "@/pitch/types";
import type { Campaign } from "@/services/types/learning.types";

interface SarahChatResponse {
  response: string;
  suggested_actions: Array<{ label: string; value: string }>;
  session_id: string | null;
  audio_url?: string | null;
  source?: "pre_recorded" | "ai";
}

interface SarahContext {
  opening_line?: string;
  closing_line?: string;
}

interface LessonMeta {
  difficulty?: string;
  duration_minutes?: number;
  learning_objectives?: string[];
}

interface SlideData {
  narration?: string;
  title?: string;
  content?: Record<string, unknown>;
}

function extractSarahContext(campaign: Campaign): SarahContext {
  const raw = campaign as Record<string, unknown>;
  return (raw.sarah_context ?? {}) as SarahContext;
}

function extractLessonMeta(campaign: Campaign): LessonMeta {
  const raw = campaign as Record<string, unknown>;
  return (raw.lesson_meta ?? {}) as LessonMeta;
}

function extractLandingPage(campaign: Campaign): Record<string, unknown> {
  const raw = campaign as Record<string, unknown>;
  return (raw.landing_page ?? {}) as Record<string, unknown>;
}

function makeId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getGreeting(campaign: Campaign): string {
  const sarah = extractSarahContext(campaign);
  if (sarah.opening_line) return sarah.opening_line;

  const lp = extractLandingPage(campaign);
  const tone = (lp.ai_tone as string) ?? "";
  const title = campaign.title;

  if (tone.toLowerCase().includes("warm")) {
    return `Welcome! I'm Sarah, and I'm excited to walk you through "${title}" with you. Let's get started.`;
  }
  if (tone.toLowerCase().includes("urgent")) {
    return `Hi, I'm Sarah. "${title}" is something every local business needs to know about — let me show you why.`;
  }
  return `Hi there! I'm Sarah, your AI business advisor. I'll be walking you through "${title}" — feel free to ask me anything along the way.`;
}

export function getCompletionMessage(campaign: Campaign): string {
  const sarah = extractSarahContext(campaign);
  if (sarah.closing_line) return sarah.closing_line;

  const lp = extractLandingPage(campaign);
  const goal = (lp.ai_goal as string) ?? "";

  if (goal.toLowerCase().includes("provision") || goal.toLowerCase().includes("setup")) {
    return "That's the full picture! Would you like me to set this up for your business? I can handle everything right here.";
  }
  return "That wraps up the presentation! If you have any questions or want to explore next steps, I'm right here.";
}

export interface UseSarahNarrationReturn {
  messages: SarahMessage[];
  isTyping: boolean;
  suggestedActions: Array<{ label: string; value: string }>;
  appendSarah: (text: string, delay?: number) => void;
  onSlideChange: (index: number, slide: SlideData) => void;
  greet: (campaign: Campaign) => void;
  complete: (campaign: Campaign) => void;
  handleUserMessage: (text: string) => void;
}

interface UseSarahNarrationOptions {
  campaignId?: string;
  campaign?: Campaign;
  speakerOn?: boolean;
}

export function useSarahNarration(options: UseSarahNarrationOptions = {}): UseSarahNarrationReturn {
  const [messages, setMessages] = useState<SarahMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<Array<{ label: string; value: string }>>([]);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastNarratedSlideRef = useRef<number>(-1);
  const sessionIdRef = useRef<string | null>(null);
  const currentSlideRef = useRef<{ index: number; slide: SlideData | null }>({ index: 0, slide: null });
  const chatAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup chat audio on unmount
  useEffect(() => {
    return () => {
      if (chatAudioRef.current) {
        chatAudioRef.current.pause();
        chatAudioRef.current = null;
      }
    };
  }, []);

  const playChatAudio = useCallback((audioUrl: string) => {
    if (!options.speakerOn) return;
    // Stop any currently playing chat audio
    if (chatAudioRef.current) {
      chatAudioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    chatAudioRef.current = audio;
    audio.play().catch(() => {
      // Browser may block autoplay — silently ignore
    });
  }, [options.speakerOn]);

  const appendSarah = useCallback((text: string, delay = 800) => {
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), text, timestamp: timestamp(), type: "sarah" },
      ]);
      setIsTyping(false);
    }, delay);
  }, []);

  const greet = useCallback(
    (campaign: Campaign) => {
      appendSarah(getGreeting(campaign), 500);
    },
    [appendSarah]
  );

  const complete = useCallback(
    (campaign: Campaign) => {
      appendSarah(getCompletionMessage(campaign), 1200);
    },
    [appendSarah]
  );

  const onSlideChange = useCallback(
    (index: number, slide: SlideData) => {
      currentSlideRef.current = { index, slide };

      if (index === lastNarratedSlideRef.current) return;
      lastNarratedSlideRef.current = index;

      const narration = slide.narration;
      if (!narration) return;

      // Use first ~200 chars of narration for sidebar — enough context without wall of text
      const abbreviated =
        narration.length > 220
          ? narration.slice(0, 220).replace(/\s\S*$/, "") + "..."
          : narration;

      appendSarah(abbreviated, 600 + Math.min(index * 100, 400));
    },
    [appendSarah]
  );

  const handleUserMessage = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), text, timestamp: timestamp(), type: "user" },
      ]);

      setIsTyping(true);

      const campaign = options.campaign;
      const lp = campaign ? extractLandingPage(campaign) : {};
      const currentSlide = currentSlideRef.current;
      const rawSlides = campaign ? ((campaign as Record<string, unknown>).slides as SlideData[] | undefined) : undefined;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

      fetch(`${apiUrl}/sarah/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          campaign_id: options.campaignId ?? campaign?.id ?? "unknown",
          slide_index: currentSlide.index,
          session_id: sessionIdRef.current,
          context: {
            title: campaign?.title ?? "",
            description: campaign?.description ?? "",
            ai_tone: (lp.ai_tone as string) ?? "",
            ai_goal: (lp.ai_goal as string) ?? "",
            current_slide_title: currentSlide.slide?.title ?? "",
            current_slide_narration: currentSlide.slide?.narration ?? "",
            total_slides: rawSlides?.length ?? 10,
          },
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<SarahChatResponse>;
        })
        .then((data) => {
          if (data.session_id) {
            sessionIdRef.current = data.session_id;
          }
          if (data.suggested_actions?.length) {
            setSuggestedActions(data.suggested_actions);
          }
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              text: data.response,
              timestamp: timestamp(),
              type: "sarah",
              audio_url: data.audio_url ?? undefined,
            },
          ]);
          setIsTyping(false);

          // Play audio if available and speaker is on
          if (data.audio_url) {
            playChatAudio(data.audio_url);
          }
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              text: "I had a brief connection issue. Could you try asking that again?",
              timestamp: timestamp(),
              type: "sarah",
            },
          ]);
          setIsTyping(false);
        });
    },
    [options.campaign, options.campaignId, playChatAudio]
  );

  return {
    messages,
    isTyping,
    suggestedActions,
    appendSarah,
    onSlideChange,
    greet,
    complete,
    handleUserMessage,
  };
}
