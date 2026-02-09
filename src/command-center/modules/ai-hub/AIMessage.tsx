import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  User, Bot, Copy, Check, ThumbsUp, ThumbsDown,
  RefreshCw, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const citations = message.metadata?.citations || [];

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
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
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
        {!isUser && citations.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            >
              {showCitations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {citations.length} source{citations.length !== 1 ? 's' : ''}
            </button>

            {showCitations && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                {citations.map((citation, index) => (
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
              aria-label={copied ? "Copied" : "Copy message"}
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
              aria-label="Thumbs up"
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${feedback === 'down' ? 'text-red-500' : ''}`}
              onClick={() => setFeedback('down')}
              aria-label="Thumbs down"
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRegenerate}
                aria-label="Regenerate message"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
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
      href={citation.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
    >
      <ExternalLink className="w-3 h-3 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">
          {citation.source}
        </p>
        {citation.excerpt && (
          <p className="text-xs text-gray-500 dark:text-slate-500 truncate">{citation.excerpt}</p>
        )}
      </div>
    </a>
  );
}

