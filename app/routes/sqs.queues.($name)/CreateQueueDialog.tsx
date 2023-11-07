import { FunctionComponent, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface CreateQueueDialogProps {
  open: boolean;
}

const fifoSuffix = '.fifo';

const CreateQueueDialog: FunctionComponent<CreateQueueDialogProps> = ({
  open,
}) => {
  const { withSearchParam } = useLinkUtils();
  const [isFifo, setIsFifo] = useState(false);
  const maxNameLength = isFifo ? 80 - fifoSuffix.length : 80;

  return (
    <ConfirmationDialog
      open={open}
      title="Create queue"
      content={
        <>
          <TextField
            fullWidth
            required
            autoFocus
            label="Queue name"
            name="name"
            sx={{ mt: 2 }}
            inputProps={{
              // Queues can only contain alphanumeric characters, hyphens, or underscores. 1 to 80 in length
              pattern: `^[\\w\\-]{1,${maxNameLength}}$`,
              minLength: 1,
              maxLength: maxNameLength,
            }}
            {...(isFifo && {
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">{fifoSuffix}</InputAdornment>
                ),
              },
            })}
          />
          <Stack mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="fifo"
                  onChange={event => setIsFifo(event.target.checked)}
                />
              }
              label="FIFO"
            />
            <FormControlLabel
              control={<Checkbox name="contentBasedDeduplication" />}
              label="Content-based deduplication"
            />
          </Stack>
        </>
      }
      closeLink={withSearchParam('create', null)}
      method="POST"
      action="/sqs/queues"
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          Create
        </Button>
      }
    />
  );
};

export default CreateQueueDialog;
