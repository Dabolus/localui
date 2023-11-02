import { useState } from 'react';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { json } from '@remix-run/node';
import {
  useLoaderData,
  Link as RemixLink,
  useRevalidator,
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
import { setupAwsClients } from '~/src/aws';

const SearchField = styled(TextField)({
  'input[type="search"]::-webkit-search-cancel-button': {
    display: 'none',
  },
});

export async function loader() {
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const response = await s3Client.send(new ListBucketsCommand({}));
  return json({ buckets: response.Buckets ?? [] });
}

export default function BucketsList() {
  const { buckets } = useLoaderData<typeof loader>();
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const { results: searchResults } = useFuzzySearch(search, buckets, {
    keys: ['Name'],
    includeMatches: true,
  });
  const { revalidate } = useRevalidator();

  return (
    <>
      <CurrentPath />
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
              to="/s3/buckets/empty"
              disabled={selectedBuckets.length < 1}
            >
              Empty
            </Button>
            <Button
              component={RemixLink}
              to="/s3/buckets/delete"
              disabled={selectedBuckets.length < 1}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RemixLink}
              to="/s3/buckets/create"
            >
              Create bucket
            </Button>
          </Stack>
        </Stack>
        <div>
          <SearchField
            type="search"
            label="Search buckets"
            variant="outlined"
            value={search}
            onChange={event => setSearch(event.target.value)}
            InputProps={{
              endAdornment: search && (
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => setSearch('')}
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
          setSelectedBuckets(newSelection as string[])
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
      />
    </>
  );
}
