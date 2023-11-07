import { useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import {
  S3Client,
  ListObjectsV2Command,
  CommonPrefix,
  _Object,
} from '@aws-sdk/client-s3';
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
  Box,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import useFuzzySearch from '~/src/hooks/useFuzzySearch';
import {
  base64UrlDecode,
  base64UrlEncode,
  formatDateTime,
  highlightMatches,
  prettifySize,
} from '~/src/utils';
import CurrentPath from '~/src/components/CurrentPath';
import { setupAwsClients } from '~/src/aws/server';
import { s3StorageClassToNameMap } from '~/src/aws/common';
import TableOverlay from '~/src/components/TableOverlay';
import PreviewSidebar from './preview/PreviewSidebar';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import CreateFolderDialog from './CreateFolderDialog';

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
  backgroundColor: theme.vars.palette.background.default,
}));

const DroppableForm = styled(Form)<{ $isDragActive?: boolean }>({
  height: '100%',
  position: 'relative',
});

export async function loader({ params }: LoaderFunctionArgs) {
  const key = params.key ? base64UrlDecode(params.key) : undefined;
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const prefix = key?.slice(0, key?.lastIndexOf('/') + 1);
  const listObjectsResponse = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: params.id,
      Prefix: prefix,
      Delimiter: '/',
    }),
  );
  // AWS simulates folders by creating empty objects that end with a slash,
  // so we do the same and consider them folders instead of objects
  const folders: CommonPrefix[] = [
    ...(listObjectsResponse.CommonPrefixes ?? []),
    ...(listObjectsResponse.Contents?.filter(
      obj => obj.Key?.endsWith('/') && obj.Key !== prefix,
    ).map<CommonPrefix>(obj => ({ Prefix: obj.Key })) ?? []),
  ];
  const objects: _Object[] =
    listObjectsResponse.Contents?.filter(obj => !obj.Key?.endsWith('/')) ?? [];
  const enrichedResponse = {
    ...listObjectsResponse,
    CommonPrefixes: folders.map(commonPrefix => ({
      ...commonPrefix,
      BucketName: params.id,
      DirName: prefix,
      BaseName: commonPrefix.Prefix?.replace(prefix ?? '', ''),
    })),
    Contents: objects.map(obj => ({
      ...obj,
      BucketName: params.id,
      DirName: prefix,
      BaseName: obj.Key?.replace(prefix ?? '', ''),
    })),
  };
  return json({
    directories: enrichedResponse.CommonPrefixes,
    objects: enrichedResponse.Contents,
    selectedObject:
      !!key && !key.endsWith('/')
        ? enrichedResponse.Contents.find(obj => obj.Key === key)
        : undefined,
  });
}

export default function BucketDetails() {
  const { id, key: rawKey } = useParams();
  const mergedSegments = rawKey ? base64UrlDecode(rawKey) : undefined;
  const segments = mergedSegments?.split('/').filter(Boolean) ?? [];
  const { directories, objects, selectedObject } =
    useLoaderData<typeof loader>();
  const decodedBaseDir = selectedObject?.DirName ?? mergedSegments ?? '';
  const mergedContent = useMemo<
    ((typeof directories)[number] & (typeof objects)[number])[]
  >(() => [...directories, ...objects], [directories, objects]);
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedObjects = searchParams.get('selection')?.split(',') ?? [];
  const search = searchParams.get('search') ?? '';
  const { results: searchResults } = useFuzzySearch(search, mergedContent, {
    keys: ['BaseName'],
    includeMatches: true,
  });
  const { withSearchParam } = useLinkUtils();
  const { revalidate } = useRevalidator();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop: (
      acceptedFiles: (File & { path?: string })[],
      _rejectedFiles,
      event,
    ) => {
      if (!formRef.current) {
        return;
      }
      // The file input value is read-only, so we need to create a new FormData
      // object and append the files and their paths to it.
      event.preventDefault();
      const formData = new FormData(formRef.current);
      formData.delete('files');
      acceptedFiles.forEach(file => {
        formData.append('paths', file.path ?? file.name);
        formData.append('files', file);
      });
      submit(formData, {
        method: formRef.current.getAttribute('method') as HTMLFormMethod,
        action: formRef.current.getAttribute('action') as string,
        encType: formRef.current.getAttribute('enctype') as FormEncType,
      });
    },
  });

  return (
    <>
      <CurrentPath
        items={[
          's3',
          'buckets',
          {
            key: id!,
            name: id!,
          },
          ...segments.map(segment => ({
            key: segment,
            name: segment,
            to: `/s3/buckets/${id}/${base64UrlEncode(
              mergedSegments?.slice(
                0,
                mergedSegments?.indexOf(segment) + segment.length + 1,
              ) ?? '',
            )}`,
          })),
        ]}
      />
      <Stack p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Objects ({mergedContent.length})
          </Typography>
          <Stack direction="row" gap={1}>
            <Button onClick={revalidate}>
              <RefreshIcon />
            </Button>
            <Button
              component={RemixLink}
              to={withSearchParam('create-folder', '')}
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
      <Box position="relative" height="calc(100vh - 270px)">
        <DroppableForm
          method="POST"
          action={`/s3/buckets/${id}/upload?prefix=${decodedBaseDir}`}
          encType="multipart/form-data"
          ref={formRef}
        >
          <DropOverlay hidden={!isDragActive}>
            <UploadIcon fontSize="large" />
            <Typography>Drop files here to upload them</Typography>
          </DropOverlay>
          <input type="hidden" name="baseDir" value={decodedBaseDir} />
          <input type="hidden" name="paths" />
          <input {...getInputProps({ name: 'files' })} />
          <DataGrid
            rowSelectionModel={selectedObjects}
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
                    to={`/s3/buckets/${id}/${base64UrlEncode(
                      params.row.item.Key ?? params.row.item.Prefix ?? '',
                    )}`}
                    color="secondary"
                    component={RemixLink}
                  >
                    {highlightMatches(
                      params.row.item.BaseName ?? '',
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
                  params.row.item.Key ? 'File' : 'Folder',
                sortable: !search,
                width: 100,
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
                width: 300,
              },
              {
                field: 'size',
                headerName: 'Size',
                valueGetter: params => prettifySize(params.row.item.Size),
                sortable: !search,
                width: 100,
              },
              {
                field: 'storageClass',
                headerName: 'Storage class',
                valueGetter: params =>
                  params.row.item.StorageClass
                    ? s3StorageClassToNameMap[params.row.item.StorageClass]
                    : '-',
                sortable: !search,
                width: 150,
              },
            ]}
            getRowId={row => row.item.Key ?? row.item.Prefix ?? ''}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ noRowsOverlay: TableOverlay }}
            slotProps={{
              row: getRootProps(),
              noRowsOverlay: getRootProps({
                children: 'No objects available.',
              }),
            }}
          />
        </DroppableForm>
        <CreateFolderDialog
          open={searchParams.has('create-folder')}
          bucketName={id!}
          prefix={decodedBaseDir}
        />
        {selectedObject && (
          <PreviewSidebar
            object={selectedObject}
            encodedKey={rawKey!}
            prefix={decodedBaseDir}
          />
        )}
      </Box>
    </>
  );
}
