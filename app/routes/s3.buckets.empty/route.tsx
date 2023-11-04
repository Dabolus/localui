import { S3Client } from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { emptyBucket, setupAwsClients } from '~/src/aws/server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const bucketsToEmpty = formData.get('ids')?.toString().split(',') ?? [];

  await Promise.all(
    bucketsToEmpty.map(bucket => emptyBucket(s3Client, bucket)),
  );

  return redirect('/s3/buckets');
}
