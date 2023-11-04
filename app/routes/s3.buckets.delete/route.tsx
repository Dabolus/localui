import { DeleteBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { emptyBucket, setupAwsClients } from '~/src/aws/server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const bucketsToDelete = formData.get('ids')?.toString().split(',') ?? [];

  await Promise.all(
    bucketsToDelete.map(async bucket => {
      // Empty the bucket first
      await emptyBucket(s3Client, bucket);
      // Then delete it
      await s3Client.send(
        new DeleteBucketCommand({
          Bucket: bucket,
        }),
      );
    }),
  );

  return redirect('/s3/buckets');
}