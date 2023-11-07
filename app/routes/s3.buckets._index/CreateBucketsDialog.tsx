import { ChangeEvent, FunctionComponent, useState } from 'react';
import { Autocomplete, Button, Chip, TextField } from '@mui/material';
import { awsRegionsWithContinents } from '~/src/aws/common';
import ConfirmationDialog from '~/src/components/ConfirmationDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';

export interface CreateBucketsDialogProps {
  open: boolean;
}

const CreateBucketsDialog: FunctionComponent<CreateBucketsDialogProps> = ({
  open,
}) => {
  const { withSearchParam } = useLinkUtils();
  const [names, setNames] = useState<string[]>([]);
  const [namesTextField, setNamesTextField] = useState<string>('');

  return (
    <ConfirmationDialog
      open={open}
      title="Create buckets"
      content={
        <>
          <Autocomplete
            multiple
            options={[]}
            value={names}
            onChange={(_event, value) => setNames(value)}
            freeSolo
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip size="small" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={params => (
              <>
                <input type="hidden" name="names" value={names.join(',')} />
                <TextField
                  {...params}
                  required
                  autoFocus
                  label="Bucket names"
                  inputProps={{
                    ...params.inputProps,
                    required: names.length < 1,
                    // See: https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
                    pattern: '^[a-z0-9][a-z0-9.\\-]{1,61}[a-z0-9]$',
                    minLength: 3,
                    maxLength: 63,
                    value: namesTextField,
                    onChange: event => {
                      setNamesTextField(
                        (event.target as HTMLInputElement).value.replace(
                          /[ ,]/g,
                          '',
                        ),
                      );
                      params.inputProps.onChange?.(
                        event as ChangeEvent<HTMLInputElement>,
                      );
                    },
                  }}
                  onKeyDown={event => {
                    const inputValue = (
                      event.target as HTMLInputElement
                    ).value.replace(/[ ,]/g, '');
                    // On enter, space, or comma, add a chip. When pressing enter,
                    // the form will also be submitted taking into account the newly
                    // added chip
                    if (
                      event.key === 'Enter' ||
                      event.key === ' ' ||
                      event.key === ','
                    ) {
                      event.stopPropagation();
                      if ((event.target as HTMLInputElement).reportValidity()) {
                        setNames(previousNames => [
                          ...previousNames,
                          inputValue,
                        ]);
                        setNamesTextField('');
                      }
                    }
                    // On backspace, if the input is empty, remove the last chip
                    if (event.key === 'Backspace') {
                      event.stopPropagation();
                      if (!inputValue) {
                        setNames(previousNames => previousNames.slice(0, -1));
                      }
                    }
                  }}
                  onBlur={event => {
                    if (event.target.value && event.target.reportValidity()) {
                      setNames(previousNames => [
                        ...previousNames,
                        namesTextField,
                      ]);
                      setNamesTextField('');
                    }
                  }}
                />
              </>
            )}
            sx={{ mt: 1 }}
          />
          <Autocomplete
            options={awsRegionsWithContinents}
            groupBy={option => option.continent}
            getOptionLabel={option =>
              `${option.zone ?? option.continent} (${option.region}) ${
                option.id
              }`
            }
            defaultValue={awsRegionsWithContinents[0]}
            renderInput={params => {
              const optionName = params.inputProps.value as string;
              const optionValue = optionName.slice(
                optionName.lastIndexOf(' ') + 1,
              );
              return (
                <>
                  <input name="region" type="hidden" value={optionValue} />
                  <TextField {...params} required label="Region" />
                </>
              );
            }}
            sx={{ mt: 3 }}
          />
        </>
      }
      closeLink={withSearchParam('create', null)}
      method="POST"
      action="/s3/buckets"
      buttons={
        <Button type="submit" variant="contained" color="secondary">
          Create
        </Button>
      }
    />
  );
};

export default CreateBucketsDialog;
