import React, { useState, forwardRef, createContext, useContext } from 'react';
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}
const TabsContext = createContext<TabsContextValue | undefined>(undefined);
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}
export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const value = controlledValue ?? internalValue;
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };
  return <TabsContext.Provider value={{
    value,
    onValueChange: handleValueChange
  }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>;
}
export const TabsList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 ${className || ''}`} {...props} />);
TabsList.displayName = 'TabsList';
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({
  className,
  value: triggerValue,
  ...props
}, ref) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const isActive = context.value === triggerValue;
  return <button ref={ref} type="button" role="tab" aria-selected={isActive} onClick={() => context.onValueChange(triggerValue)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'} ${className || ''}`} {...props} />;
});
TabsTrigger.displayName = 'TabsTrigger';
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(({
  className,
  value: contentValue,
  ...props
}, ref) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  if (context.value !== contentValue) return null;
  return <div ref={ref} role="tabpanel" className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${className || ''}`} {...props} />;
});
TabsContent.displayName = 'TabsContent';