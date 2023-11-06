import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
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
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Empty selected buckets?"
      content="This action cannot be undone."
      closeLink={withSearchParam('empty', null)}
      method="PUT"
      action="/s3/buckets"
      buttons={
        <>
          <input type="hidden" name="names" value={buckets.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            Empty
          </Button>
        </>
      }
    />
  );
};

export default EmptyBucketsDialog;
