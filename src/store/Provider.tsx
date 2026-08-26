'use client';

import { ReactNode, useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { hydrateAuth } from '@/store/authSlice';

// Client-only providers. The theme is created and consumed entirely on the
// client so MUI's breakpoints functions are NEVER serialized across the
// server/client boundary (which causes "Functions cannot be passed to Client
// Components" during static generation).
export function AppProviders({ children }: { children: ReactNode }) {
  // Hydrate auth from localStorage AFTER mount (avoids SSR hydration mismatch).
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>{children}</Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
