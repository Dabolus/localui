import { PassThrough } from 'node:stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData,
  writeAsyncIterableToWritable,
} from '@remix-run/node';
import { setupAwsClients } from '~/src/aws/server';

export async function action({ request, params }: ActionFunctionArgs) {
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const { searchParams } = new URL(request.url);

  await unstable_parseMultipartFormData(
    request,
    async ({ name, contentType, data, filename }) => {
      if (name !== 'files') {
        return;
      }

      const stream = new PassThrough();
      const writePromise = writeAsyncIterableToWritable(data, stream);

      const multipartUpload = new Upload({
        client: s3Client,
        params: {
          Bucket: params.id,
          Key: `${searchParams.get('prefix') ?? ''}${filename}`,
          Body: stream,
          ContentType: contentType,
        },
      });

      await Promise.all([writePromise, multipartUpload.done()]);

      return null;
    },
  );

  return redirect(`/s3/buckets/${params.id}`);
}
