import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, TrendingUp, Zap } from 'lucide-react';

interface CssnDashboardWidgetProps {
    subscription?: {
        tier: string;
        status: string;
    };
    metrics?: {
        total_posts: number;
        total_impressions: number;
        syndication_dividend: number;
    };
    onBoostClick: () => void;
    onManageClick: () => void;
    isLoading?: boolean;
}

export function CssnDashboardWidget({
    subscription,
    metrics,
    onBoostClick,
    onManageClick,
    isLoading = false
}: CssnDashboardWidgetProps) {

    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardHeader>
                    <CardTitle className="bg-muted h-6 w-1/3 rounded"></CardTitle>
                    <CardDescription className="bg-muted h-4 w-1/2 rounded mt-2"></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted h-10 w-full rounded"></div>
                    <div className="bg-muted h-10 w-full rounded"></div>
                </CardContent>
            </Card>
        );
    }

    const isActive = subscription?.status === 'active';

    return (
        <Card className="h-full flex flex-col justify-between border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Network className="h-5 w-5 text-primary" />
                            CSSN Distribution
                        </CardTitle>
                        <CardDescription>
                            Your local network presence
                        </CardDescription>
                    </div>
                    {subscription ? (
                        <Badge variant={isActive ? 'default' : 'secondary'} className="capitalize">
                            {subscription.tier} {subscription.status !== 'active' && `(${subscription.status})`}
                        </Badge>
                    ) : (
                        <Badge variant="outline">Not Subscribed</Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {isActive && metrics ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Network Reach</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{metrics.total_impressions.toLocaleString()}</span>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Posts Syndicated</p>
                                <p className="text-2xl font-bold">{metrics.total_posts}</p>
                            </div>
                        </div>

                        {/* Syndication Dividend Highlight */}
                        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Syndication Dividend</p>
                                <p className="text-sm font-medium">Value generated this month</p>
                            </div>
                            <span className="text-xl font-bold text-primary">${metrics.syndication_dividend}</span>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button onClick={onBoostClick} className="w-full gap-2 shadow-md">
                                <Zap className="h-4 w-4" /> Boost Content
                            </Button>
                            <Button variant="outline" onClick={onManageClick} className="w-full">
                                Full Report
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Expand your reach across the local community network automatically.
                        </p>
                        <Button onClick={onManageClick} className="w-full">
                            Explore CSSN Plans
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
