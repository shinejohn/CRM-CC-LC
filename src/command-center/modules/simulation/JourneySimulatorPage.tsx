import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Activity,
  ArrowRight,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Gauge,
  AlertCircle,
  Loader2,
  Compass,
  SkipForward,
  Phone,
  Eye,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { useTimelineList, useSimulation } from './useJourneySimulation';
import type {
  EngagementProfile,
  SimulationDay,
  SimulationAction,
  SimulationSlide,
  StageTransition,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROFILE_OPTIONS: { value: EngagementProfile; label: string; color: string; activeClass: string }[] = [
  { value: 'engaged', label: 'Engaged', color: 'bg-emerald-500', activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-400' },
  { value: 'passive', label: 'Passive', color: 'bg-amber-500', activeClass: 'bg-amber-500 text-white ring-2 ring-amber-400' },
  { value: 'cold', label: 'Cold', color: 'bg-red-500', activeClass: 'bg-red-600 text-white ring-2 ring-red-400' },
];

const SPEED_OPTIONS = [1, 2, 5] as const;

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  system: Activity,
  check: Activity,
};

function getChannelIcon(channel: string): LucideIcon {
  return CHANNEL_ICONS[channel] ?? Activity;
}

function getActionIcon(action: SimulationAction): LucideIcon {
  if (action.action_type === 'update_stage') return ArrowRight;
  if (action.action_type === 'check_engagement') return Activity;
  return getChannelIcon(action.channel);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Vertical timeline rail showing all days */
function DayRail({
  days,
  activeDay,
  onSelectDay,
}: {
  days: SimulationDay[];
  activeDay: number;
  onSelectDay: (day: number) => void;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeDay]);

  return (
    <nav
      className="w-[200px] shrink-0 overflow-y-auto border-r border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] pr-2"
      aria-label="Day timeline"
    >
      <div className="py-4 pl-3 space-y-1">
        {days.map((day) => {
          const isActive = day.day === activeDay;
          const hasTransition = day.stage_transition !== null;
          const allSkipped = day.actions.length > 0 && day.actions.every((a) => !a.fires);
          const primaryAction = day.actions[0];
          const Icon = primaryAction ? getActionIcon(primaryAction) : Activity;

          return (
            <div key={day.day}>
              {hasTransition && (
                <StageTransitionMarker transition={day.stage_transition!} />
              )}
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onSelectDay(day.day)}
                aria-label={`Day ${day.day}${allSkipped ? ' (skipped)' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-[var(--nexus-accent-primary)] text-white shadow-md'
                    : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'}
                  ${allSkipped && !isActive ? 'opacity-50 line-through' : ''}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>Day {day.day}</span>
                {day.actions.length > 1 && (
                  <span className="ml-auto text-xs opacity-70">
                    {day.actions.length}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

/** Colored divider for stage transitions in the rail */
function StageTransitionMarker({ transition }: { transition: StageTransition }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 my-1">
      <div className="flex-1 h-px bg-[var(--nexus-accent-primary)]" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nexus-accent-primary)]">
        {transition.from} &rarr; {transition.to}
      </span>
      <div className="flex-1 h-px bg-[var(--nexus-accent-primary)]" />
    </div>
  );
}

/** Email preview card — looks like an email client */
function EmailPreview({ action }: { action: SimulationAction }) {
  const template = action.template;
  if (!template) return null;

  return (
    <div className="rounded-xl border border-[var(--nexus-card-border)] shadow-sm overflow-hidden bg-white">
      {/* Email header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Mail className="w-4 h-4" />
          <span className="font-medium text-gray-700">From:</span>
          <span>Day.News &lt;hello@day.news&gt;</span>
        </div>
        <div className="text-lg font-semibold text-gray-900">{template.subject}</div>
        <div className="text-xs text-gray-400 mt-1">Template: {template.name}</div>
      </div>

      {/* Email body */}
      <div className="px-6 py-5">
        <div
          className="prose prose-sm max-w-none text-gray-700"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: template.body_html }}
        />
      </div>

      {/* Campaign link hint */}
      {action.campaign && (
        <div className="border-t border-gray-100 bg-blue-50 px-6 py-3 flex items-center gap-2 text-sm text-blue-700">
          <ArrowRight className="w-4 h-4" />
          <span>This email links to: <strong>{action.campaign.title}</strong></span>
        </div>
      )}
    </div>
  );
}

/** Campaign / landing page slide preview */
function CampaignPreview({ action }: { action: SimulationAction }) {
  const campaign = action.campaign;
  if (!campaign) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
        <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)]">
          Landing Page Preview
        </h3>
        <span className="ml-auto text-sm text-[var(--nexus-text-tertiary)]">
          {campaign.slide_count} slide{campaign.slide_count !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {campaign.slides.map((slide) => (
          <SlideCard key={slide.slide_num} slide={slide} ctaPrimary={campaign.cta_primary} />
        ))}
      </div>
    </div>
  );
}

/** Single slide card */
function SlideCard({ slide, ctaPrimary }: { slide: SimulationSlide; ctaPrimary: string }) {
  const isCta = slide.component.toLowerCase().includes('cta');

  return (
    <div className="rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
          {slide.component}
        </span>
        <span className="text-xs text-[var(--nexus-text-tertiary)]">
          Slide {slide.slide_num}
        </span>
      </div>

      <h4 className="font-semibold text-[var(--nexus-text-primary)] mb-1">{slide.title}</h4>

      {slide.narration && (
        <p className="text-sm text-[var(--nexus-text-secondary)] italic leading-relaxed">
          &ldquo;{slide.narration}&rdquo;
        </p>
      )}

      {isCta && (
        <div className="mt-3">
          <span className="inline-block px-4 py-1.5 rounded-lg bg-[var(--nexus-accent-primary)] text-white text-sm font-medium">
            {ctaPrimary}
          </span>
        </div>
      )}
    </div>
  );
}

/** SMS chat bubble */
function SmsPreview({ action }: { action: SimulationAction }) {
  const body = action.template?.body_preview ?? action.template?.subject ?? 'SMS message';

  return (
    <div className="flex justify-end">
      <div className="max-w-md rounded-2xl rounded-br-sm bg-emerald-500 text-white px-5 py-3 shadow-md">
        <p className="text-sm leading-relaxed">{body}</p>
        <div className="text-[10px] opacity-70 text-right mt-1">Day.News SMS</div>
      </div>
    </div>
  );
}

/** System action card (check_engagement, update_stage, etc.) */
function SystemActionCard({ action }: { action: SimulationAction }) {
  const isTransition = action.action_type === 'update_stage';
  const Icon = isTransition ? ArrowRight : Activity;

  return (
    <div className={`
      rounded-lg border px-5 py-4 flex items-start gap-3
      ${isTransition
        ? 'border-purple-200 bg-purple-50'
        : 'border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]'}
    `}>
      <Icon className={`w-5 h-5 mt-0.5 ${isTransition ? 'text-purple-600' : 'text-[var(--nexus-text-tertiary)]'}`} />
      <div>
        <div className="font-medium text-[var(--nexus-text-primary)] capitalize">
          {action.action_type.replace(/_/g, ' ')}
        </div>
        <div className="text-sm text-[var(--nexus-text-secondary)] mt-0.5">
          Channel: {action.channel}
          {action.conditions && Object.keys(action.conditions).length > 0 && (
            <span className="ml-2 text-xs text-[var(--nexus-text-tertiary)]">
              ({Object.entries(action.conditions).map(([k, v]) => `${k}: ${String(v)}`).join(', ')})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Skipped action card */
function SkippedActionCard({ action }: { action: SimulationAction }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-4 opacity-70">
      <div className="flex items-center gap-2 mb-1">
        <SkipForward className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-500 line-through capitalize">
          {action.action_type.replace(/_/g, ' ')} ({action.channel})
        </span>
      </div>
      {action.skip_reason && (
        <p className="text-sm text-gray-400 ml-6">
          Skipped: {action.skip_reason}
        </p>
      )}
    </div>
  );
}

/** Renders the center stage for a single day */
function DayContent({ day }: { day: SimulationDay }) {
  if (day.actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--nexus-text-tertiary)] py-16">
        <Activity className="w-8 h-8 mb-2 opacity-50" />
        <p>No actions scheduled for Day {day.day}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {day.stage_transition && (
        <div className="rounded-lg bg-purple-50 border border-purple-200 px-5 py-3 flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-800">
            Stage transition: {day.stage_transition.from} &rarr; {day.stage_transition.to}
          </span>
        </div>
      )}

      {day.actions.map((action, idx) => (
        <ActionBlock key={idx} action={action} />
      ))}
    </div>
  );
}

/** Dispatches an action to the right preview component */
function ActionBlock({ action }: { action: SimulationAction }) {
  // Skipped actions
  if (!action.fires) {
    return <SkippedActionCard action={action} />;
  }

  // Email
  if (action.action_type === 'send_email' || action.channel === 'email') {
    return (
      <>
        <EmailPreview action={action} />
        {action.campaign && <CampaignPreview action={action} />}
      </>
    );
  }

  // SMS
  if (action.channel === 'sms') {
    return <SmsPreview action={action} />;
  }

  // System / check / stage transition
  return <SystemActionCard action={action} />;
}

/** Summary stat pill */
function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--nexus-bg-secondary)] text-sm">
      <span className="font-semibold text-[var(--nexus-text-primary)]">{value}</span>
      <span className="text-[var(--nexus-text-tertiary)]">{label}</span>
    </div>
  );
}

/** Bottom playback bar */
function PlaybackBar({
  currentDay,
  totalDays,
  playing,
  speed,
  onTogglePlay,
  onSpeedChange,
  onPrev,
  onNext,
}: {
  currentDay: number;
  totalDays: number;
  playing: boolean;
  speed: number;
  onTogglePlay: () => void;
  onSpeedChange: (s: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const progress = totalDays > 0 ? ((currentDay) / totalDays) * 100 : 0;

  return (
    <div className="border-t border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] px-6 py-3 flex items-center gap-4">
      {/* Play/Pause */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? 'Pause simulation' : 'Play simulation'}
        className="p-2 rounded-full bg-[var(--nexus-accent-primary)] text-white hover:opacity-90 transition-opacity"
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Prev / Next */}
      <button
        type="button"
        onClick={onPrev}
        disabled={currentDay <= 1}
        aria-label="Previous day"
        className="p-1.5 rounded-lg hover:bg-[var(--nexus-bg-secondary)] disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-[var(--nexus-text-secondary)]" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentDay >= totalDays}
        aria-label="Next day"
        className="p-1.5 rounded-lg hover:bg-[var(--nexus-bg-secondary)] disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-[var(--nexus-text-secondary)]" />
      </button>

      {/* Progress bar */}
      <div className="flex-1 relative h-2 bg-[var(--nexus-bg-secondary)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentDay} aria-valuemin={1} aria-valuemax={totalDays} aria-label="Timeline progress">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[var(--nexus-accent-primary)] rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <span className="text-xs text-[var(--nexus-text-tertiary)] whitespace-nowrap min-w-[4rem] text-right">
        Day {currentDay} / {totalDays}
      </span>

      {/* Speed */}
      <div className="flex items-center gap-1 border-l border-[var(--nexus-card-border)] pl-4">
        <Gauge className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            aria-label={`Set speed to ${s}x`}
            className={`
              px-2 py-0.5 rounded text-xs font-medium transition-colors
              ${speed === s
                ? 'bg-[var(--nexus-accent-primary)] text-white'
                : 'text-[var(--nexus-text-tertiary)] hover:bg-[var(--nexus-bg-secondary)]'}
            `}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function JourneySimulatorPage() {
  const { timeline: routeTimeline } = useParams<{ timeline?: string }>();

  // Config state
  const [selectedTimeline, setSelectedTimeline] = useState(routeTimeline ?? '');
  const [profile, setProfile] = useState<EngagementProfile>('engaged');
  const [businessName, setBusinessName] = useState('Acme Coffee Shop');
  const [communityName, setCommunityName] = useState('Springfield');

  // Playback state
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Queries
  const timelinesQuery = useTimelineList();
  const simulationQuery = useSimulation({
    timeline: selectedTimeline,
    profile,
    business_name: businessName,
    community_name: communityName,
  });

  const days = simulationQuery.data?.days ?? [];
  const summary = simulationQuery.data?.summary;
  const totalDays = days.length;
  const activeDay = days[activeDayIndex] ?? null;

  // Sync route param
  useEffect(() => {
    if (routeTimeline && routeTimeline !== selectedTimeline) {
      setSelectedTimeline(routeTimeline);
    }
  }, [routeTimeline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset day index when simulation data changes
  useEffect(() => {
    setActiveDayIndex(0);
    setPlaying(false);
  }, [selectedTimeline, profile, businessName, communityName]);

  // Auto-advance timer
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (playing && totalDays > 0) {
      intervalRef.current = setInterval(() => {
        setActiveDayIndex((prev) => {
          if (prev >= totalDays - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000 / speed);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, totalDays]);

  const handlePrev = useCallback(() => {
    setActiveDayIndex((p) => Math.max(0, p - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveDayIndex((p) => Math.min(totalDays - 1, p + 1));
  }, [totalDays]);

  const handleSelectDay = useCallback((dayNum: number) => {
    const idx = days.findIndex((d) => d.day === dayNum);
    if (idx !== -1) setActiveDayIndex(idx);
  }, [days]);

  // Pick first timeline automatically when timelines load and none selected
  useEffect(() => {
    if (!selectedTimeline && timelinesQuery.data && timelinesQuery.data.length > 0) {
      setSelectedTimeline(timelinesQuery.data[0].slug);
    }
  }, [timelinesQuery.data, selectedTimeline]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <div className="px-6 pt-6">
        <PageHeader
          title="Journey Simulator"
          subtitle="Walk through the Manifest Destiny timeline as an SMB owner would experience it"
          icon={Compass}
        />
      </div>

      {/* ── Config Bar ── */}
      <div className="px-6 pb-4 flex flex-wrap items-end gap-4 border-b border-[var(--nexus-card-border)]">
        {/* Timeline selector */}
        <div className="flex flex-col gap-1">
          <label htmlFor="sim-timeline" className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
            Timeline
          </label>
          <select
            id="sim-timeline"
            value={selectedTimeline}
            onChange={(e) => setSelectedTimeline(e.target.value)}
            className="rounded-lg border border-[var(--nexus-input-border)] bg-[var(--nexus-input-bg)] px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
          >
            <option value="">Select a timeline...</option>
            {timelinesQuery.data?.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name} ({t.duration_days}d / {t.action_count} actions)
              </option>
            ))}
          </select>
        </div>

        {/* Profile toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
            Engagement Profile
          </span>
          <div className="flex rounded-lg overflow-hidden border border-[var(--nexus-input-border)]" role="radiogroup" aria-label="Engagement profile">
            {PROFILE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={profile === opt.value}
                aria-label={`${opt.label} profile`}
                onClick={() => setProfile(opt.value)}
                className={`
                  px-4 py-2 text-sm font-medium transition-all
                  ${profile === opt.value
                    ? opt.activeClass
                    : 'bg-[var(--nexus-input-bg)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Business name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="sim-biz" className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
            Business Name
          </label>
          <input
            id="sim-biz"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="rounded-lg border border-[var(--nexus-input-border)] bg-[var(--nexus-input-bg)] px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)] w-48"
          />
        </div>

        {/* Community name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="sim-community" className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
            Community
          </label>
          <input
            id="sim-community"
            type="text"
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
            className="rounded-lg border border-[var(--nexus-input-border)] bg-[var(--nexus-input-bg)] px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)] w-40"
          />
        </div>

        {/* Summary stats */}
        {summary && (
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <StatPill label="emails" value={summary.emails_fired} />
            <StatPill label="skipped" value={summary.emails_skipped} />
            <StatPill label="SMS" value={summary.sms_fired} />
            <StatPill label="transitions" value={summary.stage_transitions} />
          </div>
        )}
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Loading / Error / Empty states */}
        {simulationQuery.isLoading && selectedTimeline && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--nexus-accent-primary)]" />
            <span className="ml-3 text-[var(--nexus-text-secondary)]">Simulating journey...</span>
          </div>
        )}

        {simulationQuery.isError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--nexus-accent-danger)]">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">Failed to load simulation. Please try a different configuration.</p>
          </div>
        )}

        {!selectedTimeline && !simulationQuery.isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--nexus-text-tertiary)]">
            <Compass className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">Select a timeline to begin</p>
            <p className="text-sm mt-1">Choose a Manifest Destiny timeline above to simulate the SMB journey</p>
          </div>
        )}

        {/* Day rail + center stage */}
        {days.length > 0 && !simulationQuery.isLoading && (
          <>
            <DayRail
              days={days}
              activeDay={activeDay?.day ?? 1}
              onSelectDay={handleSelectDay}
            />

            <main className="flex-1 overflow-y-auto px-8 py-6" aria-live="polite">
              <AnimatePresence mode="wait">
                {activeDay && (
                  <motion.div
                    key={activeDay.day}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-xl font-bold text-[var(--nexus-text-primary)]">
                        Day {activeDay.day}
                      </h2>
                      <span className="text-sm text-[var(--nexus-text-tertiary)]">
                        {activeDay.actions.length} action{activeDay.actions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <DayContent day={activeDay} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </>
        )}
      </div>

      {/* ── Playback Bar ── */}
      {days.length > 0 && (
        <PlaybackBar
          currentDay={activeDay?.day ?? 1}
          totalDays={totalDays}
          playing={playing}
          speed={speed}
          onTogglePlay={() => setPlaying((p) => !p)}
          onSpeedChange={setSpeed}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
