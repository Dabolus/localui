import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface CreateTableDialogProps {
  open: boolean;
}

const CreateTableDialog: FunctionComponent<CreateTableDialogProps> = ({
  open,
}) => {
  const { t } = useTranslation();
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title={t('createTable')}
      content={
        <Stack mt={2} spacing={2}>
          <TextField
            fullWidth
            required
            autoFocus
            label={t('tableName')}
            name="name"
          />
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              required
              label={t('partitionKey')}
              name="partitionKeyName"
            />
            <FormControl sx={{ width: 160 }} required>
              <InputLabel id="partition-key-type-label">{t('type')}</InputLabel>
              <Select
                labelId="partition-key-type-label"
                size="small"
                label={t('type')}
                name="partitionKeyType"
                defaultValue="S"
              >
                <MenuItem value="S">{t('string')}</MenuItem>
                <MenuItem value="N">{t('number')}</MenuItem>
                <MenuItem value="B">{t('binary')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label="Sort key" name="sortKeyName" />
            <FormControl sx={{ width: 160 }}>
              <InputLabel id="sort-key-type-label">{t('type')}</InputLabel>
              <Select
                labelId="sort-key-type-label"
                size="small"
                label={t('type')}
                name="sortKeyType"
                defaultValue="S"
              >
                <MenuItem value="S">{t('string')}</MenuItem>
                <MenuItem value="N">{t('number')}</MenuItem>
                <MenuItem value="B">{t('binary')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      }
      closeLink={withSearchParam('create', null)}
      method="POST"
      action="/dynamodb/tables"
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          {t('create')}
        </Button>
      }
    />
  );
};

export default CreateTableDialog;
