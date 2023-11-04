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
  const { withSearchParams } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Empty selected buckets?"
      content="This action cannot be undone."
      closeLink={withSearchParams('/s3/buckets', previousParams => {
        previousParams.delete('empty');
        return previousParams;
      })}
      method="DELETE"
      action="/s3/buckets/empty"
      buttons={
        <>
          <input type="hidden" name="ids" value={buckets.join(',')} />
          <Button type="submit" variant="contained" color="error">
            Empty
          </Button>
        </>
      }
    />
  );
};

export default EmptyBucketsDialog;
