import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import { ReduxProvider } from '@/store/Provider';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Job Hunt Dashboard',
  description: 'Track your job applications — built with Next.js, MUI, Redux Toolkit, RTK Query, Zustand',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ReduxProvider>
              <AppShell>{children}</AppShell>
            </ReduxProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
