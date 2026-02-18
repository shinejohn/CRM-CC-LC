// Command Center Content Card Component
// CC-FT-04: Content Module

import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  FileText, Image, Video, Mail, MessageSquare,
  MoreVertical, Eye, Edit, Trash2, Share2, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
export interface ContentCardItem {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  excerpt?: string;
  thumbnail?: string;
  category?: string;
  updatedAt: string;
}

interface ContentCardProps {
  content: ContentCardItem;
  onDelete?: () => void;
  onStatusChange?: (status: 'draft' | 'review' | 'approved' | 'published' | 'archived') => void;
}

const typeIcons = {
  article: FileText,
  email: Mail,
  social: MessageSquare,
  video: Video,
  image: Image,
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

export function ContentCard({ content, onDelete, onStatusChange }: ContentCardProps) {
  const navigate = useNavigate();
  const TypeIcon = typeIcons[content.type] || FileText;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
        onClick={() => navigate(`/command-center/content/${content.id}`)}
      >
        {/* Thumbnail */}
        {content.thumbnail ? (
          <div className="h-32 bg-gray-100 dark:bg-slate-700">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-purple-400" />
          </div>
        )}

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {content.type}
              </Badge>
              <Badge className={statusColors[content.status]}>
                {content.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/command-center/content/${content.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/command-center/content/${content.id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {content.status === 'draft' && onStatusChange && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('review'); }}>
                    Send to Review
                  </DropdownMenuItem>
                )}
                {content.status === 'review' && onStatusChange && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('approved'); }}>
                    Approve
                  </DropdownMenuItem>
                )}
                {(content.status === 'approved' || content.status === 'review') && onStatusChange && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('published'); }}>
                    Publish
                  </DropdownMenuItem>
                )}
                {content.status !== 'archived' && (onStatusChange || onDelete) && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange ? onStatusChange('archived') : onDelete?.();
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title & Excerpt */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {content.title}
          </h3>
          {content.excerpt && (
            <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
              {content.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(content.updatedAt).toLocaleDateString()}
            </span>
            {content.category && (
              <Badge variant="outline" className="text-xs">
                {content.category}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

