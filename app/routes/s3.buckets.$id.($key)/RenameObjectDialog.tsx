import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@remix-run/react';
import { Button, Stack, TextField } from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface RenameObjectDialogProps {
  open: boolean;
  object: string;
}

const RenameObjectDialog: FunctionComponent<RenameObjectDialogProps> = ({
  open,
  object,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();
  const location = useLocation();

  return (
    <ConfirmationDialog
      open={open}
      title={object.endsWith('/') ? t('renameFolder') : t('renameFile')}
      content={
        <Stack mt={2} spacing={2}>
          <TextField
            fullWidth
            disabled
            label={t('currentName')}
            value={object.split('/').filter(Boolean).pop()}
          />
          <TextField
            fullWidth
            required
            autoFocus
            label={t('newName')}
            name="newName"
          />
          <input type="hidden" name="name" value={object} />
        </Stack>
      }
      closeLink={withSearchParam('rename', null)}
      method="PATCH"
      action={`${location.pathname}${location.search}`}
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          {t('rename')}
        </Button>
      }
    />
  );
};

export default RenameObjectDialog;
