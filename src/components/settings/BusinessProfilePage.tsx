import { PageHeader, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Globe, MapPin, Phone } from "lucide-react";

export default function BusinessProfilePage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <PageHeader
                title="Business Profile"
                subtitle="Manage your company information, branding, and billing details."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <DataCard className="text-center">
                        <div className="w-24 h-24 rounded-2xl bg-[var(--nexus-bg-secondary)] border-2 border-dashed border-[var(--nexus-card-border)] mx-auto mb-4 flex items-center justify-center flex-col gap-2 cursor-pointer hover:border-[var(--nexus-brand-primary)] transition-colors group">
                            <Building2 className="w-8 h-8 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-brand-primary)] transition-colors" />
                            <span className="text-xs font-medium text-[var(--nexus-text-secondary)]">Upload Logo</span>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--nexus-text-primary)]">Fibonacco Platform</h2>
                        <p className="text-[var(--nexus-text-secondary)] text-sm mb-4">Enterprise Edition</p>

                        <div className="flex flex-col gap-2 mt-4 border-t border-[var(--nexus-divider)] pt-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-[var(--nexus-text-secondary)]">
                                <Globe className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
                                <a href="#" className="hover:underline">www.fibonacco.com</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--nexus-text-secondary)]">
                                <MapPin className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
                                <span>San Francisco, CA</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--nexus-text-secondary)]">
                                <Phone className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
                                <span>(555) 123-4567</span>
                            </div>
                        </div>
                    </DataCard>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <DataCard title="Company Details">
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" defaultValue="Fibonacco Platform" className="bg-[var(--nexus-input-bg)] text-[var(--nexus-text-primary)]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input id="industry" defaultValue="Technology Software" className="bg-[var(--nexus-input-bg)] text-[var(--nexus-text-primary)]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employees">Company Size</Label>
                                    <select id="employees" className="flex h-10 w-full rounded-md border border-[var(--nexus-input-border)] bg-[var(--nexus-input-bg)] px-3 py-2 text-sm text-[var(--nexus-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>1-10</option>
                                        <option>11-50</option>
                                        <option value="51-200">51-200</option>
                                        <option>201-500</option>
                                        <option>500+</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Business Address</Label>
                                <Input id="address" defaultValue="123 Tech Lane, Suite 400" className="bg-[var(--nexus-input-bg)] text-[var(--nexus-text-primary)]" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" defaultValue="San Francisco" className="bg-[var(--nexus-input-bg)] text-[var(--nexus-text-primary)]" />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" defaultValue="CA" className="bg-[var(--nexus-input-bg)] text-[var(--nexus-text-primary)]" />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="zip">ZIP</Label>
                                    <Input id="zip" defaultValue="94105" className="bg-[var(--nexus-input-bg)] text-[var(--nexus-text-primary)]" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--nexus-divider)] flex justify-end">
                                <Button type="button" className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-0">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
