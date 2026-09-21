import { createTheme } from '@mui/material/styles';

// Central MUI theme so every page shares the same palette and shape tokens.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2E5945' },
    secondary: { main: '#C9A876' },
    background: { default: '#F7F8FA', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
      },
    },
  },
});

export default theme;
