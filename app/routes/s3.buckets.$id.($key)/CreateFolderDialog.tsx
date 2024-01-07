import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
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
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title={t('createFolder')}
      content={
        <TextField
          fullWidth
          required
          label={t('folderName')}
          name="name"
          sx={{ mt: 2 }}
        />
      }
      closeLink={withSearchParam('create-folder', null)}
      method="POST"
      action={`/s3/buckets/${bucketName}/create-folder?prefix=${prefix}`}
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          {t('createFolder')}
        </Button>
      }
    />
  );
};

export default CreateFolderDialog;
