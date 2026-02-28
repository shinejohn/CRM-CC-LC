import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
const alertVariants = cva('relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950', {
  variants: {
    variant: {
      default: 'bg-white text-slate-950 border-slate-200',
      destructive: 'border-red-500/50 text-red-900 bg-red-50 [&>svg]:text-red-600',
      success: 'border-green-500/50 text-green-900 bg-green-50 [&>svg]:text-green-600',
      warning: 'border-yellow-500/50 text-yellow-900 bg-yellow-50 [&>svg]:text-yellow-600',
      info: 'border-blue-500/50 text-blue-900 bg-blue-50 [&>svg]:text-blue-600'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});
const iconMap = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info
};
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  showIcon?: boolean;
}
export const Alert = forwardRef<HTMLDivElement, AlertProps>(({
  className,
  variant,
  icon,
  showIcon = true,
  children,
  ...props
}, ref) => {
  const Icon = variant ? iconMap[variant] : iconMap.default;
  return <div ref={ref} role="alert" className={`${alertVariants({
    variant
  })} ${className || ''}`} {...props}>
        {showIcon && (icon || <Icon className="h-4 w-4" />)}
        {children}
      </div>;
});
Alert.displayName = 'Alert';
export const AlertTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => <h5 ref={ref} className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`} {...props} />);
AlertTitle.displayName = 'AlertTitle';
export const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={`text-sm [&_p]:leading-relaxed ${className || ''}`} {...props} />);
AlertDescription.displayName = 'AlertDescription';