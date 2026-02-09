import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { CategorySidebar } from './CategorySidebar';
import { SearchHeader } from './SearchHeader';
import type { BreadcrumbItem } from '@/types/learning';

interface LearningLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const LearningLayout: React.FC<LearningLayoutProps> = ({
  children,
  title,
  breadcrumbs = [],
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut for sidebar (Cmd+B / Ctrl+B)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="learning-center-layout min-h-screen" style={{ backgroundColor: 'var(--lc-bg)' }}>
      {/* Header */}
      <header className="learning-center-header sticky top-0 z-40 lc-shadow-sm" role="banner">
        <SearchHeader />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:sticky top-0 h-screen z-30
            learning-center-sidebar
            transition-transform duration-300 ease-in-out
            overflow-y-auto
            lc-shadow-sm
          `}
          style={{ width: 'var(--lc-sidebar-width)' }}
          aria-label="Learning Center navigation"
        >
          <div className="p-4 border-b lc-border flex items-center justify-between lc-transition">
            <h2 className="text-lg font-semibold lc-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              Learning Center
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 lc-text-secondary hover:lc-text-primary lc-transition rounded-md hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
              aria-label="Close sidebar"
              aria-expanded={sidebarOpen}
            >
              <X size={20} />
            </button>
          </div>
          <CategorySidebar />
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden lc-transition-fast"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0" role="main">
          {/* Page header */}
          <div className="lc-surface border-b lc-border px-4 sm:px-6 py-4 lc-shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 lc-text-secondary hover:lc-text-primary lc-transition rounded-md hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  aria-label="Open sidebar"
                  aria-expanded={!sidebarOpen}
                >
                  <Menu size={20} />
                </button>
                <div className="lc-animate-fade-in flex-1 min-w-0">
                  {/* Breadcrumbs */}
                  {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-2 text-sm lc-text-secondary mb-1" aria-label="Breadcrumb">
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span className="lc-text-muted" aria-hidden="true">/</span>}
                          {crumb.href ? (
                            <a
                              href={crumb.href}
                              className="hover:lc-text-primary lc-transition hover:underline truncate"
                              aria-label={crumb.label}
                            >
                              {crumb.label}
                            </a>
                          ) : (
                            <span className="lc-text-primary font-medium truncate" aria-current="page">{crumb.label}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </nav>
                  )}
                  <h1 className="text-xl sm:text-2xl font-bold lc-text-primary truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                    {title}
                  </h1>
                </div>
              </div>
              {actions && (
                <div className="flex items-center gap-2 lc-animate-fade-in flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          <div className="p-4 sm:p-6 lc-animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};








