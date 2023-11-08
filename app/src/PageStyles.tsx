import { FunctionComponent } from 'react';
import { GlobalStyles } from '@mui/material';

const PageStyles: FunctionComponent = () => (
  <GlobalStyles
    styles={{
      '@keyframes enter-from-right': {
        from: {
          transform: 'translateX(100%)',
        },
        to: {
          transform: 'translateX(0)',
        },
      },
      '@keyframes exit-from-right': {
        from: {
          transform: 'translateX(0)',
        },
        to: {
          transform: 'translateX(100%)',
        },
      },

      '::view-transition-old(sidebar)': {
        animation: '0.2s ease-in both exit-from-right',
      },

      '::view-transition-new(sidebar)': {
        animation: '0.2s ease-out both enter-from-right',
      },
    }}
  />
);

export default PageStyles;
