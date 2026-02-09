import React, { useEffect, useState } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { conversationApi } from '@/services/crm/crm-api';
import { MessageSquare, Clock, User, Search } from 'lucide-react';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await conversationApi.list();
      setConversations(data.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    !searchQuery || 
    conv.customer?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.session_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LearningLayout 
      title="Inbound Conversations"
      breadcrumbs={[
        { label: 'Inbound', href: '/learning/inbound' },
        { label: 'Conversations' },
      ]}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {conversation.customer?.business_name || 'Unknown Customer'}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {conversation.entry_point || 'unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(conversation.started_at).toLocaleDateString()}
                      </div>
                      {conversation.outcome && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          {conversation.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LearningLayout>
  );
};

