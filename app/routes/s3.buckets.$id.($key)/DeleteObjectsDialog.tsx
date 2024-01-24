import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import { useLocation } from '@remix-run/react';

export interface DeleteObjectsDialogProps {
  open: boolean;
  objects: string[];
}

const DeleteObjectsDialog: FunctionComponent<DeleteObjectsDialogProps> = ({
  open,
  objects,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();
  const location = useLocation();

  return (
    <ConfirmationDialog
      open={open}
      title={t('deleteObjectsConfirmationTitle', { count: objects.length })}
      content={t('deleteObjectsConfirmationContent', { count: objects.length })}
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action={`${location.pathname}${location.search}`}
      buttons={
        <>
          <input type="hidden" name="names" value={objects.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            {t('delete')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteObjectsDialog;
