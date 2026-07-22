import { createTheme } from '@mui/material/styles';

export const monoFontFamily = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Consolas',
  '"Liberation Mono"',
  'monospace',
].join(',');

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E293B',
      light: '#334155',
      dark: '#0F172A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F766E',
      light: '#14B8A6',
      dark: '#115E59',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F4EF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    error: { main: '#DC2626' },
    success: { main: '#16A34A' },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 20,
          transition: 'transform 150ms ease, box-shadow 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          boxShadow: 'none',
          transition: 'box-shadow 200ms ease, transform 200ms ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
