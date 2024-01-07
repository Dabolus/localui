import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface DeleteTablesDialogProps {
  open: boolean;
  tables: string[];
}

const DeleteTablesDialog: FunctionComponent<DeleteTablesDialogProps> = ({
  open,
  tables,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title={t('deleteTablesConfirmationTitle')}
      content={t('deleteTablesConfirmationContent')}
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action="/dynamodb/tables"
      buttons={
        <>
          <input type="hidden" name="names" value={tables.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            {t('delete')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteTablesDialog;
