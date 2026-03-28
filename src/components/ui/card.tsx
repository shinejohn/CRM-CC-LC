import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

