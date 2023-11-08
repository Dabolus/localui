import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
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
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Delete selected queues?"
      content="This action cannot be undone."
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action="/sqs/queues"
      buttons={
        <>
          <input type="hidden" name="names" value={queues.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </>
      }
    />
  );
};

export default DeleteQueuesDialog;
