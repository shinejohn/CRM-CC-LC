import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, AlertTriangle, Info, ShieldAlert, WifiHigh, Volume2, History, ListFilter, CheckCircle } from 'lucide-react';
import { CreateAlertDialog } from '@/components/ops/CreateAlertDialog';

export const AlertManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeAlerts, setActiveAlerts] = React.useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const { apiClient } = await import('@/services/api');
        const [activeRes, pendingRes] = await Promise.all([
           apiClient.get('/alerts/active').catch(() => ({ data: { data: [] } })),
           apiClient.get('/alerts/pending').catch(() => ({ data: { data: [] } }))
        ]);
        setActiveAlerts(activeRes.data.data || []);
        setPendingApprovals(pendingRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'Critical': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch(type) {
      case 'Critical': return <Badge variant="destructive" className="bg-red-600">Critical</Badge>;
      case 'Warning': return <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50">Warning</Badge>;
      case 'Info': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Info</Badge>;
      default: return <Badge variant="outline">Default</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Volume2 className="w-8 h-8 text-red-500" />
            Alerts & Notifications
          </h1>
          <p className="text-gray-500 mt-1">Manage public safety alerts, community notices, and distribution channels.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <WifiHigh className="w-4 h-4" /> Issue New Alert
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (Pending + Quick Stats) */}
        <div className="space-y-6">
          <Card className="border-2 border-orange-200 shadow-sm">
            <CardHeader className="bg-orange-50 dark:bg-orange-900/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
                <ShieldAlert className="w-5 h-5" /> Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {pendingApprovals.map(alert => (
                  <div key={alert.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getAlertBadge(alert.type)}
                          <span className="text-sm font-medium text-slate-500">{alert.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><strong>Area:</strong> {alert.area}</p>
                      <p><strong>By:</strong> {alert.requestedBy} ({alert.submitted})</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">Approve</Button>
                      <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">SMS Gateway</span>
                <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1"/> Operational</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Push Notifications</span>
                <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1"/> Operational</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Email SMTP</span>
                <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1"/> Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col (Active Alerts & History) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Alerts (2)</TabsTrigger>
              <TabsTrigger value="history">Alert History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <Card className="shadow-sm border-t-4 border-t-red-600">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Currently Broadcasting</CardTitle>
                    <div className="relative w-[250px]">
                      <ListFilter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input placeholder="Filter alerts..." className="pl-9 h-8 text-sm" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-y">
                      <tr>
                        <th className="px-4 py-3 font-medium">Alert</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Area / Channels</th>
                        <th className="px-4 py-3 font-medium">Expires In</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeAlerts.map(alert => (
                        <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {getAlertIcon(alert.type)}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{alert.title}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{alert.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{getAlertBadge(alert.type)}</td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-slate-700">{alert.area}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{alert.channel}</p>
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-600">{alert.expires}</td>
                          <td className="px-4 py-4 text-right">
                            <Button variant="outline" size="sm" className="text-slate-600">Update</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2">Clear</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Check back to view past alerts.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
      <CreateAlertDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
