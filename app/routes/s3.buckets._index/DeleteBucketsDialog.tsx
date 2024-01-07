import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface DeleteBucketsDialogProps {
  open: boolean;
  buckets: string[];
}

const DeleteBucketsDialog: FunctionComponent<DeleteBucketsDialogProps> = ({
  open,
  buckets,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title={t('deleteBucketsConfirmationTitle')}
      content={t('deleteBucketsConfirmationContent')}
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action="/s3/buckets"
      buttons={
        <>
          <input type="hidden" name="names" value={buckets.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            {t('delete')}
          </Button>
        </>
      }
    />
  );
};

export default DeleteBucketsDialog;
