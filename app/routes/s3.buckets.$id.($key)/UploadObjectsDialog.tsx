import { FormEventHandler, FunctionComponent, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { useTranslation } from 'react-i18next';
import { HTMLFormMethod, FormEncType } from '@remix-run/router';
import { useSubmit } from '@remix-run/react';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface UploadObjectsDialogProps {
  open: boolean;
  bucketName: string;
  prefix?: string;
}

export interface FileWithPath extends File {
  path?: string;
}

const DropzoneContainer = styled('div')<{ $isDragActive?: boolean }>(
  ({ theme, $isDragActive }) => ({
    border: `1px dashed ${
      $isDragActive
        ? theme.vars.palette.primary.main
        : theme.vars.palette.divider
    }`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: '1 1 auto',
  }),
);

const NoWrapListItemText = styled(ListItemText)({
  '& > span': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const UploadObjectsDialog: FunctionComponent<UploadObjectsDialogProps> = ({
  open,
  bucketName,
  prefix = '',
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();
  const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
  const submit = useSubmit();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: FileWithPath[]) => {
      setSelectedFiles(previousFiles => [...previousFiles, ...acceptedFiles]);
    },
  });
  const { directories, files } = useMemo(
    () =>
      selectedFiles.reduce<{
        directories: string[];
        files: string[];
      }>(
        (acc, file) => {
          if (!file.path?.startsWith('/')) {
            return { ...acc, files: [...acc.files, file.name] };
          }
          const dirName = file.path.slice(1, file.path.indexOf('/', 1) + 1);
          return {
            ...acc,
            directories: acc.directories.includes(dirName)
              ? acc.directories
              : [...acc.directories, dirName],
          };
        },
        { directories: [], files: [] },
      ),
    [selectedFiles],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    // The file input value is read-only, so we need to create a new FormData
    // object and append the files and their paths to it.
    // Re-adding files and folders in this way, we also make sure that the
    // user provided prefix is sent before them, even if the text field is
    // placed after the dropzone in the DOM.
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    formData.delete('paths');
    formData.delete('files');
    selectedFiles.forEach(file => {
      formData.append('paths', file.path ?? file.name);
      formData.append('files', file);
    });
    submit(formData, {
      method: (event.target as HTMLFormElement).getAttribute(
        'method',
      ) as HTMLFormMethod,
      action: (event.target as HTMLFormElement).getAttribute(
        'action',
      ) as string,
      encType: (event.target as HTMLFormElement).getAttribute(
        'enctype',
      ) as FormEncType,
    });
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Upload objects"
      content={
        <Stack spacing={2} height={218}>
          <DropzoneContainer $isDragActive={isDragActive} {...getRootProps()}>
            <input {...getInputProps({ name: 'files' })} />
            <Typography variant="body2">
              {isDragActive
                ? t('dropFilesToUpload')
                : t('dragAndDropOrClickToUploadFiles')}
            </Typography>
          </DropzoneContainer>
          <List
            dense
            sx={{ height: 124, overflowY: 'auto' }}
            hidden={directories.length < 1 && files.length < 1}
          >
            {directories.map(dirName => (
              <ListItem
                key={dirName}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={t('removeFolder')}
                    onClick={() =>
                      setSelectedFiles(previousFiles =>
                        previousFiles.filter(
                          file => !file.path?.startsWith(`/${dirName}`),
                        ),
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <NoWrapListItemText>{dirName}</NoWrapListItemText>
              </ListItem>
            ))}
            {files.map(fileName => (
              <ListItem
                key={fileName}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={t('removeFile')}
                    onClick={() =>
                      setSelectedFiles(previousFiles =>
                        previousFiles.filter(file => file.name !== fileName),
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <NoWrapListItemText>{fileName}</NoWrapListItemText>
              </ListItem>
            ))}
          </List>
          <TextField fullWidth label={t('prefix')} name="userPrefix" />
        </Stack>
      }
      closeLink={withSearchParam('upload', null)}
      method="POST"
      action={`/s3/buckets/${bucketName}/upload?prefix=${prefix}`}
      encType="multipart/form-data"
      onSubmit={handleSubmit as unknown as FormEventHandler<HTMLDivElement>}
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          {t('upload')}
        </Button>
      }
    />
  );
};

export default UploadObjectsDialog;
