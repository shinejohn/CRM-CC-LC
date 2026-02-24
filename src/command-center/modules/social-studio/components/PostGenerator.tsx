import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';

export const PostGenerator: React.FC = () => {
    const [brief, setBrief] = useState('');
    const [platforms, setPlatforms] = useState<string[]>(['facebook']);
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<Record<string, string> | null>(null);

    const togglePlatform = (p: string) => {
        setPlatforms(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    };

    const handleGenerate = () => {
        if (!brief || platforms.length === 0) return;

        setIsGenerating(true);
        // Simulate generation delay
        setTimeout(() => {
            const mockResult: Record<string, string> = {};
            platforms.forEach(p => {
                mockResult[p] = `🚀 Exciting update on ${p}! ${brief}\n\n#socialstudio #autosync #${p}`;
            });
            setResults(mockResult);
            setIsGenerating(false);
        }, 2000);
    };

    const getPlatformIcon = (id: string) => {
        switch (id) {
            case 'facebook': return <Facebook className="w-4 h-4" />;
            case 'instagram': return <Instagram className="w-4 h-4" />;
            case 'x': return <Twitter className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <Card className="h-full flex flex-col border-indigo-100 shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Create New Post
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">What do you want to share?</label>
                        <Textarea
                            placeholder="e.g. We are throwing a summer block party next Friday with live music and food trucks!"
                            className="resize-none h-32 text-base p-4"
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Select Platforms</label>
                        <div className="flex flex-wrap gap-2">
                            {['facebook', 'instagram', 'x'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => togglePlatform(p)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all shadow-sm ${platforms.includes(p)
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
                                            : 'bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {getPlatformIcon(p)}
                                    <span className="capitalize">{p}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-slate-50 mt-auto rounded-b-xl">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-slate-500 font-medium">
                            Cost: <span className="text-indigo-600 ml-1">{platforms.length * 5} Credits</span>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !brief || platforms.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Copy'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <Card className="h-full bg-slate-50 border-dashed border-2 shadow-none overflow-hidden flex flex-col">
                {results ? (
                    <>
                        <CardHeader className="pb-2 bg-white border-b">
                            <CardTitle className="text-lg">Generated Variants</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <div className="divide-y">
                                {platforms.map(p => results[p] && (
                                    <div key={p} className="p-5 bg-white mb-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                                                {getPlatformIcon(p)}
                                            </div>
                                            <span className="font-medium capitalize text-slate-700">{p} Copy</span>
                                        </div>
                                        <Textarea
                                            defaultValue={results[p]}
                                            className="min-h-[100px] border-slate-200 focus-visible:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-white p-4 border-t mt-auto">
                            <Button className="w-full" variant="outline">Schedule These Posts</Button>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 h-full text-slate-400">
                        <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="text-lg font-medium text-slate-500">Awaiting your brief</p>
                        <p className="text-sm">Describe your post on the left, and AI variants will appear here.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
