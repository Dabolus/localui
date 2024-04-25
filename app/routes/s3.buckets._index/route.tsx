import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import DataGrid, { GridColDef } from '~/src/components/DataGrid';
import useFuzzySearch from '~/src/hooks/useFuzzySearch';
import {
  computeTitle,
  formatDateTime,
  highlightMatches,
  ignoreSearchChanges,
} from '~/src/utils';
import CurrentPath from '~/src/components/CurrentPath';
import { getAwsClientsGroup } from '~/src/aws/server';
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
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useServerTranslation } from '~/i18next.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const s3Clients = getAwsClientsGroup('s3');
  const [{ t }, ...responses] = await Promise.all([
    useServerTranslation(request),
    ...Array.from(s3Clients.entries(), ([url, s3Client]) =>
      s3Client.send(new ListBucketsCommand({})).then(
        response =>
          response.Buckets?.map(bucket => ({
            ...bucket,
            EndpointUrl: url,
          })) ?? [],
      ),
    ),
  ]);
  return json({
    meta: { titleParts: [t('buckets')] },
    buckets: responses.flat(),
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  computeTitle('S3', ...(data?.meta.titleParts || [])),
];

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

export const shouldRevalidate = ignoreSearchChanges;

const SearchField = styled(TextField)({
  'input[type="search"]::-webkit-search-cancel-button': {
    display: 'none',
  },
});

const BucketsList: FunctionComponent = () => {
  const { t } = useTranslation();
  const { buckets } = useLoaderData<typeof loader>();
  const hasMultipleEndpoints =
    new Set(buckets.map(bucket => bucket.EndpointUrl)).size > 1;
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
      {/* t('buckets') */}
      <CurrentPath items={['s3', 'buckets']} />
      <Stack p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" component="h2" gutterBottom>
            {t('buckets')} ({buckets.length})
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
              {t('empty')}
            </Button>
            <Button
              component={RemixLink}
              to={withSearchParam('delete', '')}
              disabled={selectedBuckets.length < 1}
            >
              {t('delete')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RemixLink}
              to={withSearchParam('create', '')}
            >
              {t('createBuckets')}
            </Button>
          </Stack>
        </Stack>
        <div>
          <SearchField
            type="search"
            label={t('searchBuckets')}
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
            headerName: t('name'),
            renderCell: params => (
              <Link
                to={withSearchParam(
                  'endpoint',
                  (hasMultipleEndpoints && params.row.item.EndpointUrl) || null,
                  `/s3/buckets/${params.row.item.Name}`,
                )}
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
            headerName: t('creationDate'),
            renderCell: params => (
              <time dateTime={params.row.item.CreationDate}>
                {formatDateTime(params.row.item.CreationDate)}
              </time>
            ),
            sortable: !search,
            flex: 1,
          },
          ...(hasMultipleEndpoints
            ? [
                {
                  field: 'endpointUrl',
                  headerName: t('endpoint'),
                  renderCell: params => (
                    <Link component={Typography}>
                      {params.row.item.EndpointUrl}
                    </Link>
                  ),
                  sortable: !search,
                  flex: 1,
                } as GridColDef<(typeof searchResults)[number]>,
              ]
            : []),
        ]}
        getRowId={row => row.item.Name ?? ''}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ height: 'calc(100vh - 270px)' }}
        slots={{ noRowsOverlay: TableOverlay }}
        slotProps={{
          noRowsOverlay: {
            children: t('noBucketsAvailable'),
          },
        }}
      />
      <CreateBucketsDialog open={searchParams.has('create')} />
      <EmptyBucketsDialog
        open={searchParams.has('empty') && selectedBuckets.length > 0}
        buckets={selectedBuckets}
      />
      <DeleteBucketsDialog
        open={searchParams.has('delete') && selectedBuckets.length > 0}
        buckets={selectedBuckets}
      />
    </>
  );
};

export default BucketsList;
