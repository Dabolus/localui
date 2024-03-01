import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { getAwsClient } from '~/src/aws/server';
import { base64UrlEncode } from '~/src/utils';

export async function action({ request, params }: ActionFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const formData = await request.formData();
  const s3Client = getAwsClient('s3', searchParams.get('endpoint'));
  const providedName = formData
    .get('name')
    ?.toString()
    .trim()
    // Remove leading and trailing slashes
    .replace(/^\/+|\/+$/g, '');
  const prefix = searchParams.get('prefix');
  const fullName = `${prefix ?? ''}${providedName ?? ''}/`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: params.id,
      Key: fullName,
    }),
  );

  return redirect(`/s3/buckets/${params.id}/${base64UrlEncode(fullName)}`);
}
