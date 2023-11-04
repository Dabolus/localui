import { experimental_extendTheme as extendTheme } from '@mui/material';
import { Link as RemixLink } from '@remix-run/react';
import './fonts/styles.css';
// See: https://mui.com/material-ui/experimental-api/css-theme-variables/usage/#typescript
import type {} from '@mui/material/themeCssVarsAugmentation';

// Create a theme instance.
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#232f3e',
        },
        secondary: {
          main: '#ff9900',
        },
        background: {
          default: '#f2f3f3',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#f2f3f3',
        },
        secondary: {
          main: '#ff9900',
        },
        background: {
          default: '#232f3e',
          paper: '#2f3e4e',
        },
      },
    },
  },
  typography: {
    allVariants: {
      fontFamily: '"Amazon Ember", sans-serif',
    },
  },
  shape: {
    borderRadius: 2,
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
    MuiCardHeader: {
      styleOverrides: {
        content: {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        },
        title: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
    },
  },
});

export default theme;
