import {
  S3Client,
  CreateBucketCommand,
  BucketLocationConstraint,
} from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import {
  Typography,
  Button,
  TextField,
  Stack,
  Card,
  CardHeader,
  CardContent,
  Autocomplete,
} from '@mui/material';
import CurrentPath from '~/src/components/CurrentPath';
import { setupAwsClients } from '~/src/aws/server';
import { awsRegionsWithContinents } from '~/src/aws/common';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const providedRegion = formData.get('region') ?? undefined;
  const response = await s3Client.send(
    new CreateBucketCommand({
      Bucket: formData.get('name') as string,
      CreateBucketConfiguration: {
        LocationConstraint:
          providedRegion === 'us-east-1'
            ? undefined
            : (providedRegion as BucketLocationConstraint),
      },
    }),
  );

  if (response.$metadata.httpStatusCode !== 200) {
    throw new Error('Failed to create bucket');
  }

  return redirect('/s3/buckets');
}

export default function CreateBucket() {
  return (
    <>
      <CurrentPath items={['s3', 'buckets', 'create']} />
      <Stack
        p={2}
        spacing={2}
        alignItems="flex-start"
        width="100%"
        maxWidth={640}
        component={Form}
        method="POST"
        action="/s3/buckets/create"
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Create bucket
        </Typography>
        <Card sx={{ width: '100%' }}>
          <CardHeader title="General configuration" />
          <CardContent>
            <Stack spacing={4}>
              <TextField required label="Bucket name" name="name" />
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
              />
            </Stack>
          </CardContent>
        </Card>
        <Stack
          direction="row"
          spacing={2}
          width="100%"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button variant="text">Cancel</Button>
          <Button type="submit" variant="contained" color="secondary">
            Create bucket
          </Button>
        </Stack>
      </Stack>
    </>
  );
}
