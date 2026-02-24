import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Network, Zap, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Placeholder types based on Laravel models
interface CssnSubscription {
    id: string;
    tier: 'local' | 'reach' | 'network' | 'enterprise';
    status: 'active' | 'paused' | 'cancelled' | 'expired';
    mode: 'subscription' | 'campaign';
    billing_amount_cents: number;
}

interface CssnPreferences {
    auto_distribute_coupons: boolean;
    auto_distribute_events: boolean;
    auto_distribute_articles: boolean;
    auto_distribute_announcements: boolean;
    require_approval_before_post: boolean;
}

export function CssnSubscriptionPage({
    // Normally provided by a Context or API hook
    smbId = "mock-smb-id"
}) {
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<CssnSubscription | null>(null);
    const [preferences, setPreferences] = useState<CssnPreferences>({
        auto_distribute_coupons: true,
        auto_distribute_events: true,
        auto_distribute_articles: true,
        auto_distribute_announcements: false,
        require_approval_before_post: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Mock initial fetch
    useEffect(() => {
        // In a real app, this would be an Axios call to /api/cssn/subscription/{smbId}
        setTimeout(() => {
            setSubscription({
                id: "mock-sub-123",
                tier: "reach",
                status: "active",
                mode: "subscription",
                billing_amount_cents: 39900
            });
            setIsLoading(false);
        }, 1000);
    }, [smbId]);

    const handlePreferenceChange = (key: keyof CssnPreferences, value: boolean) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        // In a real app, fire API update here
        toast({
            title: "Preferences Updated",
            description: "Distribution settings saved.",
        });
    };

    const handleSubscribe = (tier: string) => {
        toast({
            title: "Processing Subscription",
            description: `Initiating ${tier} tier checkout...`,
        });
        // Call Stripe service endpoint
    };

    if (isLoading) {
        return <div className="p-8 text-center animate-pulse">Loading CSSN Data...</div>;
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">CSSN Manager</h1>
                <p className="text-muted-foreground mt-2">Manage your Community Social Syndication Network presence.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Active Subscription Overview */}
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-primary" />
                            Current Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subscription ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Active Tier</span>
                                    <Badge variant="default" className="capitalize text-sm">{subscription.tier}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Billing</span>
                                    <span className="font-semibold">${(subscription.billing_amount_cents / 100).toFixed(2)} / mo</span>
                                </div>
                                <div className="pt-4 border-t flex gap-4">
                                    <Button variant="outline" className="w-full">Manage Billing</Button>
                                    <Button variant="destructive" className="w-full">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="mb-4">You don't have an active CSSN subscription.</p>
                                <Button onClick={() => handleSubscribe('reach')}>View Plans</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Global Distribution Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution Settings</CardTitle>
                        <CardDescription>Control what gets synced across the network automatically.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-events" className="flex flex-col space-y-1">
                                <span>Auto-Distribute Events</span>
                                <span className="font-normal text-sm text-muted-foreground">Sync Go Event City events to social channels.</span>
                            </Label>
                            <Switch
                                id="auto-events"
                                checked={preferences.auto_distribute_events}
                                onCheckedChange={(v) => handlePreferenceChange('auto_distribute_events', v)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-coupons" className="flex flex-col space-y-1">
                                <span>Auto-Distribute Coupons</span>
                                <span className="font-normal text-sm text-muted-foreground">Sync special offers and coupons.</span>
                            </Label>
                            <Switch
                                id="auto-coupons"
                                checked={preferences.auto_distribute_coupons}
                                onCheckedChange={(v) => handlePreferenceChange('auto_distribute_coupons', v)}
                            />
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <Label htmlFor="require-approval" className="flex flex-col space-y-1">
                                <span>Require Approval</span>
                                <span className="font-normal text-sm text-muted-foreground">Review AI generated posts before they go live.</span>
                            </Label>
                            <Switch
                                id="require-approval"
                                checked={preferences.require_approval_before_post}
                                onCheckedChange={(v) => handlePreferenceChange('require_approval_before_post', v)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tiers / Upgrade Path */}
            <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">Upgrade Network Tier</h2>
            <div className="grid gap-6 md:grid-cols-3">
                {/* Mock Tier Cards */}
                {[
                    { name: 'Local', price: 199, desc: 'City-wide syndication', features: ['Home city hub', 'Basic AI templates', '10 posts/mo'] },
                    { name: 'Reach', price: 399, desc: 'County-wide expansion', features: ['4 adjacent communities', 'Advanced brand voice', '25 posts/mo'], popular: true },
                    { name: 'Network', price: 799, desc: 'Regional domination', features: ['10 regional communities', 'Priority execution', 'Unlimited posts'] }
                ].map((tier) => (
                    <Card key={tier.name} className={`flex flex-col relative ${tier.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
                        {tier.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">Most Popular</Badge>}
                        <CardHeader>
                            <CardTitle className="text-xl">{tier.name}</CardTitle>
                            <CardDescription>{tier.desc}</CardDescription>
                            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                                ${tier.price}<span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {tier.features.map(f => (
                                    <li key={f} className="flex gap-2 items-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={tier.popular ? 'default' : 'outline'}
                                disabled={subscription?.tier === tier.name.toLowerCase()}
                                onClick={() => handleSubscribe(tier.name)}
                            >
                                {subscription?.tier === tier.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
