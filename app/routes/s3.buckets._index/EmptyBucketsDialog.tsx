import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface EmptyBucketsDialogProps {
  open: boolean;
  buckets: string[];
}

const EmptyBucketsDialog: FunctionComponent<EmptyBucketsDialogProps> = ({
  open,
  buckets,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title={t('emptyBucketsConfirmationTitle', { count: buckets.length })}
      content={t('emptyBucketsConfirmationContent', { count: buckets.length })}
      closeLink={withSearchParam('empty', null)}
      method="PUT"
      action="/s3/buckets"
      buttons={
        <>
          <input type="hidden" name="names" value={buckets.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            {t('empty')}
          </Button>
        </>
      }
    />
  );
};

export default EmptyBucketsDialog;
