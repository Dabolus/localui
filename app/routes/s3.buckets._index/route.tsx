import { FunctionComponent, useEffect } from 'react';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  Link as RemixLink,
  useRevalidator,
  useSearchParams,
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
import { DataGrid } from '@mui/x-data-grid';
import useFuzzySearch from '~/src/hooks/useFuzzySearch';
import { formatDateTime, highlightMatches } from '~/src/utils';
import CurrentPath from '~/src/components/CurrentPath';
import { getAwsClient } from '~/src/aws/server';
import CreateBucketsDialog from './CreateBucketsDialog';
import EmptyBucketsDialog from './EmptyBucketsDialog';
import DeleteBucketsDialog from './DeleteBucketsDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import TableOverlay from '~/src/components/TableOverlay';
import {
  createBucketsAction,
  emptyBucketsAction,
  deleteBucketsAction,
} from './actions';

export const loader = async () => {
  const s3Client = getAwsClient('s3');
  const response = await s3Client.send(new ListBucketsCommand({}));
  return json({ buckets: response.Buckets ?? [] });
};

export const action = (args: ActionFunctionArgs) => {
  switch (args.request.method) {
    case 'POST':
      return createBucketsAction(args);
    case 'PUT':
      return emptyBucketsAction(args);
    case 'DELETE':
      return deleteBucketsAction(args);
  }
  throw redirect('/s3/buckets');
};

const SearchField = styled(TextField)({
  'input[type="search"]::-webkit-search-cancel-button': {
    display: 'none',
  },
});

const BucketsList: FunctionComponent = () => {
  const { buckets } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const { withSearchParam } = useLinkUtils();
  const selectedBuckets = searchParams.get('selection')?.split(',') ?? [];
  const search = searchParams.get('search') ?? '';
  const { results: searchResults } = useFuzzySearch(search, buckets, {
    keys: ['Name'],
    includeMatches: true,
  });

  useEffect(() => {
    if (selectedBuckets.length > 0) {
      return;
    }
    setSearchParams(currentParams => {
      currentParams.delete('delete');
      currentParams.delete('empty');
      return currentParams;
    });
  }, [selectedBuckets.length, setSearchParams]);

  return (
    <>
      <CurrentPath items={['s3', 'buckets']} />
      <Stack p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Buckets ({buckets.length})
          </Typography>
          <Stack direction="row" gap={1}>
            <Button onClick={revalidate}>
              <RefreshIcon />
            </Button>
            <Button
              component={RemixLink}
              to={withSearchParam('empty', '')}
              disabled={selectedBuckets.length < 1}
            >
              Empty
            </Button>
            <Button
              component={RemixLink}
              to={withSearchParam('delete', '')}
              disabled={selectedBuckets.length < 1}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RemixLink}
              to={withSearchParam('create', '')}
            >
              Create buckets
            </Button>
          </Stack>
        </Stack>
        <div>
          <SearchField
            type="search"
            label="Search buckets"
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
        rowSelectionModel={selectedBuckets}
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
            headerName: 'Name',
            renderCell: params => (
              <Link
                to={`/s3/buckets/${params.row.item.Name}`}
                color="secondary"
                component={RemixLink}
                unstable_viewTransition
              >
                {highlightMatches(
                  params.row.item.Name ?? '',
                  params.row.matches?.[0]?.indices,
                )}
              </Link>
            ),
            sortable: !search,
            flex: 1,
          },
          {
            field: 'creationDate',
            headerName: 'Creation date',
            renderCell: params => (
              <time dateTime={params.row.item.CreationDate}>
                {formatDateTime(params.row.item.CreationDate)}
              </time>
            ),
            sortable: !search,
            flex: 1,
          },
        ]}
        getRowId={row => row.item.Name ?? ''}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ height: 'calc(100vh - 270px)' }}
        slots={{ noRowsOverlay: TableOverlay }}
        slotProps={{
          noRowsOverlay: {
            children: 'No buckets available.',
          },
        }}
      />
      <CreateBucketsDialog open={searchParams.has('create')} />
      <EmptyBucketsDialog
        open={searchParams.has('empty') && buckets.length > 0}
        buckets={selectedBuckets}
      />
      <DeleteBucketsDialog
        open={searchParams.has('delete') && buckets.length > 0}
        buckets={selectedBuckets}
      />
    </>
  );
};

export default BucketsList;
