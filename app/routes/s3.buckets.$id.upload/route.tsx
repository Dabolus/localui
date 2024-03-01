import path from 'node:path';
import { PassThrough } from 'node:stream';
import { Upload } from '@aws-sdk/lib-storage';
import {
  ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData,
  writeAsyncIterableToWritable,
} from '@remix-run/node';
import { getAwsClient } from '~/src/aws/server';
import { base64UrlEncode } from '~/src/utils';

const textDecoder = new TextDecoder();

export async function action({ request, params }: ActionFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const s3Client = getAwsClient('s3', searchParams.get('endpoint'));
  const prefixParts = [
    searchParams
      .get('prefix')
      ?.trim()
      // Remove leading and trailing slashes
      .replace(/^\/+|\/+$/g, ''),
  ];

  const paths: Record<string, string> = {};

  await unstable_parseMultipartFormData(
    request,
    async ({ name, contentType, data, filename }) => {
      if (name === 'userPrefix') {
        for await (const userPrefixData of data) {
          const decodedUserPrefix = textDecoder.decode(userPrefixData);
          prefixParts.push(
            decodedUserPrefix
              .trim()
              // Remove leading and trailing slashes
              .replace(/^\/+|\/+$/g, ''),
          );
        }
      }
      if (name === 'paths') {
        for await (const pathData of data) {
          const decodedPath = textDecoder.decode(pathData);
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
      const key = [...prefixParts, paths[filename] ?? filename]
        .filter(Boolean)
        .join('/');

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

  const finalPrefix = prefixParts.filter(Boolean).join('/') + '/';
  return redirect(
    `/s3/buckets/${params.id}${finalPrefix ? `/${base64UrlEncode(finalPrefix)}` : ''}`,
  );
}
