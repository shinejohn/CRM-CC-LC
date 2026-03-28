import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Star, ShieldCheck, Mail, ArrowRight, Zap, Target, ExternalLink, CheckCircle2 } from 'lucide-react';

export const SponsorsPage: React.FC = () => {
  const [currentSponsorships, setCurrentSponsorships] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSponsors = async () => {
      setIsLoading(true);
      try {
        const { apiClient } = await import('@/services/api');
        const res = await apiClient.get('/marketing/sponsors').catch(() => ({ data: { data: [] } }));
        setCurrentSponsorships(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch sponsorships", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            Sponsorship Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your active sponsorships and explore new partnership programs.</p>
        </div>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2">
          <Star className="w-4 h-4 fill-white" /> View Media Kit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Current Sponsorships */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Active Sponsorships</h2>
          
          <div className="grid gap-4">
            {currentSponsorships.map(sponsor => (
              <Card key={sponsor.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{sponsor.name}</h3>
                        <Badge variant={sponsor.status === 'Active' ? 'default' : 'secondary'} className={sponsor.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                          {sponsor.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-500">Tier: <span className="text-gray-900 dark:text-white">{sponsor.tier}</span></p>
                      <ul className="mt-3 space-y-1">
                        {sponsor.benefits.map((benefit: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:text-right space-y-3">
                      <div className="text-sm text-gray-500">
                        Renews/Occurs on<br/>
                        <span className="font-semibold text-gray-900 dark:text-white">{sponsor.renewalDate}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto">Manage Benefits</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!currentSponsorships.length && (
            <div className="p-8 text-center border-2 border-dashed rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Active Sponsorships</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-1">You are not currently sponsoring any programs or events. Explore the tiers to get started.</p>
            </div>
          )}

        </div>

        {/* Right column: Tiers & Opportunities */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Programs</h2>

          <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Community Patron</CardTitle>
              <CardDescription>Support local journalism and community apps.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">$500<span className="text-sm font-normal text-gray-500">/year</span></div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between group">
                Review Program <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-colors cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Recommend</div>
            <CardHeader className="pb-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Network Partner</CardTitle>
              <CardDescription>Full visibility across the CSSN ecosystem.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">$2,500<span className="text-sm font-normal text-gray-500">/year</span></div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between group">
                Review Program <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 hover:border-gray-500 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle>Event Sponsorships</CardTitle>
              <CardDescription>A la carte sponsorship for local signature events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-gray-900 dark:text-white">Custom Pricing</div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between group">
                View Calendar <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
{/* 
We need 'CheckCircle2' imported for benefits map
*/}
    </div>
  );
};
