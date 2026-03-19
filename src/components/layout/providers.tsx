'use client';
import React from 'react';
import ReactQueryProvider from '@/providers/react-query-provider';
import { ActiveThemeProvider } from '../themes/active-theme';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        {children}
      </ActiveThemeProvider>
    </ReactQueryProvider>
  );
}
