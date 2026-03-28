import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Facebook, Twitter, Instagram, Linkedin, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface IOAuthConnectProps {
  onConnect?: (platform: string) => void;
}

export const OAuthConnect: React.FC<IOAuthConnectProps> = ({ onConnect }) => {
  const [connecting, setConnecting] = useState<string | null>(null);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-100', status: 'connected', accountName: 'City Chamber' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-100', status: 'connected', accountName: '@citychamber' },
    { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-200 dark:bg-slate-800', status: 'disconnected' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-100', status: 'disconnected' },
  ];

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    // Simulate OAuth redirect
    setTimeout(() => {
      setConnecting(null);
      if (onConnect) onConnect(platformId);
    }, 1500);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Link your social media profiles to enable cross-posting and analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map(platform => {
            const Icon = platform.icon;
            const isConnected = platform.status === 'connected';
            const isConnecting = connecting === platform.id;

            return (
              <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${platform.bg}`}>
                    <Icon className={`w-6 h-6 ${platform.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{platform.name}</h4>
                    {isConnected ? (
                      <p className="text-sm text-slate-500">{platform.accountName}</p>
                    ) : (
                      <p className="text-sm text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hidden sm:inline-flex">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-slate-500">Manage</Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                      ) : (
                        `Connect ${platform.name}`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900/50 rounded-b-lg border-t pt-4">
        <div className="flex items-center text-sm text-slate-500">
          <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
          We never post without your explicit permission. Scopes are limited to publishing and insights.
        </div>
      </CardFooter>
    </Card>
  );
};
