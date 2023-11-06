import { ChangeEvent, FunctionComponent, useState } from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { awsRegionsWithContinents } from '~/src/aws/common';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface CreateTableDialogProps {
  open: boolean;
}

const CreateTableDialog: FunctionComponent<CreateTableDialogProps> = ({
  open,
}) => {
  const { withSearchParam } = useLinkUtils();

  return (
    <ConfirmationDialog
      open={open}
      title="Create table"
      content={
        <Stack mt={2} spacing={2}>
          <TextField fullWidth required label="Table name" name="name" />
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              required
              label="Partition key"
              name="partitionKeyName"
            />
            <FormControl sx={{ width: 160 }} required>
              <InputLabel id="partition-key-type-label">Type</InputLabel>
              <Select
                labelId="partition-key-type-label"
                size="small"
                label="Type"
                name="partitionKeyType"
                defaultValue="S"
              >
                <MenuItem value="S">String</MenuItem>
                <MenuItem value="N">Number</MenuItem>
                <MenuItem value="B">Binary</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label="Sort key" name="sortKeyName" />
            <FormControl sx={{ width: 160 }}>
              <InputLabel id="sort-key-type-label">Type</InputLabel>
              <Select
                labelId="sort-key-type-label"
                size="small"
                label="Type"
                name="sortKeyType"
                defaultValue="S"
              >
                <MenuItem value="S">String</MenuItem>
                <MenuItem value="N">Number</MenuItem>
                <MenuItem value="B">Binary</MenuItem>
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
          Create
        </Button>
      }
    />
  );
};

export default CreateTableDialog;
