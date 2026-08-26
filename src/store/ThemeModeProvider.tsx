'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeMode } from '@/types';

// Matched to the candidate's portfolio aesthetic:
// dark slate (#020617) + cyan-400 (#22d3ee) + glassy cards (light/dark variants).
const buildTheme = (mode: ThemeMode): Theme => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#020617' : '#e2e8f0',
        paper: isDark ? '#0b1220' : '#ffffff',
      },
      primary: { main: '#22d3ee' },
      secondary: { main: '#38bdf8' },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#cbd5e1' : '#475569',
      },
      divider: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
    },
    typography: {
      fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      overline: { letterSpacing: '0.3em', textTransform: 'uppercase' },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.70)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: 'none',
            transition: 'transform .3s ease, border-color .3s ease, background .3s ease',
            '&:hover': {
              borderColor: 'rgba(34,211,238,0.40)',
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.90)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            border: '1px solid rgba(34,211,238,0.40)',
            background: 'rgba(34,211,238,0.10)',
            color: isDark ? '#a5f3fc' : '#0e7490',
            boxShadow: '0 0 18px rgba(34,211,238,0.35)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: '#22d3ee',
            color: '#020617',
            borderRadius: 999,
            fontWeight: 600,
            '&:hover': { backgroundColor: '#67e8f9' },
          },
          outlinedPrimary: {
            borderRadius: 999,
            borderColor: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(15,23,42,0.20)',
            '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.05)' },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(2,6,23,0.85)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)'}`,
            color: isDark ? '#f1f5f9' : '#0f172a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? 'rgba(2,6,23,0.95)' : 'rgba(248,250,252,0.98)',
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)'}`,
            color: isDark ? '#f1f5f9' : '#0f172a',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: isDark ? '#0b1220' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          },
          list: { padding: 4 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            color: isDark ? '#f1f5f9' : '#0f172a',
            '&:hover': { background: 'rgba(34,211,238,0.10)' },
            '&.Mui-selected': {
              background: 'rgba(34,211,238,0.15)',
              '&:hover': { background: 'rgba(34,211,238,0.20)' },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: isDark ? 'rgba(2,6,23,0.97)' : 'rgba(255,255,255,0.98)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            color: isDark ? '#f1f5f9' : '#0f172a',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { color: '#22d3ee', fontWeight: 700, pb: 1 },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': { color: isDark ? '#94a3b8' : '#64748b' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#22d3ee' },
            '& .MuiOutlinedInput-root': {
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
              borderRadius: 12,
              '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.15)' },
              '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.30)' },
              '&.Mui-focused fieldset': { borderColor: '#22d3ee' },
            },
            '& .MuiOutlinedInput-input': { color: isDark ? '#f1f5f9' : '#0f172a' },
          },
        },
      },
    },
  });
};

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  theme: Theme;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

const STORAGE_KEY = 'jhd_theme_mode';

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') setMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')), theme }),
    [mode, theme]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
