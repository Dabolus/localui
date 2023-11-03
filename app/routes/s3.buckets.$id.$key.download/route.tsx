import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { LoaderFunctionArgs } from '@remix-run/node';
import { base64UrlDecode } from '~/src/utils';
import { setupAwsClients } from '~/src/aws/server';

export async function loader({ params }: LoaderFunctionArgs) {
  const key = base64UrlDecode(params.key ?? '');
  const prefix = key.slice(0, key.lastIndexOf('/') + 1);
  const baseName = key.replace(prefix, '');
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const getObjectResponse = await s3Client.send(
    new GetObjectCommand({
      Bucket: params.id,
      Key: key,
    }),
  );
  return new Response(getObjectResponse.Body as ReadableStream, {
    headers: {
      ...(getObjectResponse.ContentType && {
        'Content-Type': getObjectResponse.ContentType,
      }),
      'Content-Disposition': `attachment; filename="${baseName}"`,
    },
  });
}
