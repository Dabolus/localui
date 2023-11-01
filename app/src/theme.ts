import { createTheme } from '@mui/material';
import { Link as RemixLink } from '@remix-run/react';
import './fonts/styles.css';

// Create a theme instance.
const theme = createTheme({
  shape: {
    borderRadius: 2,
  },
  palette: {
    primary: {
      main: '#232f3e',
    },
    secondary: {
      main: '#ff9900',
    },
  },
  typography: {
    allVariants: {
      fontFamily: '"Amazon Ember", sans-serif',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          textTransform: 'none',
          padding: '4px 20px',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
        color: 'secondary',
        component: RemixLink,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

export default theme;
