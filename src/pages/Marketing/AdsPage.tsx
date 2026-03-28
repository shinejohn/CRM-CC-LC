import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Activity, Megaphone, CheckCircle2,
  Clock, Plus, Search, Filter, MoreVertical,
  MousePointerClick, Eye, DollarSign
} from 'lucide-react';

export const AdsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const { apiClient } = await import('@/services/api');
        const res = await apiClient.get('/marketing/ads').catch(() => ({ data: { data: [] } }));
        setCampaigns(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Advertising Center</h1>
          <p className="text-gray-500 mt-1">Manage network-wide local advertising campaigns.</p>
        </div>
        <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Spent (MTD)</p>
                <p className="text-2xl font-bold">$214.50</p>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Impressions</p>
                <p className="text-2xl font-bold">57.7k</p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold">2,096</p>
              </div>
              <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                <MousePointerClick className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Avg. CTR</p>
                <p className="text-2xl font-bold">3.6%</p>
              </div>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Block */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div className="space-y-1">
            <CardTitle>Ad Campaigns</CardTitle>
            <CardDescription>View and manage all active, scheduled, and past campaigns.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Spend / Budget</th>
                  <th className="px-6 py-4 font-medium">Impr.</th>
                  <th className="px-6 py-4 font-medium">Clicks</th>
                  <th className="px-6 py-4 font-medium">Net CTR</th>
                  <th className="px-6 py-4 font-medium">End Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {camp.name}
                    </td>
                    <td className="px-6 py-4">
                      {camp.status === 'active' && (
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                      )}
                      {camp.status === 'scheduled' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Scheduled</Badge>
                      )}
                      {camp.status === 'completed' && (
                        <Badge variant="outline" className="text-gray-500">Completed</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {camp.type}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{camp.spent}</span>
                        <span className="text-xs text-gray-500">of {camp.budget}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{camp.impressions}</td>
                    <td className="px-6 py-4 text-gray-600">{camp.clicks}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{camp.ctr}</td>
                    <td className="px-6 py-4 text-gray-600">{camp.endDate}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommended Placements */}
      <div className="pt-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommended Placements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-indigo-500 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <Megaphone className="w-8 h-8 text-indigo-500 mb-2" />
              <CardTitle className="text-base">Headliner Banner</CardTitle>
              <CardDescription>Premium spot on Day.News home page.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mt-2">$25<span className="text-sm font-normal text-gray-500">/day</span></div>
            </CardContent>
          </Card>
          
          <Card className="hover:border-purple-500 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <BarChart className="w-8 h-8 text-purple-500 mb-2" />
              <CardTitle className="text-base">Targeted Search Ad</CardTitle>
              <CardDescription>Appear when locals search for your category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mt-2">$15<span className="text-sm font-normal text-gray-500">/day</span></div>
            </CardContent>
          </Card>

          <Card className="hover:border-pink-500 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <Activity className="w-8 h-8 text-pink-500 mb-2" />
              <CardTitle className="text-base">Digital Billboard</CardTitle>
              <CardDescription>High-visibility local screen networks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mt-2">$50<span className="text-sm font-normal text-gray-500">/day</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
