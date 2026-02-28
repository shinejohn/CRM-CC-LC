import { PageHeader, DataCard } from "@/components/shared";
import { DataReportPanel } from "@/components/dashboard/DataReportPanel";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DataReportCall() {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="Live Report Presentation"
                    subtitle="Presenting analytics and data to stakeholders."
                />
                <Button className="bg-red-500 hover:bg-red-600 text-white border-0">
                    <Video className="w-4 h-4 mr-2" /> End Call
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-[var(--nexus-card-bg)] rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 border border-[var(--nexus-divider)]">
                                <Video className="w-8 h-8 text-[var(--nexus-text-secondary)]" />
                            </div>
                            <p className="font-medium text-[var(--nexus-text-primary)] mb-1">Waiting for others to join...</p>
                            <p className="text-sm text-[var(--nexus-text-secondary)]">You are currently the only one in this call.</p>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-[var(--nexus-card-bg)] shadow-sm">Mute</Button>
                                <Button variant="outline" size="sm" className="bg-[var(--nexus-card-bg)] shadow-sm">Stop Video</Button>
                            </div>
                            <Button variant="outline" size="sm" className="bg-[var(--nexus-card-bg)] shadow-sm">Share Screen</Button>
                        </div>
                    </div>

                    <DataReportPanel title="Live Presentation Data" />
                </div>

                <div className="space-y-6">
                    <DataCard title="Participants">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--nexus-accent-primary)] text-white flex items-center justify-center font-bold text-xs">ME</div>
                                <div>
                                    <p className="font-medium text-sm text-[var(--nexus-text-primary)]">You (Host)</p>
                                </div>
                            </div>
                        </div>
                    </DataCard>

                    <DataCard title="Shared Notes" className="h-64 flex flex-col">
                        <div className="flex-1 bg-[var(--nexus-input-bg)] rounded-md border border-[var(--nexus-input-border)] p-3 text-sm text-[var(--nexus-text-primary)] mt-2">
                            Start typing presentation notes here...
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
