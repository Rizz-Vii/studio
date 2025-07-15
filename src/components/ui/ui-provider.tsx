"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface UIProviderProps {
  children: React.ReactNode;
}

interface UIContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showFeedback: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideFeedback: () => void;
  feedback: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  };
}

const UIContext = createContext<UIContextType | null>(null);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

export function UIProvider({ children }: UIProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showFeedback = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setFeedback({ message, type, visible: true });
  }, []);

  const hideFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, visible: false }));
  }, []);

  // Auto-hide feedback after 5 seconds
  useEffect(() => {
    if (feedback.visible) {
      const timer = setTimeout(hideFeedback, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback.visible, hideFeedback]);

  return (
    <UIContext.Provider
      value={{
        isLoading,
        setIsLoading,
        showFeedback,
        hideFeedback,
        feedback,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}
