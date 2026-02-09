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
import { useNavigate, useLocation } from 'react-router';

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
    label: 'Landing Pages',
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
    <nav className="p-4 space-y-1" aria-label="Learning Center navigation">
      {mainSections.map((section, index) => (
        <div key={section.id} className="lc-animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          {section.href ? (
            <a
              href={section.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(section.href!);
              }}
              className={`
                flex items-center justify-between gap-2 px-3 py-2.5 lc-radius-md
                text-sm font-medium lc-transition
                focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2
                ${
                  isActive(section.href)
                    ? 'lc-surface-active'
                    : 'lc-text-secondary lc-surface-hover'
                }
              `}
              style={{
                backgroundColor: isActive(section.href) ? 'var(--lc-primary-bg)' : 'transparent',
                color: isActive(section.href) ? 'var(--lc-primary-dark)' : undefined,
              }}
              aria-current={isActive(section.href) ? 'page' : undefined}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span 
                  className="flex-shrink-0"
                  style={{ color: isActive(section.href) ? 'var(--lc-primary)' : undefined }}
                  aria-hidden="true"
                >
                  {section.icon}
                </span>
                <span className="truncate">{section.label}</span>
              </div>
              {section.badge !== undefined && (
                <span 
                  className="text-xs px-2 py-0.5 lc-radius-full lc-transition flex-shrink-0"
                  style={{
                    backgroundColor: isActive(section.href) ? 'var(--lc-primary)' : 'var(--lc-surface-hover)',
                    color: isActive(section.href) ? 'white' : 'var(--lc-text-secondary)',
                  }}
                  aria-label={`${section.badge} items`}
                >
                  {section.badge}
                </span>
              )}
            </a>
          ) : (
            <>
              <button
                onClick={() => toggleSection(section.id)}
                className="
                  w-full flex items-center justify-between gap-2 px-3 py-2.5 lc-radius-md
                  text-sm font-medium lc-text-secondary lc-surface-hover lc-transition
                  focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2
                "
                aria-expanded={expandedSections.has(section.id)}
                aria-controls={`section-${section.id}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex-shrink-0" aria-hidden="true">{section.icon}</span>
                  <span className="truncate">{section.label}</span>
                </div>
                <span 
                  className="lc-transition flex-shrink-0" 
                  style={{ 
                    transform: expandedSections.has(section.id) ? 'rotate(0deg)' : 'rotate(-90deg)' 
                  }}
                  aria-hidden="true"
                >
                  {expandedSections.has(section.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
              </button>
              {expandedSections.has(section.id) && section.children && (
                <div 
                  id={`section-${section.id}`}
                  className="ml-6 mt-1 space-y-1 lc-animate-slide-in-right"
                  role="group"
                  aria-label={`${section.label} submenu`}
                >
                  {section.children.map((item, childIndex) => (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.href);
                      }}
                      className={`
                        flex items-center justify-between gap-2 px-3 py-2 lc-radius-md
                        text-sm lc-transition
                        focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2
                        ${
                          isActive(item.href)
                            ? 'lc-surface-active'
                            : 'lc-text-secondary lc-surface-hover'
                        }
                      `}
                      style={{
                        backgroundColor: isActive(item.href) ? 'var(--lc-primary-bg)' : 'transparent',
                        color: isActive(item.href) ? 'var(--lc-primary-dark)' : undefined,
                        animationDelay: `${childIndex * 30}ms`,
                      }}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <span className={`truncate ${isActive(item.href) ? 'font-medium' : ''}`}>{item.label}</span>
                      {item.badge !== undefined && (
                        <span 
                          className="text-xs px-2 py-0.5 lc-radius-full lc-transition flex-shrink-0"
                          style={{
                            backgroundColor: isActive(item.href) ? 'var(--lc-primary)' : 'var(--lc-surface-hover)',
                            color: isActive(item.href) ? 'white' : 'var(--lc-text-secondary)',
                          }}
                          aria-label={`${item.badge} items`}
                        >
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
      <div className="mt-8 pt-6 border-t lc-border" role="region" aria-label="Quick statistics">
        <div className="px-3 mb-3">
          <div className="text-xs font-semibold lc-text-muted uppercase tracking-wider">
            Quick Stats
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div 
            className="px-3 py-2.5 lc-radius-md lc-transition hover:lc-shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-600 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
            role="button"
            tabIndex={0}
            aria-label="23 items pending validation"
          >
            <div className="font-medium" style={{ color: 'var(--lc-accent-dark)' }}>
              Pending Validation
            </div>
            <div className="text-xs" style={{ color: 'var(--lc-accent-dark)' }}>23 items</div>
          </div>
          <div 
            className="px-3 py-2.5 lc-radius-md lc-transition hover:lc-shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
            role="button"
            tabIndex={0}
            aria-label="5 items missing embeddings"
          >
            <div className="font-medium" style={{ color: 'var(--lc-primary-dark)' }}>
              Missing Embeddings
            </div>
            <div className="text-xs" style={{ color: 'var(--lc-primary-dark)' }}>5 items</div>
          </div>
          <div 
            className="px-3 py-2.5 lc-radius-md lc-transition hover:lc-shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            role="button"
            tabIndex={0}
            aria-label="12 items with low helpfulness"
          >
            <div className="font-medium" style={{ color: '#dc2626' }}>
              Low Helpfulness
            </div>
            <div className="text-xs" style={{ color: '#dc2626' }}>12 items</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

