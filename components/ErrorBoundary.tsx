'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@heroui/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ErrorBoundaryState, ErrorInfo } from '@/types';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
          
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
              {error.message}
            </div>
          </details>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1"
              color="primary"
              startContent={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="bordered"
              className="flex-1"
              startContent={<Home className="h-4 w-4" />}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function onError(error: Error, errorInfo: ErrorInfo) {
  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }
  
  // In production, you would send this to your error reporting service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendErrorToService(error, errorInfo);
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={onError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Higher-order component for wrapping pages
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
