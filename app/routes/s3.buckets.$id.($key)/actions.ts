import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectVersionsCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
  S3Client,
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

// "rename" an S3 object, i.e. copy the object to a new key and delete the old object
const renameObject = async (
  s3Client: S3Client,
  bucket: string,
  oldKey: string,
  newKey: string,
) => {
  // Copy the object to the new key
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${oldKey}`,
      Key: newKey,
    }),
  );

  // Delete the old object
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: oldKey,
    }),
  );
};

export const renameObjectAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const formData = await request.formData();
  const bucket = params.id ?? '';
  const key = params.key ? base64UrlDecode(params.key) : undefined;
  const prefix = key?.slice(0, key?.lastIndexOf('/') + 1);
  const s3Client = getAwsClient('s3', searchParams.get('endpoint'));
  const oldFullName = formData.get('name')?.toString() ?? '';
  const newName = formData
    .get('newName')
    ?.toString()
    .trim()
    // Remove leading and trailing slashes
    .replace(/^\/+|\/+$/g, '');
  // Replace the last part of the oldFullName with newName, preserving the trailing slash if it exists
  const newFullName = oldFullName.replace(/[^/]+(\/?)$/, `${newName}$1`);

  // If the new name is the same as the old name, do nothing
  if (oldFullName === newFullName) {
    return redirect(
      `/s3/buckets/${bucket}${prefix ? `/${base64UrlEncode(prefix)}` : ''}`,
    );
  }

  // If the object in question is a folder, we need to rename all objects with the old prefix to the new prefix.
  // otherwise, we just need to rename the object itself.
  if (oldFullName.endsWith('/')) {
    const listObjectsResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: oldFullName,
      }),
    );

    await Promise.all(
      listObjectsResponse.Contents?.map(async ({ Key }) => {
        const newKey = Key?.replace(oldFullName, newFullName);
        await renameObject(s3Client, bucket, Key ?? '', newKey ?? '');
      }) ?? [],
    );
  } else {
    await renameObject(s3Client, bucket, oldFullName, newFullName);
  }

  return redirect(
    `/s3/buckets/${bucket}${prefix ? `/${base64UrlEncode(prefix)}` : ''}`,
  );
};
