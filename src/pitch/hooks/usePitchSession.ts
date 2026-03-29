import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  createSession,
  getSession,
  logEvent as logEventApi,
  resolveCommunitySlug,
  updateSession as updateSessionApi,
  type EntryContext,
} from "@/pitch/api/pitchApi";
import type { PitchSession } from "@/pitch/types";

const LS_SESSION = "pitch_session_id";
const LS_STEP = "pitch_current_step";

export function usePitchSession(communitySlug: string | undefined) {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<PitchSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resolvedCommunityId, setResolvedCommunityId] = useState<number | null>(null);
  const sessionRef = useRef<PitchSession | null>(null);
  sessionRef.current = session;

  const resumeParam = searchParams.get("resume");
  const sourceParam = searchParams.get("source") ?? "direct";

  useEffect(() => {
    if (!communitySlug) {
      setError("Community is required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function boot() {
      setIsLoading(true);
      setError(null);
      try {
        const comm = await resolveCommunitySlug(communitySlug!);
        if (cancelled) return;
        setResolvedCommunityId(comm.id);

        const tryLoad = async (id: string): Promise<PitchSession | null> => {
          try {
            return await getSession(id);
          } catch {
            return null;
          }
        };

        const storedId = localStorage.getItem(LS_SESSION) ?? undefined;
        const resumeId = resumeParam ?? storedId;

        if (resumeId) {
          const loaded = await tryLoad(resumeId);
          if (cancelled) return;
          if (loaded) {
            if (loaded.status === "converted") {
              localStorage.removeItem(LS_SESSION);
              localStorage.removeItem(LS_STEP);
            } else {
              setSession(loaded);
              localStorage.setItem(LS_SESSION, loaded.id);
              localStorage.setItem(LS_STEP, loaded.lastStep);
              setShowResumePrompt(true);
              setIsLoading(false);
              return;
            }
          } else {
            localStorage.removeItem(LS_SESSION);
            localStorage.removeItem(LS_STEP);
          }
        }

        const entry: EntryContext = {
          community_id: comm.id,
          entry_platform: sourceParam,
          entry_context:
            typeof window !== "undefined"
              ? (window.location.pathname + window.location.search).slice(0, 500)
              : undefined,
          status: "pitching",
          last_step: "identify",
        };
        const fresh = await createSession(entry);
        if (cancelled) return;
        setSession(fresh);
        localStorage.setItem(LS_SESSION, fresh.id);
        localStorage.setItem(LS_STEP, fresh.lastStep);
        setShowResumePrompt(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unable to start session");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [communitySlug, resumeParam, sourceParam]);

  const currentStep = useMemo(() => session?.lastStep ?? "identify", [session?.lastStep]);

  const updateStep = useCallback(async (step: string, data?: Partial<PitchSession>) => {
    const s = sessionRef.current;
    if (!s?.id) return;
    const saved = await updateSessionApi(s.id, { ...data, lastStep: step });
    setSession(saved);
    localStorage.setItem(LS_SESSION, saved.id);
    localStorage.setItem(LS_STEP, step);
  }, []);

  const logEvent = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      if (!session?.id) return;
      logEventApi(session.id, type, payload ?? {}).catch(console.error);
    },
    [session?.id]
  );

  const resumeSession = useCallback(() => {
    setShowResumePrompt(false);
  }, []);

  const refreshSession = useCallback(async () => {
    const id = sessionRef.current?.id;
    if (!id) return;
    try {
      const next = await getSession(id);
      setSession(next);
    } catch {
      setError("Could not refresh session");
    }
  }, []);

  const startFresh = useCallback(async () => {
    if (!resolvedCommunityId) return;
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_STEP);
    setShowResumePrompt(false);
    setIsLoading(true);
    setError(null);
    try {
      const entry: EntryContext = {
        community_id: resolvedCommunityId,
        entry_platform: sourceParam,
        entry_context:
          typeof window !== "undefined"
            ? (window.location.pathname + window.location.search).slice(0, 500)
            : undefined,
        status: "pitching",
        last_step: "identify",
      };
      const fresh = await createSession(entry);
      setSession(fresh);
      localStorage.setItem(LS_SESSION, fresh.id);
      localStorage.setItem(LS_STEP, fresh.lastStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start session");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedCommunityId, sourceParam]);

  return {
    session,
    isLoading,
    error,
    currentStep,
    updateStep,
    logEvent,
    resumeSession,
    startFresh,
    showResumePrompt,
    sourceParam,
    refreshSession,
  };
}
