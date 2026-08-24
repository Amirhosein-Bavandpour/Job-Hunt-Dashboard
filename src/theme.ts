import { createTheme } from '@mui/material/styles';

// Theme matched to the candidate's portfolio aesthetic:
// dark slate background (#020617), cyan-400 accent (#22d3ee),
// glassy cards (white/5 + subtle border), glowing cyan status pills.
// Demonstrates MUI theming — an interview talking point.
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617',
      paper: 'rgba(255,255,255,0.05)',
    },
    primary: { main: '#22d3ee' }, // cyan-400
    secondary: { main: '#38bdf8' },
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#cbd5e1', // slate-300
    },
    divider: 'rgba(255,255,255,0.10)',
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    overline: { letterSpacing: '0.3em', textTransform: 'uppercase' },
  },
  shape: { borderRadius: 16 }, // rounded-2xl feel
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'none',
          transition: 'transform .3s ease, border-color .3s ease, background .3s ease',
          '&:hover': {
            borderColor: 'rgba(34,211,238,0.40)',
            background: 'rgba(255,255,255,0.10)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(34,211,238,0.40)',
          background: 'rgba(34,211,238,0.10)',
          color: '#a5f3fc', // cyan-200
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
          borderColor: 'rgba(255,255,255,0.20)',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.10)' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(2,6,23,0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(2,6,23,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.10)',
        },
      },
    },
  },
});

export default theme;
