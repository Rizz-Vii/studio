// src/context/AppNavigationContext.tsx
'use client';

import React, { createContext, useContext, MouseEvent } from 'react';

interface AppNavigationContextType {
  handleNavigation: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const AppNavigationContext = createContext<AppNavigationContextType | undefined>(undefined);

export function useAppNavigation() {
    const context = useContext(AppNavigationContext);
    if (!context) {
        throw new Error('useAppNavigation must be used within an AppLayout that provides AppNavigationContext');
    }
    return context;
}

export default AppNavigationContext;
