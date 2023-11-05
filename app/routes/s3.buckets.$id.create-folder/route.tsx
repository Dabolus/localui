import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { setupAwsClients } from '~/src/aws/server';

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const providedPrefix = formData.get('prefix')?.toString();
  const fullPrefix = providedPrefix?.endsWith('/')
    ? providedPrefix
    : `${providedPrefix ?? ''}/`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: params.id,
      Key: fullPrefix,
    }),
  );

  return redirect(`/s3/buckets/${params.id}`);
}
