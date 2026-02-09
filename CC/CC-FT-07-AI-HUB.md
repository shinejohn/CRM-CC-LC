# CC-FT-07: AI Hub Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-07 |
| Name | AI Hub Module |
| Phase | 3 - Feature Modules |
| Dependencies | CC-SVC-06 (AI Service), CC-SVC-01 (WebSocket) |
| Estimated Time | 6 hours |
| Agent Assignment | Agent 17 |

---

## Purpose

Create the AI Hub - the central AI interface for the Command Center. This provides an advanced chat interface, AI workflow orchestration, personality selection, and AI-powered analysis tools. This is the "brain" of the Command Center.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/AIInterfacePage.tsx`
- Full chat interface
- Message bubbles with citations
- Tool call indicators

**Secondary Reference:** `/magic/patterns/AIWorkflowPanel.tsx`
- Workflow orchestration
- Multi-step task execution
- Progress indicators

**Tertiary Reference:** `/magic/patterns/AIPresentationPanel.tsx`
- Presentation mode
- Data visualization
- Report generation

---

## API Endpoints Used

```
POST   /v1/ai/chat                       # Send chat message
POST   /v1/ai/chat/stream                # Streaming chat (SSE)
POST   /v1/ai/generate                   # Generate content
GET    /v1/ai/personalities              # List AI personalities
PUT    /v1/ai/personality                # Set active personality
GET    /v1/ai/history                    # Chat history
DELETE /v1/ai/history/{id}               # Delete conversation
POST   /v1/ai/analyze                    # Run analysis
POST   /v1/ai/workflow                   # Execute workflow
GET    /v1/ai/capabilities               # Get AI capabilities
```

---

## Deliverables

### 1. AI Hub Page

```typescript
// src/command-center/modules/ai-hub/AIHubPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, MessageSquare, Wand2, BarChart2, FileText,
  Settings, History, ChevronRight, Brain, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AIChat } from './AIChat';
import { AIWorkflowPanel } from './AIWorkflowPanel';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { AIPersonalitySelector } from './AIPersonalitySelector';
import { AICapabilities } from './AICapabilities';
import { useAI } from '../../hooks/useAI';

export function AIHubPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    currentPersonality,
    capabilities,
    isConnected,
  } = useAI();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Hub
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {currentPersonality?.name || 'Default Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AIPersonalitySelector />
          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-b bg-gray-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Capabilities
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
            <AIChat />
          </TabsContent>

          <TabsContent value="workflows" className="flex-1 overflow-hidden p-6">
            <AIWorkflowPanel />
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 overflow-hidden p-6">
            <AIAnalysisPanel />
          </TabsContent>

          <TabsContent value="capabilities" className="flex-1 overflow-hidden p-6">
            <AICapabilities capabilities={capabilities} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const quickActions = [
  { id: 'write', label: 'Write Content', icon: FileText, color: 'purple' },
  { id: 'analyze', label: 'Analyze Data', icon: BarChart2, color: 'blue' },
  { id: 'brainstorm', label: 'Brainstorm Ideas', icon: Sparkles, color: 'pink' },
  { id: 'email', label: 'Draft Email', icon: MessageSquare, color: 'green' },
  { id: 'report', label: 'Generate Report', icon: FileText, color: 'orange' },
];

function QuickActionButton({ action }: { action: typeof quickActions[0] }) {
  const Icon = action.icon;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
        bg-white dark:bg-slate-800 border shadow-sm
        hover:shadow-md transition-all
      `}
    >
      <Icon className={`w-4 h-4 text-${action.color}-500`} />
      <span className="text-sm font-medium">{action.label}</span>
    </motion.button>
  );
}
```

### 2. AI Chat Component

```typescript
// src/command-center/modules/ai-hub/AIChat.tsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Mic, StopCircle, Sparkles,
  ThumbsUp, ThumbsDown, Copy, RefreshCw, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIMessage } from './AIMessage';
import { ToolCallIndicator } from './ToolCallIndicator';
import { useAI } from '../../hooks/useAI';
import { AIMessage as AIMessageType } from '@/types/command-center';

export function AIChat() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    currentToolCalls,
    sendMessage,
    stopGeneration,
    regenerate,
  } = useAI();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={setInput} />
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AIMessage
                    message={message}
                    onRegenerate={message.role === 'assistant' ? regenerate : undefined}
                    isLast={index === messages.length - 1}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Tool Calls in Progress */}
            {currentToolCalls.length > 0 && (
              <div className="space-y-2">
                {currentToolCalls.map((tool) => (
                  <ToolCallIndicator key={tool.id} toolCall={tool} />
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-500"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white dark:bg-slate-900 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="min-h-[52px] max-h-[200px] pr-24 resize-none"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isRecording ? 'text-red-500' : ''}`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            {isStreaming ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={stopGeneration}
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <p className="text-xs text-center text-gray-400 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    "Help me draft an email to a new lead",
    "Analyze my customer engagement this month",
    "Write a social media post about our services",
    "Create a follow-up sequence for cold leads",
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        How can I help you today?
      </h2>
      <p className="text-gray-500 dark:text-slate-400 mb-8">
        I can help with content creation, data analysis, customer outreach, and more.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-4 bg-white dark:bg-slate-800 border rounded-xl text-left hover:shadow-md transition-all"
          >
            <p className="text-sm text-gray-700 dark:text-slate-300">{suggestion}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

### 3. AI Message Component

```typescript
// src/command-center/modules/ai-hub/AIMessage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  User, Bot, Copy, Check, ThumbsUp, ThumbsDown, 
  RefreshCw, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIMessage as AIMessageType, Citation } from '@/types/command-center';

interface AIMessageProps {
  message: AIMessageType;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export function AIMessage({ message, onRegenerate, isLast }: AIMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showCitations, setShowCitations] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser
            ? 'bg-purple-100 dark:bg-purple-900'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }
        `}
      >
        {isUser ? (
          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`
            inline-block rounded-2xl px-4 py-3
            ${isUser
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
            }
          `}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-200 dark:bg-slate-700 p-3 rounded-lg overflow-x-auto">
                        <code className={className}>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {showCitations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {message.citations.length} source{message.citations.length !== 1 ? 's' : ''}
            </button>
            
            {showCitations && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                {message.citations.map((citation, index) => (
                  <CitationCard key={index} citation={citation} />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${feedback === 'up' ? 'text-green-500' : ''}`}
              onClick={() => setFeedback('up')}
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${feedback === 'down' ? 'text-red-500' : ''}`}
              onClick={() => setFeedback('down')}
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRegenerate}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-xs text-gray-400 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

function CitationCard({ citation }: { citation: Citation }) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
    >
      <ExternalLink className="w-3 h-3 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">
          {citation.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{citation.source}</p>
      </div>
    </a>
  );
}
```

### 4. AI Workflow Panel

```typescript
// src/command-center/modules/ai-hub/AIWorkflowPanel.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Play, Pause, CheckCircle, Clock, AlertCircle,
  ChevronRight, Settings, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

const predefinedWorkflows: Workflow[] = [
  {
    id: 'lead-nurture',
    name: 'Lead Nurture Sequence',
    description: 'Automatically nurture new leads with personalized content',
    steps: [
      { id: '1', name: 'Analyze lead profile', status: 'pending' },
      { id: '2', name: 'Generate personalized content', status: 'pending' },
      { id: '3', name: 'Schedule follow-up emails', status: 'pending' },
      { id: '4', name: 'Set reminders', status: 'pending' },
    ],
    status: 'idle',
    progress: 0,
  },
  {
    id: 'content-repurpose',
    name: 'Content Repurposing',
    description: 'Transform one piece of content into multiple formats',
    steps: [
      { id: '1', name: 'Analyze source content', status: 'pending' },
      { id: '2', name: 'Generate social posts', status: 'pending' },
      { id: '3', name: 'Create email newsletter', status: 'pending' },
      { id: '4', name: 'Draft blog summary', status: 'pending' },
    ],
    status: 'idle',
    progress: 0,
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze competitor presence and generate insights',
    steps: [
      { id: '1', name: 'Gather competitor data', status: 'pending' },
      { id: '2', name: 'Analyze pricing', status: 'pending' },
      { id: '3', name: 'Compare features', status: 'pending' },
      { id: '4', name: 'Generate report', status: 'pending' },
    ],
    status: 'idle',
    progress: 0,
  },
];

export function AIWorkflowPanel() {
  const [workflows, setWorkflows] = useState(predefinedWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  const runWorkflow = async (workflowId: string) => {
    setActiveWorkflow(workflowId);
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'running' as const, progress: 0 } : w
    ));

    // Simulate workflow execution
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        const newSteps = w.steps.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' as const : index === i + 1 ? 'running' as const : 'pending' as const,
        }));
        return { ...w, steps: newSteps, progress: ((i + 1) / 4) * 100 };
      }));
    }

    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'completed' as const } : w
    ));
    setActiveWorkflow(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Workflows</h2>
          <p className="text-sm text-gray-500">Automate complex tasks with AI-powered workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            isActive={activeWorkflow === workflow.id}
            onRun={() => runWorkflow(workflow.id)}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  isActive,
  onRun,
}: {
  workflow: Workflow;
  isActive: boolean;
  onRun: () => void;
}) {
  const statusIcons = {
    idle: <Clock className="w-4 h-4 text-gray-400" />,
    running: <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className={`transition-all ${isActive ? 'ring-2 ring-purple-500' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {statusIcons[workflow.status]}
              <CardTitle className="text-base">{workflow.name}</CardTitle>
            </div>
            <Badge variant={workflow.status === 'running' ? 'default' : 'outline'}>
              {workflow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">{workflow.description}</p>

          {workflow.status === 'running' && (
            <div className="mb-4">
              <Progress value={workflow.progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(workflow.progress)}% complete
              </p>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-2 mb-4">
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  flex items-center gap-2 text-sm
                  ${step.status === 'completed' ? 'text-green-600' : ''}
                  ${step.status === 'running' ? 'text-purple-600 font-medium' : ''}
                  ${step.status === 'pending' ? 'text-gray-400' : ''}
                `}
              >
                <span className="w-4 text-center">{index + 1}.</span>
                <span className="flex-1">{step.name}</span>
                {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {step.status === 'running' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Zap className="w-3 h-3" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={onRun}
            disabled={workflow.status === 'running'}
          >
            {workflow.status === 'running' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 5. Module Index

```typescript
// src/command-center/modules/ai-hub/index.ts

export { AIHubPage } from './AIHubPage';
export { AIChat } from './AIChat';
export { AIMessage } from './AIMessage';
export { AIWorkflowPanel } from './AIWorkflowPanel';
export { AIAnalysisPanel } from './AIAnalysisPanel';
export { AIPersonalitySelector } from './AIPersonalitySelector';
export { AICapabilities } from './AICapabilities';
export { ToolCallIndicator } from './ToolCallIndicator';
```

---

## Acceptance Criteria

- [ ] AI Hub page with tabbed interface
- [ ] Full chat interface with streaming
- [ ] Message bubbles with markdown rendering
- [ ] Tool call indicators during execution
- [ ] Workflow panel with predefined workflows
- [ ] Workflow execution with progress
- [ ] Personality selector
- [ ] Citation support in messages
- [ ] Copy/feedback actions on messages
- [ ] Welcome screen with suggestions
- [ ] Voice input button (UI only)
- [ ] File attachment button (UI only)
- [ ] Mobile responsive

---

## Handoff

When complete, this module provides:

1. `AIHubPage` - Main AI interface
2. `AIChat` - Chat component with streaming
3. `AIMessage` - Message bubble component
4. `AIWorkflowPanel` - Workflow orchestration
5. Supporting components

Other agents import:
```typescript
import { AIHubPage, AIChat } from '@/command-center/modules/ai-hub';
```
