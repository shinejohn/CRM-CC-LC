import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Zap, CheckCircle2 } from 'lucide-react';

export const CreditManager: React.FC = () => {
    const [balance, setBalance] = useState(150); // Mock starting balance
    const [isProcessing, setIsProcessing] = useState(false);

    const purchasePackage = (amount: number, cost: number) => {
        setIsProcessing(true);
        // Simulate API call to Stripe
        setTimeout(() => {
            setBalance(b => b + amount);
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 border-none text-white shadow-xl">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-blue-200 font-medium mb-1">Available Credits</p>
                            <div className="flex items-end gap-2">
                                <h2 className="text-5xl font-bold tracking-tight">{balance}</h2>
                                <Coins className="w-8 h-8 text-yellow-400 mb-1" />
                            </div>
                        </div>
                        <div className="text-right">
                            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none shadow-none">
                                View History
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-500" />
                            Studio Subscription
                        </CardTitle>
                        <CardDescription>Get a fresh batch of credits every month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg">200 Credits / mo</p>
                                <p className="text-slate-500 text-sm">Plus 20% off extra packs</p>
                            </div>
                            <p className="text-xl font-bold">$79<span className="text-sm font-normal text-slate-500">/mo</span></p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Subscribe Now</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top-Up Packs</CardTitle>
                        <CardDescription>Purchase credits on demand</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { amount: 100, cost: 50 },
                            { amount: 250, cost: 110, popular: true },
                            { amount: 500, cost: 200 }
                        ].map((pkg) => (
                            <div key={pkg.amount} className="flex justify-between items-center p-3 border rounded-lg hover:border-indigo-500 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-full">
                                        <Coins className="w-4 h-4 text-indigo-700" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{pkg.amount} Credits</p>
                                        {pkg.popular && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Popular</span>}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing}
                                    onClick={() => purchasePackage(pkg.amount, pkg.cost)}
                                >
                                    ${pkg.cost}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
