'use client';

import React from 'react';
import { Spinner, Progress } from '@heroui/react';
import { Loader2, Activity, Zap } from 'lucide-react';
import { LoadingState } from '@/types';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  label,
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} color={color} />
      {label && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      )}
    </div>
  );
}

interface ProgressLoaderProps {
  progress: number;
  message?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressLoader({ 
  progress, 
  message, 
  showPercentage = true,
  className = '' 
}: ProgressLoaderProps) {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <Activity className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message || 'Loading...'}
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <Progress 
        value={progress} 
        className="w-full"
        color="primary"
        size="sm"
      />
    </div>
  );
}

interface FullPageLoaderProps {
  message?: string;
  showLogo?: boolean;
}

export function FullPageLoader({ 
  message = 'Loading Green Hydrogen Platform...', 
  showLogo = true 
}: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Green Hydrogen Platform
            </h1>
          </div>
        )}
        
        <LoadingSpinner size="lg" label={message} />
        
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CardLoaderProps {
  lines?: number;
  className?: string;
}

export function CardLoader({ lines = 3, className = '' }: CardLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

interface TableLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableLoader({ rows = 5, columns = 4, className = '' }: TableLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ width: `${Math.random() * 30 + 70}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChartLoaderProps {
  className?: string;
}

export function ChartLoader({ className = '' }: ChartLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-end justify-between p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{
                width: '10%',
                height: `${Math.random() * 80 + 20}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface LoadingStateManagerProps {
  loadingState: LoadingState;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LoadingStateManager({ 
  loadingState, 
  children, 
  fallback 
}: LoadingStateManagerProps) {
  if (loadingState.error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading data</div>
        <div className="text-sm text-gray-500">{loadingState.error}</div>
      </div>
    );
  }

  if (loadingState.isLoading) {
    if (loadingState.progress !== undefined) {
      return (
        <ProgressLoader
          progress={loadingState.progress}
          message={loadingState.message}
        />
      );
    }
    
    return fallback || <LoadingSpinner label={loadingState.message} />;
  }

  return <>{children}</>;
}

// Custom hook for managing loading states
export function useLoadingState(initialState: Partial<LoadingState> = {}) {
  const [loadingState, setLoadingState] = React.useState<LoadingState>({
    isLoading: false,
    progress: undefined,
    message: undefined,
    error: undefined,
    ...initialState,
  });

  const startLoading = (message?: string) => {
    setLoadingState({
      isLoading: true,
      progress: undefined,
      message,
      error: undefined,
    });
  };

  const updateProgress = (progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || prev.message,
    }));
  };

  const stopLoading = () => {
    setLoadingState({
      isLoading: false,
      progress: undefined,
      message: undefined,
      error: undefined,
    });
  };

  const setError = (error: string) => {
    setLoadingState({
      isLoading: false,
      progress: undefined,
      message: undefined,
      error,
    });
  };

  return {
    loadingState,
    startLoading,
    updateProgress,
    stopLoading,
    setError,
  };
}
