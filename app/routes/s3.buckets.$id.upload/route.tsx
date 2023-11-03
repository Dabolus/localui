import path from 'node:path';
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

const pathDecoder = new TextDecoder();

export async function action({ request, params }: ActionFunctionArgs) {
  const [s3Client] = setupAwsClients('s3') as [S3Client];
  const { searchParams } = new URL(request.url);

  const paths: Record<string, string> = {};

  await unstable_parseMultipartFormData(
    request,
    async ({ name, contentType, data, filename }) => {
      if (name === 'paths') {
        for await (const pathData of data) {
          const decodedPath = pathDecoder.decode(pathData);
          paths[path.basename(decodedPath)] = decodedPath.startsWith('/')
            ? decodedPath.slice(1)
            : decodedPath;
        }
        return null;
      }

      if (name !== 'files' || !filename) {
        return null;
      }

      const stream = new PassThrough();
      const writePromise = writeAsyncIterableToWritable(data, stream);
      const key = `${searchParams.get('prefix') ?? ''}${
        paths[filename] ?? filename
      }`;

      const multipartUpload = new Upload({
        client: s3Client,
        params: {
          Bucket: params.id,
          Key: key,
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
