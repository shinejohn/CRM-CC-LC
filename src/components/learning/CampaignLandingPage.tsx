import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCampaignBySlug } from "@/data/campaigns";
import { FibonaccoPlayer } from "@/components/LearningCenter/Presentation/FibonaccoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Presentation, Slide } from "@/types/learning";
import type { Campaign } from "@/services/types/learning.types";

/**
 * Transform a flat Campaign object (with raw JSON spread via `...raw`) back into
 * the Presentation interface that FibonaccoPlayer expects.
 *
 * The campaign JSON structure is: { campaign, landing_page, template, slides[] }
 * and toCampaign() spreads the entire raw object into Campaign via `...raw`,
 * so `campaign.slides`, `campaign.landing_page`, etc. are all available.
 */
function campaignToPresentation(campaign: Campaign): Presentation {
    const raw = campaign as Record<string, unknown>;
    const landingPage = (raw.landing_page ?? {}) as Record<string, unknown>;
    const rawSlides = (raw.slides ?? []) as Array<Record<string, unknown>>;

    const audioBaseUrl = (landingPage.audio_base_url as string) ?? "";

    const slides: Slide[] = rawSlides.map((s, idx) => {
        const audioFile = s.audio_file as string | undefined;
        const audioUrl = audioFile && audioBaseUrl
            ? `${audioBaseUrl.replace(/\/$/, "")}/${audioFile}`
            : undefined;

        return {
            id: (s.slide_num as number) ?? idx + 1,
            component: (s.component as Slide["component"]) ?? "HeroSlide",
            content: (s.content as Record<string, unknown>) ?? {},
            narration: (s.narration as string) ?? undefined,
            audio_url: audioUrl,
            audio_duration: (s.duration_seconds as number) ?? undefined,
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
            name: (landingPage.ai_persona as string) ?? "Sarah",
            role: "AI Business Advisor",
            avatar_style: "professional-female",
            voice_id: "sarah-default",
        },
        slides,
    };
}

export default function CampaignLandingPage() {
    const params = useParams();
    const slug = params.slug ?? params.campaignSlug;
    const navigate = useNavigate();

    if (!slug) return <div className="p-8 text-center text-[var(--nexus-text-secondary)]">Invalid campaign specified.</div>;

    const campaign = getCampaignBySlug(slug);

    if (!campaign) {
        return (
            <div className="p-12 text-center space-y-4">
                <h2 className="text-2xl font-bold text-[var(--nexus-text-primary)]">Campaign not found</h2>
                <p className="text-[var(--nexus-text-secondary)]">The requested learning module could not be found.</p>
                <Button onClick={() => navigate('..')} variant="outline" className="border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)]">
                    Back to Learning Center
                </Button>
            </div>
        );
    }

    const presentation = useMemo(() => campaignToPresentation(campaign), [campaign]);

    return (
        <div className="relative animate-fade-in">
            <div className="absolute top-4 left-4 z-40">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('..')}
                    className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                    aria-label="Back to Learning Hub"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
            </div>

            <FibonaccoPlayer
                presentation={presentation}
                onComplete={() => navigate('..')}
            />
        </div>
    );
}
