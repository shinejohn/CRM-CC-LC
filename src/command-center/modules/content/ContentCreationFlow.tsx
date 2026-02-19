// Command Center Content Creation Flow
// CC-FT-04: Wired to POST /v1/generated-content/generate, generate-from-campaign

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, FileText, Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateContent,
  generateFromCampaign,
  getContentTemplates,
  type ContentTemplate,
  type GeneratedContent,
} from '@/services/command-center/content-api';

const CONTENT_TYPES = [
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'blog', label: 'Blog Post', icon: FileText },
  { value: 'social', label: 'Social Post', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'landing_page', label: 'Landing Page', icon: FileText },
] as const;

export function ContentCreationFlow() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<string>('article');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [templateId, setTemplateId] = useState<string>('');
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  React.useEffect(() => {
    getContentTemplates({ type: contentType }).then(setTemplates).catch(() => setTemplates([]));
  }, [contentType]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (campaignId.trim()) {
        const result = await generateFromCampaign({
          campaign_id: campaignId.trim(),
          type: contentType as GeneratedContent['type'],
          template_id: templateId || undefined,
          parameters: { title, topic },
        });
        setGeneratedContent(result);
      } else {
        const result = await generateContent({
          type: contentType as GeneratedContent['type'],
          parameters: { title, topic },
          template_id: templateId || undefined,
        });
        setGeneratedContent(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseContent = () => {
    if (generatedContent) {
      navigate(`/command-center/content/${generatedContent.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/command-center/content')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Content
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Content
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Generate content with AI or from a campaign
        </p>
      </div>

      <div className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-lg border">
        <div>
          <Label>Content Type</Label>
          <Select value={contentType} onValueChange={(v) => { setContentType(v); setGeneratedContent(null); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2">
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title..."
          />
        </div>

        <div>
          <Label>Topic / Description (optional)</Label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe what the content should cover..."
            rows={3}
          />
        </div>

        <div>
          <Label>Campaign ID (optional - for generate-from-campaign)</Label>
          <Input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Leave empty for standalone generation"
          />
        </div>

        {templates.length > 0 && (
          <div>
            <Label>Template (optional)</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !title.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {generatedContent && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
            Content generated successfully
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4 line-clamp-3">
            {generatedContent.excerpt || generatedContent.content?.slice(0, 300)}
          </p>
          <Button onClick={handleUseContent} className="gap-2">
            <Send className="w-4 h-4" />
            View & Edit Content
          </Button>
        </div>
      )}
    </div>
  );
}
