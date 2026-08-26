'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import type { RootState } from '@/store';

// Client-side route guard: redirects to /login when no auth token is present.
// (Token lives in Redux, persisted to localStorage — swap for middleware +
// httpOnly cookie when a real backend lands.)
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  return <>{children}</>;
}
