import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { setupAwsClients } from '~/src/aws/server';
import { base64UrlEncode } from '~/src/utils';

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const { searchParams } = new URL(request.url);
  const providedName = formData.get('name')?.toString();
  const fullName = providedName?.endsWith('/')
    ? providedName
    : `${providedName ?? ''}/`;
  const prefix = searchParams.get('prefix') ?? '';

  await s3Client.send(
    new PutObjectCommand({
      Bucket: params.id,
      Key: `${searchParams.get('prefix') ?? ''}${fullName}`,
    }),
  );

  return redirect(
    `/s3/buckets/${params.id}${prefix ? `/${base64UrlEncode(prefix)}` : ''}`,
  );
}
