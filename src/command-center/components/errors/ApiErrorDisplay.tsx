import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '../../services/api.types';

interface ApiErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ApiErrorDisplay({ error, onRetry }: ApiErrorDisplayProps) {
  const getErrorMessage = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection.';
      case 'TIMEOUT':
        return 'The request took too long. Please try again.';
      case 'HTTP_401':
        return 'Your session has expired. Please log in again.';
      case 'HTTP_403':
        return 'You don\'t have permission to perform this action.';
      case 'HTTP_404':
        return 'The requested resource was not found.';
      case 'HTTP_500':
        return 'Something went wrong on our end. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 max-w-sm">
        {getErrorMessage()}
      </p>
      {error.code && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
          Error code: {error.code}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

