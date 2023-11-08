import { FunctionComponent, useState } from 'react';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { SerializeFrom } from '@remix-run/server-runtime';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import { loader } from './route';

export interface CreateQueueDialogProps {
  open: boolean;
  existingQueues: SerializeFrom<typeof loader>['queues'];
}

const fifoSuffix = '.fifo';

const CreateQueueDialog: FunctionComponent<CreateQueueDialogProps> = ({
  open,
  existingQueues,
}) => {
  const { withSearchParam } = useLinkUtils();
  const [isFifo, setIsFifo] = useState(false);
  const [providedDlqName, setProvidedDlqName] = useState('');
  const dlqName = `${providedDlqName}${isFifo ? fifoSuffix : ''}`;
  const maxNameLength = isFifo ? 80 - fifoSuffix.length : 80;
  const availableDlqs = isFifo
    ? existingQueues
        .filter(queue => queue.QueueName.endsWith(fifoSuffix))
        .map(queue => queue.QueueName.slice(0, -fifoSuffix.length))
    : existingQueues
        .filter(queue => !queue.QueueName.endsWith(fifoSuffix))
        .map(queue => queue.QueueName);
  const dlqExists = availableDlqs.includes(providedDlqName);

  const computeHelperText = () => {
    if (!providedDlqName) {
      return 'No DLQ will be created';
    }
    return dlqExists
      ? `The queue "${dlqName}" will be used as DLQ`
      : `A queue named "${dlqName}" will be created and used as DLQ`;
  };

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
          <Stack mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  name="fifo"
                  onChange={event => setIsFifo(event.target.checked)}
                />
              }
              label="First-in-first-out"
            />
            <FormControlLabel
              control={<Checkbox name="contentBasedDeduplication" />}
              label="Content-based deduplication"
            />
            <FormControlLabel
              control={<Checkbox name="sqsManagedSseEnabled" />}
              label="SQS-managed server-side encryption"
            />
          </Stack>
          <Autocomplete
            freeSolo
            disableClearable
            options={availableDlqs}
            renderInput={params => (
              <TextField
                {...params}
                label="Dead-letter queue"
                name="dlqName"
                helperText={computeHelperText()}
                inputProps={{
                  ...params.inputProps,
                  // Queues can only contain alphanumeric characters, hyphens, or underscores. 1 to 80 in length
                  pattern: `^[\\w\\-]{1,${maxNameLength}}$`,
                  minLength: 1,
                  maxLength: maxNameLength,
                }}
                {...(isFifo && {
                  InputProps: {
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        {fifoSuffix}
                      </InputAdornment>
                    ),
                  },
                })}
              />
            )}
            inputValue={providedDlqName}
            onInputChange={(_, newValue) => setProvidedDlqName(newValue)}
            sx={{ mt: 1, mb: 1.5 }}
          />
          <TextField
            fullWidth
            label="Max receive count"
            name="maxReceiveCount"
            type="number"
            disabled={!providedDlqName}
            inputProps={{ min: 1, max: 1000 }}
            sx={{ mb: 2 }}
          />
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
