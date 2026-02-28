import { useState } from "react";
import { Campaign, CampaignSlide } from "@/services/types/learning.types";
import { DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, PlayCircle, Info, Video, MousePointerClick } from "lucide-react";

interface CampaignRendererProps {
    campaign: Campaign;
}

export function CampaignRenderer({ campaign }: CampaignRendererProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // If no slides are provided, we show a fallback presentation
    const slides = campaign.slides || [
        { id: "s1", type: "hero", title: campaign.title, content: campaign.description },
        { id: "s2", type: "content", title: "Target Audience", content: campaign.target_audience },
        { id: "s3", type: "cta", title: "Get Started", cta_text: "Launch Campaign", cta_link: "#" }
    ];

    const currentSlide = slides[currentSlideIndex];

    const nextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    };

    const renderSlideContent = (slide: CampaignSlide) => {
        switch (slide.type) {
            case "hero":
                return (
                    <div className="text-center py-12 space-y-6">
                        <h1 className="text-4xl font-bold text-[var(--nexus-text-primary)]">{slide.title}</h1>
                        <p className="text-xl text-[var(--nexus-text-secondary)] max-w-2xl mx-auto">{slide.content}</p>
                    </div>
                );
            case "video":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-[var(--nexus-text-primary)] mb-4">{slide.title}</h2>
                        <div className="aspect-video bg-[var(--nexus-bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--nexus-card-border)]">
                            <Video className="w-16 h-16 text-[var(--nexus-text-tertiary)]" />
                        </div>
                    </div>
                );
            case "interactive":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-[var(--nexus-text-primary)] mb-4">{slide.title}</h2>
                        <div className="p-8 bg-[var(--nexus-bg-secondary)] rounded-xl border border-[var(--nexus-card-border)] text-center">
                            <MousePointerClick className="w-12 h-12 text-[var(--nexus-accent-primary)] mx-auto mb-4" />
                            <p className="text-[var(--nexus-text-secondary)]">Interactive element placeholder</p>
                        </div>
                    </div>
                );
            case "cta":
                return (
                    <div className="text-center py-12 space-y-6">
                        <h2 className="text-3xl font-bold text-[var(--nexus-text-primary)]">{slide.title}</h2>
                        <p className="text-lg text-[var(--nexus-text-secondary)]">{slide.content}</p>
                        <Button size="lg" className="bg-[var(--nexus-brand-primary)] text-white hover:bg-[var(--nexus-brand-primary)]/90">
                            <PlayCircle className="w-5 h-5 mr-2" /> {slide.cta_text || "Continue"}
                        </Button>
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-[var(--nexus-text-primary)] mb-4">{slide.title}</h2>
                        <div className="prose dark:prose-invert max-w-none text-[var(--nexus-text-primary)]">
                            {slide.content || "No content provided."}
                        </div>
                        {slide.cta_text && (
                            <Button className="mt-6 bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)]">
                                {slide.cta_text}
                            </Button>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between text-sm text-[var(--nexus-text-secondary)]">
                <span className="flex items-center gap-1 font-medium px-2 py-1 bg-[var(--nexus-bg-secondary)] rounded-md border border-[var(--nexus-divider)]">
                    <Info className="w-4 h-4" /> {campaign.id}
                </span>
                <span className="font-medium bg-[var(--nexus-card-bg)] px-3 py-1 rounded-full border border-[var(--nexus-card-border)] shadow-sm">
                    Slide {currentSlideIndex + 1} of {slides.length}
                </span>
            </div>

            <DataCard className="min-h-[400px] flex flex-col relative overflow-hidden bg-gradient-to-br from-[var(--nexus-card-bg)] to-[var(--nexus-bg-secondary)]/30 border-2">
                <div className="flex-1 p-2 md:p-6">
                    {renderSlideContent(currentSlide)}
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--nexus-divider)] flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={prevSlide}
                        disabled={currentSlideIndex === 0}
                        className="text-[var(--nexus-text-primary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-bg-secondary)]"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>

                    <div className="flex gap-1.5">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlideIndex ? 'bg-[var(--nexus-brand-primary)]' : 'bg-[var(--nexus-divider)]'}`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={nextSlide}
                        disabled={currentSlideIndex === slides.length - 1}
                        className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-0"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </DataCard>
        </div>
    );
}
