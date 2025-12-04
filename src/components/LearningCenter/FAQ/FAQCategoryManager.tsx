import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { FAQCategory } from '@/types/learning';

export const FAQCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const tree = await knowledgeApi.getCategoryTree();
      setCategories(tree);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-4">
          Drag to reorder • Right-click for options
        </p>
        <div className="space-y-1">
          {categories.map((category) => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              expanded={expanded.has(category.id)}
              onToggle={() => toggleExpand(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CategoryTreeItemProps {
  category: FAQCategory;
  expanded: boolean;
  onToggle: () => void;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  expanded,
  onToggle,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded group">
        <button className="text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </button>
        {category.children && category.children.length > 0 ? (
          <button onClick={onToggle} className="text-gray-400">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium text-gray-900">{category.name}</span>
          <span className="text-sm text-gray-500">({category.faq_count} FAQs)</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </div>
      {expanded && category.children && (
        <div className="ml-8 space-y-1">
          {category.children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded group"
            >
              <div className="w-4" />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-700">{child.name}</span>
                <span className="text-sm text-gray-500">({child.faq_count})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


