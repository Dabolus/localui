import { Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import CurrentPath from '~/src/components/CurrentPath';

const QueuesList: FunctionComponent = () => {
  return (
    <>
      <CurrentPath items={['sqs', 'queues']} />
      <Typography>TODO :)</Typography>
    </>
  );
};

export default QueuesList;
