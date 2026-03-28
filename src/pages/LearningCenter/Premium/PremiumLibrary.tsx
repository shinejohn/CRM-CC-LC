import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Lock, Star, ChevronRight, CheckCircle, Shield, Award } from 'lucide-react';
import { Link } from 'react-router';

export const PremiumLibrary: React.FC = () => {
  const isPremiumUser = false; // Mock state

  const premiumTracks = [
    {
      id: 'trk-1',
      title: 'Advanced AI Prompt Engineering',
      description: 'Master the art of crafting complex prompts to get the maximum value from our AI Personalities. Includes 10 real-world business case studies.',
      modules: 8,
      duration: '4h 30m',
      level: 'Advanced',
      tags: ['AI', 'Prompting', 'Efficiency'],
    },
    {
      id: 'trk-2',
      title: 'Multisite SEO Architecture',
      description: 'Learn how to perfectly structure your Day.News and Go Event City pages to dominate local search rankings and drive organic traffic.',
      modules: 12,
      duration: '6h 15m',
      level: 'Expert',
      tags: ['SEO', 'Marketing', 'Growth'],
    },
    {
      id: 'trk-3',
      title: 'Enterprise CRM Automation Playbook',
      description: 'Automate your entire sales pipeline. Deep dive into workflows, AI handoffs, and postal service integrations.',
      modules: 6,
      duration: '3h 45m',
      level: 'Intermediate',
      tags: ['CRM', 'Sales', 'Automation'],
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 mb-4 px-3 py-1 text-xs">Fibonacco Premium Exclusive</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Accelerate your growth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Premium Content</span>
          </h1>
          <p className="text-lg text-slate-600">
            Unlock advanced strategies, deep technical tutorials, and certification tracks designed for enterprise users and agency partners.
          </p>
          
          {!isPremiumUser && (
            <div className="mt-8 flex justify-center gap-4">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-md px-8 h-12">
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {premiumTracks.map((track) => (
            <Card key={track.id} className="flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              {!isPremiumUser && (
                <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white p-4 rounded-full shadow-lg text-slate-900 mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <Button variant="default" className="bg-slate-900 text-white shadow-lg">Unlock This Track</Button>
                </div>
              )}
              
              <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">{track.level}</Badge>
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">{track.title}</h3>
              </div>
              
              <CardContent className="flex-1 p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">{track.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {track.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 flex justify-between items-center text-sm font-medium text-slate-500 border-t border-slate-100 mt-4">
                <div className="flex items-center gap-4 py-3">
                  <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4"/> {track.modules} modules</span>
                  <span className="flex items-center gap-1.5"><Shield className="w-4 h-4"/> {track.duration}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Certifications CTA */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500" />
              Get Verified with Fibonacco Certifications
            </h2>
            <p className="text-slate-600">
              Complete Premium tracks to earn verified certificates. Add them to your LinkedIn profile to showcase your expertise in AI orchestration, local marketing, and automated workflows.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-sm text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sharable verified PDF</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> LinkedIn one-click add</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Platform Partner eligibility</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Custom badge unlocked</li>
            </ul>
          </div>
          <div className="flex-shrink-0">
            <Link to="/learning-center/premium/certificate/demo">
              <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 h-12 px-6">
                View Sample Certificate <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
