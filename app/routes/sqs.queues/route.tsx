import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ListQueuesCommand } from '@aws-sdk/client-sqs';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  Link as RemixLink,
  useRevalidator,
  useSearchParams,
  Outlet,
} from '@remix-run/react';
import {
  Typography,
  Button,
  TextField,
  Link,
  Stack,
  IconButton,
  styled,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import DataGrid from '~/src/components/DataGrid';
import useFuzzySearch from '~/src/hooks/useFuzzySearch';
import { highlightMatches, ignoreSearchChanges } from '~/src/utils';
import CurrentPath from '~/src/components/CurrentPath';
import { getAwsClient } from '~/src/aws/server';
import CreateQueueDialog from './CreateQueueDialog';
import DeleteQueuesDialog from './DeleteQueuesDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import TableOverlay from '~/src/components/TableOverlay';
import { computeTitle } from '~/src/utils';
import { useServerTranslation } from '~/i18next.server';
import { createQueueAction, deleteQueuesAction } from './actions';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sqsClient = getAwsClient('sqs');
  const [{ t }, response] = await Promise.all([
    useServerTranslation(request),
    sqsClient.send(new ListQueuesCommand({})),
  ]);
  return json({
    meta: { titleParts: [t('queues')] },
    queues:
      response.QueueUrls?.map(QueueUrl => ({
        QueueName: QueueUrl.slice(QueueUrl.lastIndexOf('/') + 1),
        QueueUrl,
      })) ?? [],
  });
};

export const shouldRevalidate = ignoreSearchChanges;

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  computeTitle('SQS', ...(data?.meta.titleParts || [])),
];

export const action = (args: ActionFunctionArgs) => {
  switch (args.request.method) {
    case 'POST':
      return createQueueAction(args);
    case 'DELETE':
      return deleteQueuesAction(args);
  }
  throw redirect('/sqs/queues');
};

const SearchField = styled(TextField)({
  'input[type="search"]::-webkit-search-cancel-button': {
    display: 'none',
  },
});

const QueuesList: FunctionComponent = () => {
  const { t } = useTranslation();
  const { queues } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const { withSearchParam, withPathname } = useLinkUtils();
  const selectedQueues = searchParams.get('selection')?.split(',') ?? [];
  const search = searchParams.get('search') ?? '';
  const { results: searchResults } = useFuzzySearch(search, queues, {
    keys: ['QueueName'],
    includeMatches: true,
  });

  useEffect(() => {
    if (selectedQueues.length > 0) {
      return;
    }
    setSearchParams(currentParams => {
      currentParams.delete('delete');
      currentParams.delete('empty');
      return currentParams;
    });
  }, [selectedQueues.length, setSearchParams]);

  return (
    <>
      {/* t('queues') */}
      <CurrentPath items={['sqs', 'queues']} />
      <Stack p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" component="h2" gutterBottom>
            {t('queues')} ({queues.length})
          </Typography>
          <Stack direction="row" gap={1}>
            <Button onClick={revalidate}>
              <RefreshIcon />
            </Button>
            <Button
              component={RemixLink}
              to={withSearchParam('delete', '')}
              disabled={selectedQueues.length < 1}
            >
              {t('delete')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RemixLink}
              to={withSearchParam('create', '')}
            >
              {t('createQueue')}
            </Button>
          </Stack>
        </Stack>
        <div>
          <SearchField
            type="search"
            label={t('searchQueues')}
            variant="outlined"
            value={search}
            onChange={event =>
              setSearchParams(previousParams => {
                if (event.target.value) {
                  previousParams.set('search', event.target.value);
                } else {
                  previousParams.delete('search');
                }
                return previousParams;
              })
            }
            InputProps={{
              endAdornment: search && (
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() =>
                    setSearchParams(previousParams => {
                      previousParams.delete('search');
                      return previousParams;
                    })
                  }
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
            sx={{ width: '30ch' }}
          />
        </div>
      </Stack>
      <DataGrid
        rowSelectionModel={selectedQueues}
        onRowSelectionModelChange={newSelection =>
          setSearchParams(previousParams => {
            if (newSelection.length < 1) {
              previousParams.delete('selection');
            } else {
              previousParams.set('selection', newSelection.join(','));
            }
            return previousParams;
          })
        }
        rows={searchResults}
        columns={[
          {
            field: 'name',
            headerName: t('name'),
            renderCell: params => (
              <Link
                to={withPathname(`/sqs/queues/${params.row.item.QueueName}`)}
                color="secondary"
                component={RemixLink}
                unstable_viewTransition
              >
                {highlightMatches(
                  params.row.item.QueueName,
                  params.row.matches?.[0]?.indices,
                )}
              </Link>
            ),
            sortable: !search,
            flex: 1,
          },
        ]}
        getRowId={row => row.item.QueueUrl}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ height: 'calc(100vh - 270px)' }}
        slots={{ noRowsOverlay: TableOverlay }}
        slotProps={{
          noRowsOverlay: {
            children: t('noQueuesAvailable'),
          },
        }}
      />
      <CreateQueueDialog
        open={searchParams.has('create')}
        existingQueues={queues}
      />
      <DeleteQueuesDialog
        open={searchParams.has('delete') && queues.length > 0}
        queues={selectedQueues}
      />
      <Outlet />
    </>
  );
};

export default QueuesList;
