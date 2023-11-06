import { FunctionComponent } from 'react';
import { Box, BoxProps, styled } from '@mui/material';

export interface AwsIconContainerProps extends BoxProps {
  service: string;
}

const serviceToColorLightThemeMap: Record<string, string> = {
  s3: '#1B660F',
  dynamodb: '#2E27AD',
};

const serviceToColorDarkThemeMap: Record<string, string> = {
  s3: '#6CAE3E',
  dynamodb: '#527FFF',
};

const AwsIconContainer = styled(Box)<AwsIconContainerProps>(
  ({ service, theme }) => ({
    minWidth: 64,
    minHeight: 64,
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: serviceToColorLightThemeMap[service],
    [theme.getColorSchemeSelector('dark')]: {
      backgroundColor: serviceToColorDarkThemeMap[service],
    },
  }),
);

export default AwsIconContainer;
