import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  BookOpen,
  Search,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  badge?: number;
}

const mainSections: SidebarSection[] = [
  {
    id: 'campaigns',
    label: 'Email Campaigns',
    icon: <FileText size={18} />,
    href: '/learning/campaigns',
    badge: 60,
  },
  {
    id: 'content',
    label: 'Content',
    icon: <BookOpen size={18} />,
    children: [
      { id: 'faqs', label: 'FAQs', href: '/learning/faqs', badge: 410 },
      {
        id: 'business-profile',
        label: 'Business Profiles',
        href: '/learning/business-profile',
        badge: 375,
      },
      { id: 'articles', label: 'Articles', href: '/learning/articles' },
    ],
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search size={18} />,
    href: '/learning/search',
  },
  {
    id: 'training',
    label: 'AI Training',
    icon: <GraduationCap size={18} />,
    href: '/learning/training',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={18} />,
    children: [
      { id: 'categories', label: 'Categories', href: '/learning/settings/categories' },
      { id: 'agents', label: 'Agents', href: '/learning/settings/agents' },
    ],
  },
];

export const CategorySidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['content'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="p-4 space-y-1">
      {mainSections.map((section) => (
        <div key={section.id}>
          {section.href ? (
            <a
              href={section.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(section.href!);
              }}
              className={`
                flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                text-sm font-medium transition-colors
                ${
                  isActive(section.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {section.icon}
                <span>{section.label}</span>
              </div>
              {section.badge !== undefined && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {section.badge}
                </span>
              )}
            </a>
          ) : (
            <>
              <button
                onClick={() => toggleSection(section.id)}
                className="
                  w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                  text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors
                "
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span>{section.label}</span>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              {expandedSections.has(section.id) && section.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.children.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.href);
                      }}
                      className={`
                        flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                        text-sm transition-colors
                        ${
                          isActive(item.href)
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Quick Stats Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="px-3 mb-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Stats
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
            <div className="font-medium text-amber-900">Pending Validation</div>
            <div className="text-amber-700 text-xs">23 items</div>
          </div>
          <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-medium text-blue-900">Missing Embeddings</div>
            <div className="text-blue-700 text-xs">5 items</div>
          </div>
          <div className="px-3 py-2 bg-red-50 rounded-lg border border-red-200">
            <div className="font-medium text-red-900">Low Helpfulness</div>
            <div className="text-red-700 text-xs">12 items</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

