// Command Center Create Content Modal Component
// CC-FT-04: Content Module

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Content } from '../../hooks/useContent';

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (content: Content) => void;
}

const contentTypes = [
  { value: 'article', label: 'Article' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social Post' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
];

export function CreateContentModal({ open, onClose, onCreated }: CreateContentModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Content['type']>('article');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      // This will be handled by the parent component using useContent hook
      const newContent: Partial<Content> = {
        title,
        type,
        description,
        category: category || undefined,
        status: 'draft',
      };
      
      // The parent should call createContent with this data
      onCreated(newContent as Content);
      
      // Reset form
      setTitle('');
      setType('article');
      setDescription('');
      setCategory('');
      onClose();
    } catch (error) {
      console.error('Failed to create content:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Content Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as Content['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the content..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Marketing, Product, Support..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !title.trim()}>
              {isCreating ? 'Creating...' : 'Create Content'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

