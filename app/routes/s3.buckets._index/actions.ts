import {
  S3Client,
  CreateBucketCommand,
  BucketLocationConstraint,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectVersionsCommand,
  ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { setupAwsClients } from '~/src/aws/server';

const emptyBucket = async (client: S3Client, bucket: string) => {
  // Delete all versions of all objects in the bucket
  const { Versions } = await client.send(
    new ListObjectVersionsCommand({
      Bucket: bucket,
    }),
  );

  const versionsToDelete = (Versions ?? []).filter(
    version => !!version.Key,
  ) as ObjectIdentifier[];

  if (versionsToDelete.length < 1) {
    return;
  }

  const result = await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: versionsToDelete,
      },
    }),
  );

  return result;
};

export const createBucketsAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const bucketsToCreate = formData.get('names')?.toString().split(',') ?? [];
  const providedRegion = formData.get('region') ?? undefined;

  await Promise.all(
    bucketsToCreate.map(bucket =>
      s3Client.send(
        new CreateBucketCommand({
          Bucket: bucket,
          CreateBucketConfiguration: {
            LocationConstraint:
              providedRegion === 'us-east-1'
                ? undefined
                : (providedRegion as BucketLocationConstraint),
          },
        }),
      ),
    ),
  );

  return redirect('/s3/buckets');
};

export const emptyBucketsAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const bucketsToEmpty = formData.get('names')?.toString().split(',') ?? [];

  await Promise.all(
    bucketsToEmpty.map(bucket => emptyBucket(s3Client, bucket)),
  );

  return redirect('/s3/buckets');
};

export const deleteBucketsAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const bucketsToDelete = formData.get('names')?.toString().split(',') ?? [];

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
};
