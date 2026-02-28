import { useParams, useNavigate } from "react-router-dom";
import { getCampaignBySlug } from "@/data/campaigns";
import { CampaignRenderer } from "./CampaignRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CampaignLandingPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    if (!slug) return <div className="p-8 text-center text-[var(--nexus-text-secondary)]">Invalid campaign specified.</div>;

    const campaign = getCampaignBySlug(slug);

    if (!campaign) {
        return (
            <div className="p-12 text-center space-y-4">
                <h2 className="text-2xl font-bold text-[var(--nexus-text-primary)]">Campaign not found</h2>
                <p className="text-[var(--nexus-text-secondary)]">The requested learning module could not be found.</p>
                <Button onClick={() => navigate('/learn')} variant="outline" className="border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)]">
                    Back to Learning Center
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/learn')} className="mb-2 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Hub
            </Button>

            <CampaignRenderer campaign={campaign} />
        </div>
    );
}
