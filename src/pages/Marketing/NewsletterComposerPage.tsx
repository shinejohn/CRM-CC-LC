import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Clock, Send, Eye, PenTool, Calendar, GripVertical, CheckCircle2, ChevronDown, ListCheck, X } from 'lucide-react';

export const NewsletterComposerPage: React.FC = () => {
  const [subject, setSubject] = useState('This week in your city!');
  const [scheduled, setScheduled] = useState(false);

  // Mock content blocks
  const [blocks, setBlocks] = useState([
    { id: 1, type: 'header', content: 'Local Highlights - May 2026' },
    { id: 2, type: 'article', content: 'New Downtown Park Opens Next Week!' },
    { id: 3, type: 'events', content: 'Upcoming weekend events' },
    { id: 4, type: 'sponsor', content: 'Sponsored by City Chamber' },
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-indigo-500" />
            Newsletter Composer
          </h1>
          <p className="text-gray-500 mt-1">Design, schedule, and send community newsletters.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
            <Send className="w-4 h-4" /> Send Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
        {/* Left pane: Builder / Settings */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input 
                  id="subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preview">Preview Text</Label>
                <Input id="preview" placeholder="Don't miss out on these local updates..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <div className="flex items-center justify-between border rounded-md p-2 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm font-medium">All Subscribers (45.2k)</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Publishing Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule" className="flex flex-col space-y-1">
                  <span>Schedule Send</span>
                  <span className="font-normal text-xs text-slate-500">Send at a later time</span>
                </Label>
                <Switch 
                  id="schedule" 
                  checked={scheduled} 
                  onCheckedChange={setScheduled} 
                />
              </div>
              {scheduled && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex gap-2">
                    <Input type="date" className="flex-1" />
                    <Input type="time" className="flex-1" />
                  </div>
                  <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded flex items-start gap-1">
                    <Clock className="w-3 h-3 mt-0.5" /> 
                    Optimal open rate for your audience is Thursday at 10:00 AM.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Content Modules</CardTitle>
              <CardDescription className="text-xs">Drag and drop to add.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pt-4">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs text-slate-600">
                <PenTool className="w-4 h-4" /> Text Block
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs text-slate-600">
                <Calendar className="w-4 h-4" /> Events
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs text-slate-600">
                <ListCheck className="w-4 h-4" /> Articles
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-xs text-indigo-600 border-indigo-200 bg-indigo-50">
                <Badge className="w-4 h-4 p-0 shadow-none bg-indigo-100 text-indigo-600" /> Sponsor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Editor Pane (WYSIWYG/Blocks) */}
        <div className="lg:col-span-3 h-full">
          <Card className="h-full flex flex-col shadow-sm">
            <div className="border-b bg-slate-50 dark:bg-slate-800/80 p-2 flex justify-center sticky top-0 z-10">
              <Tabs defaultValue="desktop" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="desktop">Desktop View</TabsTrigger>
                  <TabsTrigger value="mobile">Mobile View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 bg-slate-100 dark:bg-slate-900/50 overflow-y-auto p-8 flex justify-center">
              {/* Email Body Wrap */}
              <div className="w-full max-w-[600px] bg-white dark:bg-slate-950 border shadow-sm rounded-md overflow-hidden min-h-[800px]">
                {/* Email Header */}
                <div className="bg-indigo-600 p-6 text-center text-white">
                  <h2 className="text-2xl font-bold tracking-tight">Day.News local</h2>
                  <p className="opacity-80 mt-1">{subject}</p>
                </div>
                
                {/* Draggable Blocks */}
                <div className="p-4 space-y-4">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="group relative border-2 border-transparent hover:border-indigo-200 rounded-lg p-4 transition-all pr-12">
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        <button className="p-1 hover:bg-slate-100 rounded cursor-grab">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-red-50 text-red-500 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {block.type === 'header' && (
                        <h3 className="text-xl font-bold border-b pb-2">{block.content}</h3>
                      )}
                      
                      {block.type === 'article' && (
                        <div className="flex gap-4">
                          <div className="w-1/3 bg-slate-200 rounded aspect-video"></div>
                          <div className="w-2/3">
                            <h4 className="font-semibold">{block.content}</h4>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">The long-awaited park opens to the public bringing 12 acres of green space to the downtown core.</p>
                            <span className="text-indigo-600 text-sm font-medium mt-2 inline-block">Read more →</span>
                          </div>
                        </div>
                      )}

                      {block.type === 'events' && (
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-indigo-500" /> {block.content}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex gap-3 text-sm">
                              <div className="text-center w-12 flex-shrink-0 bg-white rounded border overflow-hidden">
                                <div className="bg-red-500 text-white text-[10px] font-bold uppercase">May</div>
                                <div className="font-bold p-1">14</div>
                              </div>
                              <div>
                                <p className="font-medium">Farmers Market Opening</p>
                                <p className="text-slate-500 text-xs text-muted">9:00 AM @ Town Square</p>
                              </div>
                            </div>
                            <div className="flex gap-3 text-sm">
                              <div className="text-center w-12 flex-shrink-0 bg-white rounded border overflow-hidden">
                                <div className="bg-red-500 text-white text-[10px] font-bold uppercase">May</div>
                                <div className="font-bold p-1">15</div>
                              </div>
                              <div>
                                <p className="font-medium">Symphony in the Park</p>
                                <p className="text-slate-500 text-xs text-muted">7:00 PM @ Centennial Shell</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === 'sponsor' && (
                        <div className="border border-indigo-100 bg-indigo-50/50 p-4 rounded-lg text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">{block.content}</span>
                          <div className="h-24 bg-white border border-indigo-100 flex items-center justify-center text-slate-400 font-medium">
                            [ Sponsor Advertisement Banner ]
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Drop zone placeholder */}
                  <div className="border-2 border-dashed border-slate-200 rounded-lg h-24 flex items-center justify-center text-slate-400 font-medium text-sm">
                    Drag modules here
                  </div>
                </div>
                
                {/* Email Footer */}
                <div className="bg-slate-100 p-6 text-center text-xs text-slate-500 mt-8">
                  <p>You received this email because you subscribed on Day.News</p>
                  <p className="mt-2 text-indigo-600 underline cursor-pointer">Unsubscribe</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
