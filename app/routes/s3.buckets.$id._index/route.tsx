import { useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { HTMLFormMethod } from '@remix-run/router';
import {
  useParams,
  useLoaderData,
  Link as RemixLink,
  useRevalidator,
  Form,
  useSubmit,
  FormEncType,
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
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import useFuzzySearch from '~/src/hooks/useFuzzySearch';
import { formatDateTime, highlightMatches, prettifySize } from '~/src/utils';
import CurrentPath from '~/src/components/CurrentPath';
import { setupAwsClients } from '~/src/aws/server';
import { s3StorageClassToNameMap } from '~/src/aws/common';

const SearchField = styled(TextField)({
  'input[type="search"]::-webkit-search-cancel-button': {
    display: 'none',
  },
});

const DropOverlay = styled('div')(({ theme, hidden }) => ({
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1,
  opacity: 0.8,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: hidden ? 'none' : 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

const DroppableForm = styled(Form)<{ $isDragActive?: boolean }>({
  height: '100%',
  position: 'relative',
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: params.id,
      Prefix: searchParams.get('prefix') ?? undefined,
      Delimiter: '/',
    }),
  );
  return json({ objects: response.Contents ?? [] });
}

export default function BucketDetails() {
  const { id } = useParams();
  const { objects } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const { results: searchResults } = useFuzzySearch(search, objects, {
    keys: ['Key'],
    includeMatches: true,
  });
  const { revalidate } = useRevalidator();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop: (acceptedFiles, _rejectedFiles, event) => {
      if (!formRef.current) {
        return;
      }
      // The file input value is read-only, so we need to create a new FormData
      // object and append the files to it.
      event.preventDefault();
      const formData = new FormData(formRef.current);
      formData.delete('files');
      acceptedFiles.forEach(file => formData.append('files', file));
      submit(formData, {
        method: formRef.current.getAttribute('method') as HTMLFormMethod,
        action: formRef.current.getAttribute('action') as string,
        encType: formRef.current.getAttribute('enctype') as FormEncType,
      });
    },
  });

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
            Objects ({objects.length})
          </Typography>
          <Stack direction="row" gap={1}>
            <Button onClick={revalidate}>
              <RefreshIcon />
            </Button>
            <Button
              component={RemixLink}
              to="create-folder"
              disabled={selectedObjects.length < 1}
            >
              Create folder
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RemixLink}
              to="upload"
              startIcon={<UploadIcon />}
            >
              Upload
            </Button>
          </Stack>
        </Stack>
        <div>
          <SearchField
            type="search"
            label="Search objects"
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
      <DroppableForm
        method="POST"
        action={`/s3/buckets/${id}/upload`}
        encType="multipart/form-data"
        ref={formRef}
      >
        <DropOverlay hidden={!isDragActive}>
          <UploadIcon fontSize="large" />
          <Typography>Drop files here to upload them</Typography>
        </DropOverlay>
        <input {...getInputProps({ name: 'files' })} />
        <DataGrid
          rowSelectionModel={selectedObjects}
          onRowSelectionModelChange={newSelection =>
            setSelectedObjects(newSelection as string[])
          }
          slotProps={{
            row: getRootProps(),
            noRowsOverlay: getRootProps(),
          }}
          rows={searchResults}
          columns={[
            {
              field: 'name',
              headerName: 'Name',
              renderCell: params => (
                <Link
                  to={params.row.item.Key ?? ''}
                  color="secondary"
                  component={RemixLink}
                >
                  {highlightMatches(
                    params.row.item.Key ?? '',
                    params.row.matches?.[0]?.indices,
                  )}
                </Link>
              ),
              sortable: !search,
              flex: 1,
            },
            {
              field: 'type',
              headerName: 'Type',
              valueGetter: params =>
                params.row.item.Key?.endsWith('/') ? 'Folder' : 'File',
              sortable: !search,
              flex: 1,
            },
            {
              field: 'lastModified',
              headerName: 'Last modified',
              renderCell: params => (
                <time dateTime={params.row.item.LastModified}>
                  {formatDateTime(params.row.item.LastModified)}
                </time>
              ),
              sortable: !search,
              flex: 1,
            },
            {
              field: 'size',
              headerName: 'Size',
              valueGetter: params => prettifySize(params.row.item.Size),
              sortable: !search,
              flex: 1,
            },
            {
              field: 'storageClass',
              headerName: 'Storage class',
              valueGetter: params =>
                params.row.item.StorageClass
                  ? s3StorageClassToNameMap[params.row.item.StorageClass]
                  : '-',
              sortable: !search,
              flex: 1,
            },
          ]}
          getRowId={row => row.item.Key ?? ''}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </DroppableForm>
    </>
  );
}
