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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <SearchHeader />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:sticky top-0 h-screen z-30
            w-64 lg:w-72
            bg-white border-r border-gray-200
            transition-transform duration-300 ease-in-out
            overflow-y-auto
          `}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Learning Center</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <CategorySidebar />
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                >
                  <Menu size={20} />
                </button>
                <div>
                  {/* Breadcrumbs */}
                  {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span>/</span>}
                          {crumb.href ? (
                            <a
                              href={crumb.href}
                              className="hover:text-gray-700 transition-colors"
                            >
                              {crumb.label}
                            </a>
                          ) : (
                            <span>{crumb.label}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </nav>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                </div>
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>

          {/* Page content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};


