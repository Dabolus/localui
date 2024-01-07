import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface DeleteQueuesDialogProps {
  open: boolean;
  queues: string[];
}

const DeleteQueuesDialog: FunctionComponent<DeleteQueuesDialogProps> = ({
  open,
  queues,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title={t('deleteQueuesConfirmationTitle')}
      content={t('deleteQueuesConfirmationContent')}
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action="/sqs/queues"
      buttons={
        <>
          <input type="hidden" name="names" value={queues.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            {t('delete')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteQueuesDialog;
