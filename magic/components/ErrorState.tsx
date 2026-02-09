import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showSupport?: boolean;
  variant?: 'default' | 'destructive';
}
export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this content. Please check your connection and try again.",
  onRetry,
  showSupport = true,
  variant = 'destructive'
}: ErrorStateProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>

      <Alert variant={variant} className="max-w-md mb-6">
        <AlertTitle className="text-center">{title}</AlertTitle>
        <AlertDescription className="text-center">{message}</AlertDescription>
      </Alert>

      {onRetry && <Button onClick={onRetry} className="mb-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>}

      {showSupport && <p className="text-sm text-slate-500">
          Need help?{' '}
          <Button variant="link" className="p-0 h-auto font-medium">
            Contact Support
          </Button>
        </p>}
    </motion.div>;
}