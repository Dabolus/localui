import { FunctionComponent } from 'react';
import { LinearProgress, LinearProgressProps, styled } from '@mui/material';

export type CenteredLoaderProps = LinearProgressProps;

const Container = styled('div')({
  position: 'absolute',
  top: 'calc(50% - 2px)',
  left: '20%',
  width: '60%',
  height: '4px',
});

const CenteredLoader: FunctionComponent<CenteredLoaderProps> = props => (
  <Container>
    <LinearProgress color="secondary" {...props} />
  </Container>
);

export default CenteredLoader;
