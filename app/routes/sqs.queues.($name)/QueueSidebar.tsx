import { FunctionComponent, useState } from 'react';
import {
  Form,
  Link as RemixLink,
  useFetcher,
  useParams,
  useSearchParams,
} from '@remix-run/react';
import type { Jsonify } from '@remix-run/server-runtime/dist/jsonify';
import {
  Button,
  Stack,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  styled,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import Placeholder from '~/src/components/Placeholder';
import useInterval from '~/src/hooks/useInterval';
import { SerializeFrom } from '@remix-run/server-runtime';
import type { loader as queueDetailsLoader } from '../sqs.queues.$name.details/route';
import { Message } from '@aws-sdk/client-sqs';

export interface Queue {
  Name: string;
  Url: string;
}

export interface QueueSidebarProps {
  queue: Jsonify<Queue>;
}

const InlinePreviewContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  maxHeight: 360,
});

const QueueSidebar: FunctionComponent<QueueSidebarProps> = ({ queue }) => {
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const { name } = useParams();
  const { withSearchParam } = useLinkUtils();
  const [isPolling, setIsPolling] = useState(false);
  const [messages, setMessages] = useState<Jsonify<Message>[]>([]);

  useInterval(
    () => {
      fetch(`/sqs/queues/${name}/details`)
        .then(res => res.json())
        .then((data: SerializeFrom<typeof queueDetailsLoader>) => {
          setMessages(prev => [
            ...prev,
            ...data.messages.filter(
              message =>
                !prev.some(
                  prevMessage => prevMessage.MessageId === message.MessageId,
                ),
            ),
          ]);
        });
    },
    isPolling ? 2500 : null,
  );

  return (
    <Card
      component={Stack}
      position="absolute"
      zIndex={1}
      top={0}
      right={0}
      width={420}
      // width="100%"
      maxWidth="100%"
      height="100%"
      p={2}
    >
      <CardHeader
        title={queue.Name}
        action={
          <IconButton LinkComponent={RemixLink} {...{ to: '/sqs/queues' }}>
            <CloseIcon />
          </IconButton>
        }
      />
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" gap={1}>
          <Button onClick={() => setIsPolling(prev => !prev)}>
            {isPolling ? 'Stop polling' : 'Start polling'}
          </Button>
          <Button
            variant="contained"
            color="error"
            component={RemixLink}
            to={withSearchParam('delete', '')}
          >
            Delete
          </Button>
        </Stack>
        <fetcher.Form method="POST" action={`/sqs/queues/${name}`}>
          <input type="hidden" name="queueUrl" value={queue.Url} />
          <Stack alignItems="flex-start" gap={1} py={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              name="message"
              label="Message"
              inputProps={{
                style: { fontFamily: "'Amazon Ember Mono', monospace" },
              }}
            />
            <Button type="submit">Send</Button>
          </Stack>
        </fetcher.Form>
        <Box overflow="auto" mb={6}>
          {messages.map(message => (
            <Accordion key={message.MessageId}>
              <AccordionSummary>{message.MessageId}</AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  component="pre"
                  fontFamily="'Amazon Ember Mono', monospace"
                >
                  {message.Body}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QueueSidebar;
