import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
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
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Delete selected buckets?"
      content="This action cannot be undone."
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action="/s3/buckets"
      buttons={
        <>
          <input type="hidden" name="names" value={buckets.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </>
      }
    />
  );
};

export default DeleteBucketsDialog;
