import { Button } from '@mui/material';
import { FunctionComponent } from 'react';
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
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Delete selected tables?"
      content="This action cannot be undone."
      closeLink={withSearchParam('delete', null)}
      method="DELETE"
      action="/dynamodb/tables"
      buttons={
        <>
          <input type="hidden" name="names" value={tables.join(',')} />
          <Button type="submit" variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </>
      }
    />
  );
};

export default DeleteTablesDialog;
