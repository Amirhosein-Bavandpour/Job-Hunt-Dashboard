import { createTheme } from '@mui/material/styles';

// Custom MUI theme -> demonstrates you can go beyond default MUI demo look.
// A junior who can define a coherent theme + tokens is interview-strong.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: { root: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' } },
    },
  },
});

export default theme;
