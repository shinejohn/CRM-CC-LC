import React from 'react';
import { X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ArticleViewerProps {
  article: {
    title: string;
    subtitle?: string;
    content: string;
    word_count?: number;
  };
  onClose: () => void;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({
  article,
  onClose,
}) => {
  const handleDownload = () => {
    // Create a markdown file and download it
    const content = `# ${article.title}\n\n${article.subtitle ? `## ${article.subtitle}\n\n` : ''}${article.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
            {article.subtitle && (
              <p className="text-gray-600 mt-1">{article.subtitle}</p>
            )}
            {article.word_count && (
              <p className="text-sm text-gray-500 mt-1">{article.word_count} words</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download as Markdown"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 prose prose-lg max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

