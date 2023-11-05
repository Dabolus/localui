import { FunctionComponent, ReactNode, Suspense, SuspenseProps } from 'react';
import CenteredLoader from './CenteredLoader';

export interface PlaceholderProps extends Omit<SuspenseProps, 'fallback'> {
  fallback?: ReactNode;
}

const Placeholder: FunctionComponent<PlaceholderProps> = ({
  fallback = <CenteredLoader />,
  ...props
}) => <Suspense fallback={fallback} {...props} />;

export default Placeholder;
