import {
  DeleteObjectsCommand,
  ListObjectVersionsCommand,
  ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { getAwsClient } from '~/src/aws/server';
import { base64UrlDecode, base64UrlEncode } from '~/src/utils';

export const deleteObjectsAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const formData = await request.formData();
  const bucket = params.id;
  const key = params.key ? base64UrlDecode(params.key) : undefined;
  const prefix = key?.slice(0, key?.lastIndexOf('/') + 1);
  const s3Client = getAwsClient('s3', searchParams.get('endpoint'));
  const objectsToDelete = formData.get('names')?.toString().split(',') ?? [];
  const versionsToDelete = (
    await Promise.all(
      objectsToDelete.map(async name => {
        const { Versions } = await s3Client.send(
          new ListObjectVersionsCommand({
            Bucket: bucket,
            Prefix: name,
          }),
        );
        return Versions?.filter(version => version.Key?.startsWith(name)) ?? [];
      }),
    )
  ).flat() as ObjectIdentifier[];
  const redirectPath = `/s3/buckets/${bucket}${prefix ? `/${base64UrlEncode(prefix)}` : ''}`;

  if (versionsToDelete.length < 1) {
    return redirect(redirectPath);
  }

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: versionsToDelete,
      },
    }),
  );

  return redirect(redirectPath);
};
