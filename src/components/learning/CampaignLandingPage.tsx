import { useState, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCampaignBySlug } from "@/data/campaigns";
import { Button } from "@/components/ui/button";

const RoomWithSarah = lazy(() => import("./RoomWithSarah"));
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    MessageCircle,
    Play,
    Search,
    Bot,
    Megaphone,
    BarChart3,
    Star,
    Zap,
    Gift,
    Users,
    TrendingUp,
    Shield,
    type LucideIcon,
} from "lucide-react";
import type { Campaign } from "@/services/types/learning.types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, LucideIcon> = {
    search: Search,
    robot: Bot,
    megaphone: Megaphone,
    chart: BarChart3,
    star: Star,
    zap: Zap,
    gift: Gift,
    users: Users,
    trending: TrendingUp,
    shield: Shield,
    check: CheckCircle2,
};

function getIcon(name: string): LucideIcon {
    return ICON_MAP[name] || CheckCircle2;
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

interface LandingPageData {
    campaign_id?: string;
    landing_page_slug?: string;
    template_name?: string;
    slide_count?: number;
    duration_seconds?: number;
    primary_cta?: string;
    secondary_cta?: string;
    ai_persona?: string;
    ai_tone?: string;
    ai_goal?: string;
    data_capture_fields?: string;
    audio_base_url?: string;
    conversion_goal?: string;
}

/** Strip mustache-style {{variable}} placeholders with a readable fallback */
function clean(text: unknown, fallback = ""): string {
    if (typeof text !== "string") return fallback;
    return text.replace(/\{\{[^}]+\}\}/g, "your business").trim() || fallback;
}

/** Extract typed slide data from campaign */
function getSlides(campaign: Campaign): SlideData[] {
    const raw = campaign as Record<string, unknown>;
    return ((raw.slides ?? []) as SlideData[]);
}

/** Find first slide matching a component name */
function findSlide(slides: SlideData[], ...components: string[]): SlideData | undefined {
    return slides.find((s) => components.includes(s.component));
}

/** Get landing_page metadata */
function getLandingPage(campaign: Campaign): LandingPageData {
    const raw = campaign as Record<string, unknown>;
    return (raw.landing_page ?? {}) as LandingPageData;
}

interface LessonMeta {
    difficulty?: string;
    duration_minutes?: number;
    learning_objectives?: string[];
}

function getLessonMeta(campaign: Campaign): LessonMeta {
    const raw = campaign as Record<string, unknown>;
    return (raw.lesson_meta ?? {}) as LessonMeta;
}

/* ------------------------------------------------------------------ */
/*  Generic content extractors — work across all slide types           */
/* ------------------------------------------------------------------ */

/** Extract benefit-like items from any slide with benefits/features arrays */
function extractBenefits(slides: SlideData[]): Array<{ icon: string; title: string; desc: string }> {
    for (const slide of slides) {
        const c = slide.content;
        // BenefitsSlide format
        const benefits = c.benefits as Array<{ icon?: string; title?: string; desc?: string }> | undefined;
        if (benefits && benefits.length > 0 && benefits[0].title) return benefits.map(b => ({
            icon: b.icon ?? "check",
            title: b.title ?? "",
            desc: b.desc ?? "",
        }));

        // ConceptSlide with benefits array (HOOK-009 style)
        const conceptBenefits = c.benefits as Array<{ benefit?: string; reach?: string }> | undefined;
        if (conceptBenefits && conceptBenefits.length > 0 && conceptBenefits[0].benefit) {
            return conceptBenefits.map(b => ({
                icon: "check",
                title: b.benefit ?? "",
                desc: b.reach ?? "",
            }));
        }

        // features array
        const features = c.features as Array<{ title?: string; description?: string; name?: string }> | undefined;
        if (features && features.length > 0) return features.map(f => ({
            icon: "check",
            title: f.title ?? f.name ?? "",
            desc: f.description ?? "",
        }));
    }
    return [];
}

/** Extract stats from any slide with stats array */
function extractStats(slides: SlideData[]): Array<{ value: string; label: string }> {
    for (const slide of slides) {
        const stats = slide.content.stats as Array<{ value?: string; label?: string }> | undefined;
        if (stats && stats.length > 0) return stats.map(s => ({
            value: s.value ?? "",
            label: s.label ?? "",
        }));
    }
    return [];
}

/** Extract a testimonial from any slide */
function extractTestimonial(slides: SlideData[]): { quote: string; author: string; business_type?: string } | undefined {
    for (const slide of slides) {
        const c = slide.content;
        // Direct testimonial object
        const t = c.testimonial as { quote?: string; author?: string; business_type?: string } | undefined;
        if (t?.quote) return { quote: t.quote, author: t.author ?? "Local Business Owner", business_type: t.business_type };

        // Testimonials array (ProofSlide style)
        const ts = c.testimonials as Array<{ quote?: string; sponsor?: string; author?: string; result?: string }> | undefined;
        if (ts && ts.length > 0 && ts[0].quote) return {
            quote: ts[0].quote,
            author: ts[0].sponsor ?? ts[0].author ?? "Local Business Owner",
            business_type: ts[0].result,
        };
    }
    return undefined;
}

/** Build curriculum items from slide titles (skipping hero/CTA) */
function buildCurriculum(slides: SlideData[]): Array<{ num: number; title: string; duration: number }> {
    const skipComponents = new Set(["HeroSlide", "PersonalizedHeroSlide", "TutorialIntroSlide", "CTASlide"]);
    return slides
        .filter(s => !skipComponents.has(s.component))
        .map((s, i) => ({
            num: i + 1,
            title: s.title ?? clean(s.content.headline, `Section ${i + 1}`),
            duration: s.duration_seconds ?? 20,
        }));
}

/* ------------------------------------------------------------------ */
/*  Section Components                                                */
/* ------------------------------------------------------------------ */

function HeroSection({
    headline,
    subheadline,
    persona,
    duration,
    onWatchClick,
    onCtaClick,
    ctaLabel,
}: {
    headline: string;
    subheadline: string;
    persona: string;
    duration: number;
    onWatchClick: () => void;
    onCtaClick: () => void;
    ctaLabel: string;
}) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full" />

            <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>{persona} prepared this for you</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                    {headline}
                </h1>

                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                    {subheadline}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        type="button"
                        onClick={onCtaClick}
                        className="bg-white text-indigo-700 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-black/20"
                    >
                        {ctaLabel}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onWatchClick}
                        className="border-white/30 text-white hover:bg-white/10 px-6 py-6 text-lg rounded-xl"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Watch Presentation
                        <span className="ml-2 text-sm text-white/60">
                            ({Math.ceil(duration / 60)} min)
                        </span>
                    </Button>
                </div>
            </div>
        </section>
    );
}

function BenefitsSection({
    headline,
    benefits,
}: {
    headline: string;
    benefits: Array<{ icon: string; title: string; desc: string }>;
}) {
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                    {headline}
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {benefits.map((b, i) => {
                        const Icon = getIcon(b.icon);
                        return (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors group"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                        {clean(b.title)}
                                    </h3>
                                    <p className="text-gray-600">{clean(b.desc)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function SocialProofSection({
    headline,
    stats,
    testimonial,
}: {
    headline: string;
    stats?: Array<{ value: string; label: string }>;
    testimonial?: { quote: string; author: string; business_type?: string };
}) {
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                    {clean(headline, "Trusted by Local Businesses")}
                </h2>

                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-3 gap-6 mb-12">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">
                                    {clean(s.value, "100+")}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {clean(s.label)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {testimonial && (
                    <blockquote className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-8 text-center">
                        <p className="text-lg text-gray-700 italic mb-4">
                            &ldquo;{clean(testimonial.quote)}&rdquo;
                        </p>
                        <footer className="text-sm text-gray-500">
                            — {clean(testimonial.author, "Local Business Owner")}
                            {testimonial.business_type && (
                                <span className="block text-xs mt-1">
                                    {clean(testimonial.business_type)}
                                </span>
                            )}
                        </footer>
                    </blockquote>
                )}
            </div>
        </section>
    );
}

function BottomCTASection({
    headline,
    subheadline,
    ctaPrimary,
    ctaSecondary,
    urgency,
    trust,
    onCtaClick,
}: {
    headline: string;
    subheadline: string;
    ctaPrimary?: { label: string };
    ctaSecondary?: { label: string };
    urgency?: string;
    trust?: string;
    onCtaClick: () => void;
}) {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                    {clean(headline)}
                </h2>
                <p className="text-lg text-white/80 mb-8">
                    {clean(subheadline)}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <Button
                        type="button"
                        onClick={onCtaClick}
                        className="bg-white text-indigo-700 hover:bg-white/90 font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-black/20"
                    >
                        {ctaPrimary?.label ?? "Get Started Now"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    {ctaSecondary && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCtaClick}
                            className="text-white/70 hover:text-white hover:bg-white/10 px-6 py-6 text-base"
                        >
                            {ctaSecondary.label}
                        </Button>
                    )}
                </div>

                {urgency && (
                    <p className="text-sm text-yellow-300 font-medium mb-2">
                        {clean(urgency)}
                    </p>
                )}
                {trust && (
                    <p className="text-xs text-white/50">{clean(trust)}</p>
                )}
            </div>
        </section>
    );
}

function FooterSection({ persona }: { persona: string }) {
    return (
        <footer className="bg-gray-900 text-gray-400 py-8">
            <div className="max-w-5xl mx-auto px-6 text-center text-sm">
                <p>
                    Powered by Fibonacco &middot; {persona} AI Business Advisor
                </p>
                <p className="mt-2 text-gray-600">
                    Helping local businesses grow through community-powered marketing
                </p>
            </div>
        </footer>
    );
}

function CurriculumSection({
    items,
    onStartLesson,
}: {
    items: Array<{ num: number; title: string; duration: number }>;
    onStartLesson: () => void;
}) {
    if (items.length === 0) return null;
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                    What We&apos;ll Cover
                </h2>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.num}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-200 transition-colors">
                                {item.num}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {clean(item.title)}
                                </h3>
                            </div>
                            <span className="text-xs text-gray-500 shrink-0">
                                {Math.ceil(item.duration / 60) || 1} min
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <Button
                        type="button"
                        onClick={onStartLesson}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Lesson
                    </Button>
                </div>
            </div>
        </section>
    );
}

function CourseInfoSection({
    persona,
    slideCount,
    durationMinutes,
    difficulty,
    objectives,
    onStartLesson,
}: {
    persona: string;
    slideCount: number;
    durationMinutes: number;
    difficulty: string;
    objectives: string[];
    onStartLesson: () => void;
}) {
    return (
        <section className="py-12 md:py-16 bg-indigo-50/50 border-y border-indigo-100">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid md:grid-cols-[1fr_280px] gap-8 items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            About This Lesson
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                            <span className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-gray-200">
                                <Clock className="w-3.5 h-3.5" />
                                {durationMinutes} min
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-gray-200">
                                {slideCount} slides
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-gray-200 capitalize">
                                {difficulty}
                            </span>
                        </div>
                        {objectives.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                    What you&apos;ll learn
                                </h3>
                                <ul className="space-y-2">
                                    {objectives.map((obj, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                            <span className="text-sm">{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                S
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">{persona}</div>
                                <div className="text-xs text-gray-500">AI Business Advisor</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            {persona} will walk you through this lesson step by step and answer any questions along the way.
                        </p>
                        <Button
                            type="button"
                            onClick={onStartLesson}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Start Lesson
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function CampaignLandingPage() {
    const params = useParams();
    const slug = params.slug ?? params.campaignSlug;
    const navigate = useNavigate();
    const [showPresentation, setShowPresentation] = useState(false);

    if (!slug) {
        return (
            <div className="p-8 text-center text-gray-500">
                Invalid campaign specified.
            </div>
        );
    }

    const campaign = getCampaignBySlug(slug);

    if (!campaign) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Campaign not found
                    </h2>
                    <p className="text-gray-500">
                        The requested page could not be found.
                    </p>
                    <Button
                        type="button"
                        onClick={() => navigate("..")}
                        variant="outline"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const lp = getLandingPage(campaign);
    const slides = getSlides(campaign);
    const persona = lp.ai_persona ?? "Sarah";
    const duration = lp.duration_seconds ?? 120;

    // Extract hero content from first hero-like slide
    const heroSlide = findSlide(slides, "PersonalizedHeroSlide", "HeroSlide", "TutorialIntroSlide");
    const ctaSlide = findSlide(slides, "CTASlide");

    const heroContent = heroSlide?.content ?? {};
    const headline = clean(
        heroContent.headline,
        campaign.title
    );
    const subheadline = clean(
        heroContent.subhead ?? heroContent.subheadline,
        campaign.description
    );

    // Generic content extraction — works across all slide component types
    const contentSlides = slides.filter(s =>
        !["HeroSlide", "PersonalizedHeroSlide", "TutorialIntroSlide", "CTASlide"].includes(s.component)
    );
    const benefits = extractBenefits(contentSlides);
    const stats = extractStats(slides);
    const testimonial = extractTestimonial(slides);
    const curriculum = buildCurriculum(slides);

    const ctaContent = ctaSlide?.content ?? {};
    const ctaPrimary = ctaContent.cta_primary as
        | { label: string }
        | undefined;
    const ctaSecondary = ctaContent.cta_secondary as
        | { label: string }
        | undefined;

    const ctaLabel =
        ctaPrimary?.label ??
        (lp.primary_cta
            ? lp.primary_cta
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Get Started");

    const lessonMeta = getLessonMeta(campaign);
    const durationMinutes = lessonMeta.duration_minutes ?? Math.ceil(duration / 60);
    const difficulty = lessonMeta.difficulty ?? "beginner";
    const objectives = lessonMeta.learning_objectives ?? [];

    const handleCta = () => {
        setShowPresentation(true);
    };

    // Presentation mode — Room with Sarah, embedded with navigation header
    if (showPresentation) {
        return (
            <div className="h-screen flex flex-col bg-[#0d1229]">
                {/* Navigation header — keeps user oriented */}
                <header className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-white/10 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowPresentation(false)}
                        className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                        aria-label="Back to lesson overview"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <span className="text-white/30">|</span>
                    <span className="text-sm text-white/60 truncate">{campaign.title}</span>
                    <div className="ml-auto flex items-center gap-3">
                        <Link
                            to="/command-center/learn"
                            className="text-xs text-white/50 hover:text-white/80 transition-colors"
                        >
                            All Lessons
                        </Link>
                        <Link
                            to="/command-center/dashboard"
                            className="text-xs text-white/50 hover:text-white/80 transition-colors"
                        >
                            Command Center
                        </Link>
                    </div>
                </header>
                <div className="flex-1 min-h-0">
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center h-full">
                                <p className="text-white/60">Loading presentation...</p>
                            </div>
                        }
                    >
                        <RoomWithSarah
                            campaign={campaign}
                            onClose={() => setShowPresentation(false)}
                        />
                    </Suspense>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white animate-fade-in">
            {/* Hero */}
            <HeroSection
                headline={headline}
                subheadline={subheadline}
                persona={persona}
                duration={duration}
                onWatchClick={() => setShowPresentation(true)}
                onCtaClick={handleCta}
                ctaLabel={ctaLabel}
            />

            {/* Course Info */}
            <CourseInfoSection
                persona={persona}
                slideCount={slides.length}
                durationMinutes={durationMinutes}
                difficulty={difficulty}
                objectives={objectives}
                onStartLesson={handleCta}
            />

            {/* Curriculum — always renders since every campaign has slides */}
            <CurriculumSection
                items={curriculum}
                onStartLesson={handleCta}
            />

            {/* Benefits — from any slide with benefits/features arrays */}
            {benefits.length > 0 && (
                <BenefitsSection
                    headline="What You Get"
                    benefits={benefits}
                />
            )}

            {/* Social Proof — from any slide with stats/testimonials */}
            {(stats.length > 0 || testimonial) && (
                <SocialProofSection
                    headline="Trusted by Local Businesses"
                    stats={stats}
                    testimonial={testimonial}
                />
            )}

            {/* Bottom CTA */}
            <BottomCTASection
                headline={clean(
                    ctaContent.headline,
                    campaign.title
                )}
                subheadline={clean(
                    ctaContent.subhead,
                    "Take the next step for your business"
                )}
                ctaPrimary={ctaPrimary}
                ctaSecondary={ctaSecondary}
                urgency={ctaContent.urgency as string | undefined}
                trust={ctaContent.trust as string | undefined}
                onCtaClick={handleCta}
            />

            {/* Footer */}
            <FooterSection persona={persona} />
        </div>
    );
}
