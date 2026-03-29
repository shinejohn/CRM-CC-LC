import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Volume2 } from "lucide-react";
import type { SarahMessage } from "../types";
import { cn } from "@/lib/utils";

export interface SarahPanelProps {
  messages: SarahMessage[];
  onSend?: (text: string) => void;
  isTyping?: boolean;
  className?: string;
}

export function SarahPanel({ messages, onSend, isTyping, className }: SarahPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

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
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0 border-b"
        style={{ borderColor: "var(--p-border)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: "var(--p-amber)", color: "var(--p-bg)" }}
          aria-hidden
        >
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold" style={{ color: "var(--p-text)" }}>
            Sarah
          </div>
          <div className="text-xs" style={{ color: "var(--p-muted)" }}>
            Account Manager
          </div>
        </div>
        <button
          type="button"
          className="rounded-md p-2 transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ color: "var(--p-muted)" }}
          aria-label="Audio"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

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
              <p className="text-sm leading-snug" style={{ color: "var(--p-text)" }}>
                {m.text}
              </p>
              <p className="mt-2 text-[11px]" style={{ color: "var(--p-muted)" }}>
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
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        ) : null}
      </div>

      {onSend ? (
        <form
          onSubmit={handleSubmit}
          className="shrink-0 flex items-center gap-2 px-3 py-3 border-t"
          style={{ borderColor: "var(--p-border)" }}
        >
          <Mic className="w-5 h-5 shrink-0" style={{ color: "var(--p-muted)" }} aria-hidden />
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
