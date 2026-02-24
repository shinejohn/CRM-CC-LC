import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, Linkedin, CheckCircle2, AlertCircle } from 'lucide-react';

type AccountStatus = 'active' | 'expired' | 'disconnected';

interface ConnectedAccount {
    id: string;
    platform: string;
    name: string;
    status: AccountStatus;
}

export const ConnectedAccountsList: React.FC = () => {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([
        { id: '1', platform: 'facebook', name: 'Alphasite Official', status: 'active' },
        { id: '2', platform: 'instagram', name: '@alphasite', status: 'expired' }
    ]);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);

    const handleConnect = (platform: string) => {
        setIsConnecting(platform);
        // Simulate OAuth redirect
        setTimeout(() => {
            setAccounts(prev => [
                ...prev.filter(a => a.platform !== platform),
                { id: Date.now().toString(), platform, name: `New ${platform} Page`, status: 'active' }
            ]);
            setIsConnecting(null);
        }, 1500);
    };

    const platforms = [
        { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-800', bg: 'bg-slate-100' },
        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your social media channels for scheduling</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {platforms.map((platform) => {
                        const Icon = platform.icon;
                        const connectedAcct = accounts.find(a => a.platform === platform.id);

                        return (
                            <div key={platform.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${platform.bg}`}>
                                        <Icon className={`w-6 h-6 ${platform.color}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{platform.name}</h4>
                                        {connectedAcct ? (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {connectedAcct.status === 'active' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                                )}
                                                <span className={`text-sm ${connectedAcct.status === 'active' ? 'text-slate-600' : 'text-amber-600 font-medium'}`}>
                                                    {connectedAcct.status === 'active' ? connectedAcct.name : 'Needs re-connection'}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 mt-0.5">Not connected</p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant={connectedAcct?.status === 'active' ? 'outline' : 'default'}
                                    disabled={isConnecting === platform.id}
                                    onClick={() => handleConnect(platform.id)}
                                >
                                    {isConnecting === platform.id ? 'Connecting...' : (
                                        connectedAcct ? (connectedAcct.status === 'active' ? 'Manage' : 'Reconnect') : 'Connect'
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
