import { createTheme } from '@mui/material/styles';
import './fonts/styles.css';

// Create a theme instance.
const theme = createTheme({
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
});

export default theme;
