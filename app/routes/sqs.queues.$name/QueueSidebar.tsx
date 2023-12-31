import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link as RemixLink,
  useFetcher,
  useParams,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react';
import {
  Button,
  Stack,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import useInterval from '~/src/hooks/useInterval';
import type { SerializeFrom } from '@remix-run/server-runtime';
import type { loader } from './route';
import Sidebar from '~/src/components/Sidebar';
import { joinNodes } from '~/src/utils';

export interface QueueSidebarProps {
  queue: SerializeFrom<typeof loader>;
}

const QueueSidebar: FunctionComponent<QueueSidebarProps> = ({ queue }) => {
  const { t } = useTranslation();
  const { name } = useParams();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const [searchParams] = useSearchParams();
  const { withSearchParam, withPathname } = useLinkUtils();
  const isPolling = searchParams.getAll('include').includes('messages');
  const isFullscreen = searchParams.has('fullscreen');

  useInterval(() => revalidate(), isPolling ? 2500 : null);

  return (
    <Sidebar
      title={queue.QueueName}
      subheader={
        <Stack direction="row" py={1} gap={0.5}>
          {queue.Attributes?.FifoQueue === 'true' && (
            <Tooltip title={t('firstInFirstOut')}>
              <Chip size="small" label="FIFO" />
            </Tooltip>
          )}
          {queue.Attributes?.ContentBasedDeduplication === 'true' && (
            <Tooltip title={t('contentBasedDeduplication')}>
              <Chip size="small" label="CBD" />
            </Tooltip>
          )}
          {queue.Attributes?.SqsManagedSseEnabled === 'true' && (
            <Tooltip title={t('sqsManagedSse')}>
              <Chip size="small" label="SSE" />
            </Tooltip>
          )}
          {queue.DeadLetterSourceQueues &&
            queue.DeadLetterSourceQueues.length > 0 && (
              <Tooltip
                title={
                  <>
                    {t('dlqOf')}
                    {': '}
                    {joinNodes(
                      queue.DeadLetterSourceQueues.map(queue => (
                        <strong key={queue.QueueUrl}>{queue.QueueName}</strong>
                      )),
                      ', ',
                    )}
                  </>
                }
              >
                <Chip size="small" label="DLQ" />
              </Tooltip>
            )}
        </Stack>
      }
      isFullscreen={isFullscreen}
      fullscreenLink={withSearchParam('fullscreen', isFullscreen ? null : '')}
      closeLink={withPathname('/sqs/queues')}
    >
      <Stack direction="row" gap={1}>
        <Button
          component={RemixLink}
          to={withSearchParam('include', isPolling ? null : 'messages')}
        >
          {isPolling ? t('stopPolling') : t('startPolling')}
        </Button>
        <Button
          variant="contained"
          color="error"
          component={RemixLink}
          to={withSearchParam('delete', '')}
        >
          {t('delete')}
        </Button>
      </Stack>
      <fetcher.Form method="POST" action={`/sqs/queues/${name}`}>
        <input type="hidden" name="queueUrl" value={queue.QueueUrl} />
        <Stack alignItems="flex-start" gap={1} py={2}>
          <TextField
            required
            fullWidth
            multiline
            rows={3}
            name="message"
            label={t('message')}
            inputProps={{
              style: { fontFamily: "'Amazon Ember Mono', monospace" },
            }}
          />
          <Button type="submit">{t('send')}</Button>
        </Stack>
      </fetcher.Form>
      <Box overflow="auto" mb={6}>
        {queue.Messages?.map(message => (
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
    </Sidebar>
  );
};

export default QueueSidebar;
