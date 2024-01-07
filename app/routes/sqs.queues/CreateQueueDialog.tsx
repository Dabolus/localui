import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      return t('dlqHintNone');
    }
    return dlqExists
      ? t('dlqHintExisting', { dlqName })
      : t('dlqHintNew', { dlqName });
  };

  return (
    <ConfirmationDialog
      open={open}
      title={t('createQueue')}
      content={
        <>
          <TextField
            fullWidth
            required
            autoFocus
            label={t('queueName')}
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
              label={t('firstInFirstOut')}
            />
            <FormControlLabel
              control={<Checkbox name="contentBasedDeduplication" />}
              label={t('contentBasedDeduplication')}
            />
            <FormControlLabel
              control={<Checkbox name="sqsManagedSseEnabled" />}
              label={t('sqsManagedSse')}
            />
          </Stack>
          <Autocomplete
            freeSolo
            disableClearable
            options={availableDlqs}
            renderInput={params => (
              <TextField
                {...params}
                label={t('deadLetterQueue')}
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
            label={t('maxReceiveCount')}
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
          {t('create')}
        </Button>
      }
    />
  );
};

export default CreateQueueDialog;
