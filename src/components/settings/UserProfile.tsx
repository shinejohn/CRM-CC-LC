import { PageHeader, DataCard, AvatarInitials } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Building, CreditCard } from "lucide-react";

export default function UserProfile() {
    const { user } = useAuthStore();

    if (!user) return <div className="p-8 text-center text-[var(--nexus-text-secondary)]">Please log in.</div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <PageHeader
                title="My Profile"
                subtitle="Manage your personal information and preferences."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <DataCard className="text-center">
                        <div className="flex justify-center mb-4">
                            <AvatarInitials name={user.name} size="lg" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--nexus-text-primary)]">{user.name}</h2>
                        <p className="text-[var(--nexus-text-secondary)] mb-4">{user.email}</p>

                        <div className="flex flex-col gap-2 mt-4 border-t border-[var(--nexus-divider)] pt-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-[var(--nexus-text-secondary)]">
                                <Shield className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
                                <span className="capitalize">Role: {user.role}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--nexus-text-secondary)]">
                                <Building className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
                                <span>{user.business_name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--nexus-text-secondary)]">
                                <CreditCard className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
                                <span className="capitalize">Tier: {user.subscription_tier}</span>
                            </div>
                        </div>
                    </DataCard>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <DataCard title="Personal Information">
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue={user.name.split(' ')[0]} className="bg-[var(--nexus-input-bg)]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue={user.name.split(' ')[1] || ""} className="bg-[var(--nexus-input-bg)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue={user.email} className="bg-[var(--nexus-input-bg)]" />
                            </div>

                            <div className="pt-4 border-t border-[var(--nexus-divider)] flex justify-end">
                                <Button type="button" className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-0">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </DataCard>

                    <DataCard title="Security">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[var(--nexus-bg-secondary)] rounded-lg border border-[var(--nexus-divider)]">
                                <div>
                                    <h4 className="font-medium text-[var(--nexus-text-primary)]">Password</h4>
                                    <p className="text-sm text-[var(--nexus-text-secondary)]">Change your password or enable 2FA.</p>
                                </div>
                                <Button variant="outline" className="text-[var(--nexus-text-primary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-card-bg-hover)]">Update</Button>
                            </div>
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
