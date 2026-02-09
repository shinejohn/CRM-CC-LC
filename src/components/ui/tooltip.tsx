import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipContextType {
  register: (id: string, content: React.ReactNode, element: HTMLElement) => void;
  unregister: (id: string) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltips, setTooltips] = useState<Map<string, { content: React.ReactNode; element: HTMLElement }>>(new Map());

  const register = (id: string, content: React.ReactNode, element: HTMLElement) => {
    setTooltips(prev => new Map(prev).set(id, { content, element }));
  };

  const unregister = (id: string) => {
    setTooltips(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <TooltipContext.Provider value={{ register, unregister }}>
      {children}
      {Array.from(tooltips.entries()).map(([id, { content, element }]) => {
        const rect = element.getBoundingClientRect();
        return createPortal(
          <div
            key={id}
            className="fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 dark:bg-slate-800 rounded shadow-lg pointer-events-none"
            style={{
              left: rect.left + rect.width / 2,
              top: rect.top - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {content}
          </div>,
          document.body
        );
      })}
    </TooltipContext.Provider>
  );
}

interface TooltipProps {
  children: React.ReactElement;
  content?: React.ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [id] = useState(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const context = React.useContext(TooltipContext);
  const childRef = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!context || !content || !isHovered || !childRef.current) return;
    context.register(id, content, childRef.current);
    return () => context.unregister(id);
  }, [id, content, context, isHovered]);

  if (!context) {
    return children;
  }

  const child = React.cloneElement(children, {
    ref: (el: HTMLElement | null) => {
      childRef.current = el;
      if (children.props.ref) {
        if (typeof children.props.ref === 'function') {
          children.props.ref(el);
        } else {
          children.props.ref.current = el;
        }
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      setIsHovered(true);
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setIsHovered(false);
      children.props.onMouseLeave?.(e);
    },
  });

  return child;
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactElement; asChild?: boolean }) {
  return children;
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

