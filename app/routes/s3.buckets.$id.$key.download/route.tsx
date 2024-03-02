import { GetObjectCommand } from '@aws-sdk/client-s3';
import { LoaderFunctionArgs } from '@remix-run/node';
import { base64UrlDecode, ignoreSearchChanges } from '~/src/utils';
import { getAwsClient } from '~/src/aws/server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const isPreview = searchParams.has('preview');
  const key = base64UrlDecode(params.key!);
  const prefix = key.slice(0, key.lastIndexOf('/') + 1);
  const baseName = key.replace(prefix, '');
  const s3Client = getAwsClient('s3', searchParams.get('endpoint'));
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
      'Content-Disposition': `${
        isPreview ? 'inline' : 'attachment'
      }; filename="${baseName}"`,
    },
  });
};

export const shouldRevalidate = ignoreSearchChanges;
