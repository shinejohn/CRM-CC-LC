import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  UserPlus,
  PhoneOff,
} from "lucide-react";
import type { SarahMessage } from "../types";
import { cn } from "@/lib/utils";

export interface SarahPanelProps {
  messages: SarahMessage[];
  onSend?: (text: string) => void;
  isTyping?: boolean;
  onEndSession?: () => void;
  className?: string;
}

export function SarahPanel({
  messages,
  onSend,
  isTyping,
  onEndSession,
  className,
}: SarahPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [micActive, setMicActive] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!onSend || !draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  }

  return (
    <div
      className={cn("flex flex-col min-h-0 h-full", className)}
      style={{ backgroundColor: "var(--p-panel)" }}
    >
      {/* Header with Sarah info + action toolbar */}
      <div
        className="shrink-0 border-b"
        style={{ borderColor: "var(--p-border)" }}
      >
        {/* Sarah identity row */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              backgroundColor: "var(--p-amber)",
              color: "var(--p-bg)",
            }}
            aria-hidden
          >
            S
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[15px] font-bold"
              style={{ color: "var(--p-text)" }}
            >
              Sarah
            </div>
            <div className="text-xs" style={{ color: "var(--p-muted)" }}>
              Account Manager
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div
          className="flex items-center justify-between px-3 pb-2"
        >
          <div className="flex items-center gap-1">
            {/* Microphone toggle */}
            <button
              type="button"
              onClick={() => setMicActive((v) => !v)}
              className={cn(
                "rounded-lg p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]",
                micActive
                  ? "text-[var(--p-muted)] hover:bg-white/10 hover:text-white"
                  : "bg-red-500/20 text-red-400"
              )}
              aria-label={micActive ? "Mute microphone" : "Unmute microphone"}
              title={micActive ? "Mic on — click to mute" : "Mic off — click to speak"}
            >
              {micActive ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>

            {/* Speaker / mute AI toggle */}
            <button
              type="button"
              onClick={() => setSpeakerOn((v) => !v)}
              className={cn(
                "rounded-lg p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]",
                speakerOn
                  ? "text-[var(--p-muted)] hover:bg-white/10 hover:text-white"
                  : "bg-orange-500/20 text-orange-400"
              )}
              aria-label={speakerOn ? "Mute Sarah" : "Unmute Sarah"}
              title={speakerOn ? "Speaker on — click to mute Sarah" : "Speaker muted — click to unmute"}
            >
              {speakerOn ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Add person */}
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--p-muted)] hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              aria-label="Add a person to this conversation"
              title="Add person"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* End conversation */}
          <button
            type="button"
            onClick={onEndSession}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="End conversation"
            title="End conversation"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.article
              key={m.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-[var(--p-radius-md)] px-4 py-3 pl-[13px] border-l-[3px]"
              style={{
                borderLeftColor: "var(--p-amber)",
                backgroundColor: "var(--p-message-bg)",
              }}
            >
              <p
                className="text-sm leading-snug"
                style={{ color: "var(--p-text)" }}
              >
                {m.text}
              </p>
              <p
                className="mt-2 text-[11px]"
                style={{ color: "var(--p-muted)" }}
              >
                {m.timestamp}
              </p>
            </motion.article>
          ))}
        </AnimatePresence>

        {isTyping ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-2 py-2"
            style={{ color: "var(--p-muted)" }}
            aria-label="Sarah is typing"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--p-amber)" }}
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        ) : null}
      </div>

      {/* Input area */}
      {onSend ? (
        <form
          onSubmit={handleSubmit}
          className="shrink-0 flex items-center gap-2 px-3 py-3 border-t"
          style={{ borderColor: "var(--p-border)" }}
        >
          <button
            type="button"
            onClick={() => setMicActive((v) => !v)}
            className={cn(
              "shrink-0 rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]",
              micActive
                ? "text-[var(--p-muted)] hover:text-white"
                : "bg-red-500/20 text-red-400"
            )}
            aria-label={micActive ? "Mute microphone" : "Unmute microphone"}
            title={micActive ? "Mic on — click to mute" : "Mic off — click to speak"}
          >
            {micActive ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>
          <label htmlFor="sarah-panel-input" className="sr-only">
            Message Sarah
          </label>
          <input
            id="sarah-panel-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask Sarah anything..."
            className="flex-1 min-w-0 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--p-teal)]"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--p-border)",
              color: "var(--p-text)",
            }}
          />
          <button
            type="submit"
            className="rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] disabled:opacity-40"
            style={{ color: "var(--p-teal)" }}
            aria-label="Send message"
            disabled={!draft.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      ) : null}
    </div>
  );
}
