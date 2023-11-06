import { Button, TextField } from '@mui/material';
import { FunctionComponent } from 'react';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface CreateFolderDialogProps {
  open: boolean;
  bucketName: string;
  prefix?: string;
}

const CreateFolderDialog: FunctionComponent<CreateFolderDialogProps> = ({
  open,
  bucketName,
  prefix = '',
}) => {
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Create folder"
      content={
        <>
          <TextField
            fullWidth
            required
            label="Folder name"
            name="name"
            sx={{ mt: 2 }}
          />
        </>
      }
      closeLink={withSearchParam('create-folder', null)}
      method="POST"
      action={`/s3/buckets/${bucketName}/create-folder?prefix=${prefix}`}
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          Create folder
        </Button>
      }
    />
  );
};

export default CreateFolderDialog;
