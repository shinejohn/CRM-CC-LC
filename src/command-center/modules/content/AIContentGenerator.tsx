// Command Center AI Content Generator Component
// CC-FT-04: Content Module

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, FileText, Mail, MessageSquare, Image,
  Wand2, Copy, Check, RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAI } from '../../hooks/useAI';
import { GenerationRequest } from '../../services/ai.types';

interface AIContentGeneratorProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (content: { type: string; title: string; content: string }) => void;
}

const contentTypes = [
  { id: 'article', label: 'Blog Article', icon: FileText },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'social', label: 'Social Post', icon: MessageSquare },
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasive' },
];

export function AIContentGenerator({ open, onClose, onGenerated }: AIContentGeneratorProps) {
  const [selectedType, setSelectedType] = useState('article');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isLoading } = useAI();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const request: GenerationRequest = {
        type: selectedType as any,
        prompt: `Write a ${selectedType} with a ${tone} tone about: ${prompt}`,
      };
      
      const response = await generate(request);
      setGeneratedContent(response);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onGenerated({
      type: selectedType,
      title: prompt.slice(0, 50),
      content: generatedContent,
    });
    setGeneratedContent('');
    setPrompt('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Content Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <div className="flex gap-2">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What would you like to write about?</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your content idea in detail..."
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {/* Generated Content */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Generated Content</label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                </div>
                <Button onClick={handleUse} className="w-full">
                  Use This Content
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

