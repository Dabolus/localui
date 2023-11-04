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
  const { withSearchParams } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Delete selected buckets?"
      content="This action cannot be undone."
      closeLink={withSearchParams('/s3/buckets', previousParams => {
        previousParams.delete('delete');
        return previousParams;
      })}
      method="DELETE"
      action="/s3/buckets/delete"
      buttons={
        <>
          <input type="hidden" name="ids" value={buckets.join(',')} />
          <Button type="submit" variant="contained" color="error">
            Delete
          </Button>
        </>
      }
    />
  );
};

export default DeleteBucketsDialog;
