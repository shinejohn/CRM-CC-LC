import React, { useState, useEffect } from 'react';
import { Plus, FileText, Edit2, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import { SourceBadge } from '../Common/SourceBadge';
import { ValidationIndicator } from '../Common/ValidationIndicator';
import { EmbeddingIndicator } from '../Common/EmbeddingIndicator';
import { ArticleEditor } from './ArticleEditor';
import { CardSkeleton } from '../Common/LoadingSkeleton';
import type { KnowledgeArticle } from '@/types/learning';

export const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorArticleId, setEditorArticleId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadArticles();
  }, [refreshKey]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const response = await knowledgeApi.getArticles({ perPage: 25 });
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-sm text-gray-600 mt-1">Knowledge articles and documentation</p>
        </div>
        <button
          onClick={() => {
            setEditorArticleId(undefined);
            setEditorOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} />
          Create Article
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No articles yet</p>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
            Create your first article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.content}</p>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <SourceBadge source={article.source} size="sm" />
                <ValidationIndicator status={article.validation_status} />
                {article.embedding_status !== 'completed' && (
                  <EmbeddingIndicator status={article.embedding_status} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditorArticleId(article.id);
                    setEditorOpen(true);
                  }}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => navigate(`/learning/articles/${article.id}`)}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this article?')) {
                      try {
                        await knowledgeApi.deleteKnowledge(article.id);
                        setRefreshKey((k) => k + 1);
                      } catch (error) {
                        console.error('Failed to delete article:', error);
                      }
                    }
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorOpen && (
        <ArticleEditor
          articleId={editorArticleId}
          onClose={() => {
            setEditorOpen(false);
            setEditorArticleId(undefined);
          }}
          onSave={() => {
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
};

