import React from 'react';
interface PageHeaderProps {
  title: string;
}
export const PageHeader = ({
  title
}: PageHeaderProps) => {
  return <div className="bg-white border-b border-slate-200 px-8 py-4">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    </div>;
};