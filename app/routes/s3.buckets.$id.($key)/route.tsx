import { useMemo, useRef, useState } from 'react';
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
  Card,
  CardHeader,
  unstable_useEnhancedEffect as useEnhancedEffect,
  CardContent,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
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
import PreviewElement, { PreviewElementProps } from './preview/PreviewElement';
import PreviewDialog from './preview/PreviewDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import TableOverlay from '~/src/components/TableOverlay';

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

const InlinePreviewElement = styled(PreviewElement)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const InlinePreviewContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  maxHeight: 360,
});

const FullScreenPreviewButton = styled(IconButton)(({ theme }) => ({
  zIndex: 1,
  position: 'absolute',
  top: theme.spacing(3),
  right: theme.spacing(1),
  backgroundColor: theme.vars.palette.background.paper,

  '&:hover': {
    backgroundColor: theme.vars.palette.background.default,
  },
})) as typeof IconButton;

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
  const enrichedResponse = {
    ...listObjectsResponse,
    CommonPrefixes: listObjectsResponse.CommonPrefixes?.map(commonPrefix => ({
      ...commonPrefix,
      DirName: prefix,
      BaseName: commonPrefix.Prefix?.replace(prefix ?? '', ''),
    })),
    Contents: listObjectsResponse.Contents?.map(obj => ({
      ...obj,
      DirName: prefix,
      BaseName: obj.Key?.replace(prefix ?? '', ''),
    })),
  };
  return json({
    directories: enrichedResponse.CommonPrefixes ?? [],
    objects: enrichedResponse.Contents ?? [],
    selectedObject:
      !!key && !key.endsWith('/')
        ? enrichedResponse.Contents?.find(obj => obj.Key === key)
        : undefined,
  });
}

export default function BucketDetails() {
  const { id, key: rawKey } = useParams();
  const mergedSegments = rawKey ? base64UrlDecode(rawKey) : undefined;
  const segments = mergedSegments?.split('/').filter(Boolean) ?? [];
  const { directories, objects, selectedObject } =
    useLoaderData<typeof loader>();
  const mergedContent = useMemo<
    ((typeof directories)[number] & (typeof objects)[number])[]
  >(() => [...directories, ...objects], [directories, objects]);
  const submit = useSubmit();
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const { results: searchResults } = useFuzzySearch(search, mergedContent, {
    keys: ['BaseName'],
    includeMatches: true,
  });
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
  const [searchParams] = useSearchParams();
  const { withSearchParams } = useLinkUtils();
  const [previewElementProps, setPreviewElementProps] = useState<
    PreviewElementProps | undefined
  >(undefined);

  useEnhancedEffect(() => {
    setPreviewElementProps(undefined);
    if (!selectedObject?.Key) {
      return;
    }
    let cancelled = false;
    let url: string | undefined;
    fetch(`/s3/buckets/${id}/${rawKey}/download?preview`).then(async res => {
      const blob = await res.blob();
      const contentType = res.headers.get('Content-Type')!;
      if (cancelled) {
        return;
      }
      url = URL.createObjectURL(blob);
      const key = base64UrlDecode(rawKey!);
      setPreviewElementProps({ contentType, name: key, src: url });
    });

    return () => {
      cancelled = true;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedObject?.Key, id, rawKey]);

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
            <Button component={RemixLink} to="create-folder">
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
      <Box position="relative" height="calc(100vh - 270px)">
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
          <input type="hidden" name="paths" />
          <input {...getInputProps({ name: 'files' })} />
          <DataGrid
            rowSelectionModel={selectedObjects}
            onRowSelectionModelChange={newSelection =>
              setSelectedObjects(newSelection as string[])
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
        {selectedObject && (
          <Card
            component={Stack}
            position="absolute"
            top={0}
            right={0}
            width={420}
            maxWidth="100%"
            height="100%"
            p={2}
          >
            <CardHeader
              title={selectedObject.BaseName}
              action={
                <IconButton
                  LinkComponent={RemixLink}
                  {...{ to: `/s3/buckets/${id}` }}
                >
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ height: '100%' }}>
              <Stack direction="row" gap={1}>
                <Button
                  variant="contained"
                  color="secondary"
                  component="a"
                  href={`/s3/buckets/${id}/${rawKey}/download`}
                  download={selectedObject.BaseName}
                  startIcon={<DownloadIcon />}
                >
                  Download
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  component={RemixLink}
                  to={`/s3/buckets/${id}/${rawKey}/delete`}
                >
                  Delete
                </Button>
              </Stack>
              {previewElementProps && (
                <InlinePreviewContainer>
                  <FullScreenPreviewButton
                    aria-label="Open full screen preview"
                    component={RemixLink}
                    to={withSearchParams(
                      `/s3/buckets/${id}/${rawKey}`,
                      previousParams => {
                        previousParams.set('preview', '');
                        return previousParams;
                      },
                    )}
                  >
                    <FullscreenIcon />
                  </FullScreenPreviewButton>
                  <InlinePreviewElement {...previewElementProps} />
                  <PreviewDialog
                    open={searchParams.has('preview')}
                    closeLink={withSearchParams(
                      `/s3/buckets/${id}/${rawKey}`,
                      previousParams => {
                        previousParams.delete('preview');
                        return previousParams;
                      },
                    )}
                    {...previewElementProps}
                  />
                </InlinePreviewContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
}
