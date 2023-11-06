import { FunctionComponent } from 'react';
import { SvgIconProps } from '@mui/material';
import S3Icon from './S3Icon';
import DynamoDBIcon from './DynamoDBIcon';
import SQSIcon from './SQSIcon';

export interface AwsIconProps extends SvgIconProps {
  service: string;
}

const serviceToIconMap: Record<string, FunctionComponent<SvgIconProps>> = {
  s3: S3Icon,
  dynamodb: DynamoDBIcon,
  sqs: SQSIcon,
};

const AwsIcon: FunctionComponent<AwsIconProps> = ({ service, ...props }) => {
  const Icon = serviceToIconMap[service];
  return <Icon {...props} />;
};

export default AwsIcon;
